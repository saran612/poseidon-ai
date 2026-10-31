import 'dart:convert';
import 'package:dio/dio.dart';
import '../config/env.dart';
import '../core/utils/binary_codec.dart';
import '../database/local_database.dart';

class TransportResult {
  final bool isSuccess;
  final String? serverAckId;
  final String? errorMessage;
  final bool isDuplicate;
  final Map<String, dynamic>? data;

  TransportResult({
    required this.isSuccess,
    this.serverAckId,
    this.errorMessage,
    this.isDuplicate = false,
    this.data,
  });

  factory TransportResult.success(String ackId, {bool isDuplicate = false, Map<String, dynamic>? data}) {
    return TransportResult(
      isSuccess: true,
      serverAckId: ackId,
      isDuplicate: isDuplicate,
      data: data,
    );
  }

  factory TransportResult.failure(String message) {
    return TransportResult(
      isSuccess: false,
      errorMessage: message,
    );
  }
}

/// Abstract transport adapter interface supporting multiple communication channels
abstract class TransportAdapter {
  String get transportName;
  Future<bool> isAvailable();
  Future<TransportResult> transmit(OutboxEntry entry);
}

/// Standard HTTPS REST Transport Adapter
class HttpTransportAdapter implements TransportAdapter {
  final Dio dio;
  final String baseUrl;

  HttpTransportAdapter({Dio? dioClient, String? url})
      : dio = dioClient ??
            Dio(BaseOptions(
              baseUrl: url ?? Environment.defaultBaseUrl,
              connectTimeout: Environment.connectTimeout,
              receiveTimeout: Environment.receiveTimeout,
            )),
        baseUrl = url ?? Environment.defaultBaseUrl;

  @override
  String get transportName => 'HTTP_REST';

  @override
  Future<bool> isAvailable() async {
    try {
      final resp = await dio.get('/api/info');
      return resp.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  @override
  Future<TransportResult> transmit(OutboxEntry entry) async {
    try {
      if (entry.itemType == 'ASSIGNMENT_ACK') {
        final payload = jsonDecode(entry.payloadJson) as Map<String, dynamic>;
        final assignmentId = payload['assignment_id'] as String;
        final response = await dio.post(
          '${Environment.apiV1Prefix}/assignments/$assignmentId/acknowledge',
          data: {
            'device_id': entry.deviceId,
            'status': payload['status'] ?? 'RECEIVED',
            'transport': 'WIFI',
            'notes': payload['notes'],
          },
        );

        if (response.statusCode == 200) {
          final data = response.data as Map<String, dynamic>;
          return TransportResult.success(
            data['server_received_at'] ?? 'server-ack-${DateTime.now().millisecondsSinceEpoch}',
            data: data,
          );
        } else {
          return TransportResult.failure('Server returned status ${response.statusCode}');
        }
      } else {
        // Evidence or Incident Report ingestion
        final payload = jsonDecode(entry.payloadJson) as Map<String, dynamic>;
        final rawHex = entry.rawPayloadHex ?? '';

        final response = await dio.post(
          '${Environment.apiV1Prefix}/evidence/ingest',
          data: {
            'transport': 'WIFI',
            'raw_payload_hex': rawHex,
            'incident_type': payload['category'] ?? 'FLOOD_WATER_LEVEL',
            'is_contradiction': false,
            'metadata': {
              'origin_id': entry.originId,
              'device_id': entry.deviceId,
              'client_message_id': entry.id,
              'title': payload['title'],
              'description': payload['description'],
              'photo_path': payload['photo_path'],
            },
          },
        );

        if (response.statusCode == 200) {
          final data = response.data as Map<String, dynamic>;
          final msgId = data['message_id'] as String? ?? entry.id;
          final isDup = data['is_transport_duplicate'] as bool? ?? false;
          return TransportResult.success(msgId, isDuplicate: isDup, data: data);
        } else {
          return TransportResult.failure('Server returned status ${response.statusCode}');
        }
      }
    } on DioException catch (e) {
      return TransportResult.failure('Network error: ${e.message}');
    } catch (e) {
      return TransportResult.failure('Transmission exception: $e');
    }
  }
}

/// Simulated Authenticated LoRa / SMS Gateway Adapter
class GatewayTransportAdapter implements TransportAdapter {
  final String _channelName;

  GatewayTransportAdapter(this._channelName);

  @override
  String get transportName => _channelName; // 'SMS_GATEWAY' or 'LORA_GATEWAY'

  @override
  Future<bool> isAvailable() async {
    // Available when configured with physical gateway or mesh relay
    return false;
  }

  @override
  Future<TransportResult> transmit(OutboxEntry entry) async {
    if (entry.rawPayloadHex == null) {
      return TransportResult.failure('Binary frame required for gateway transport');
    }
    // Encode for SMS or LoRa packet format with cryptographic HMAC tag preserved
    final rawBytes = BinaryFrameCodec.fromHex(entry.rawPayloadHex!);
    if (_channelName == 'SMS_GATEWAY') {
      final smsPayload = BinaryFrameCodec.encodeSmsPayload(rawBytes);
      return TransportResult.failure('No SMS transceiver attached for payload ($smsPayload)');
    }
    return TransportResult.failure('No physical LoRa modem connected');
  }
}

