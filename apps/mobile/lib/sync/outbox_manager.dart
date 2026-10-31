import 'dart:convert';
import 'dart:math';
import 'package:crypto/crypto.dart';
import 'package:drift/drift.dart';
import 'package:uuid/uuid.dart';
import '../config/env.dart';
import '../core/utils/binary_codec.dart';
import '../database/local_database.dart';
import 'transport_adapter.dart';

class OutboxManager {
  final AppDatabase db;
  final TransportAdapter primaryTransport;
  final _random = Random();
  final _uuid = const Uuid();

  OutboxManager({
    required this.db,
    required this.primaryTransport,
  });

  /// Compute deterministic origin_id for idempotency
  String computeOriginId(int deviceId, int counter, int observedAtMin) {
    final bytes = utf8.encode('$deviceId:$counter:$observedAtMin');
    final digest = sha256.convert(bytes);
    return 'orig-${digest.toString().substring(0, 16)}';
  }

  /// Enqueue an incident report into the durable offline outbox
  Future<OutboxEntry> enqueueIncidentReport({
    required String reportId,
    required String reportCode,
    required String category,
    required String title,
    required String description,
    required double? latitude,
    required double? longitude,
    required int peopleAffected,
    required int casualties,
    String? photoPath,
    required DateTime observedAt,
    required int deviceNumericId,
    required String deviceCode,
    required String secretKey,
    required int counter,
  }) async {
    final now = DateTime.now().toUtc();
    final observedMin = observedAt.millisecondsSinceEpoch ~/ 60000;
    final originId = computeOriginId(deviceNumericId, counter, observedMin);

    // Map category to message_type integer
    final messageType = _categoryToMessageType(category);

    // Prepare binary key
    List<int> keyBytes;
    try {
      keyBytes = BinaryFrameCodec.fromHex(secretKey);
    } catch (_) {
      keyBytes = utf8.encode(secretKey);
    }

    // Encode 31-byte binary frame with HMAC-SHA256
    final rawFrame = BinaryFrameCodec.encodeFrame(
      deviceId: deviceNumericId,
      counter: counter,
      messageType: messageType,
      latitude: latitude,
      longitude: longitude,
      peopleAffected: peopleAffected,
      flags: casualties > 0 ? 0x02 : 0x01,
      observedAt: observedAt,
      key: keyBytes,
    );
    final rawHex = BinaryFrameCodec.toHex(rawFrame);

    final payloadMap = {
      'report_id': reportId,
      'report_code': reportCode,
      'category': category,
      'title': title,
      'description': description,
      'latitude': latitude,
      'longitude': longitude,
      'people_affected': peopleAffected,
      'casualties': casualties,
      'photo_path': photoPath,
      'counter': counter,
    };

    final entryId = _uuid.v4();
    final companion = OutboxEntriesCompanion.insert(
      id: entryId,
      originId: originId,
      deviceId: deviceCode,
      itemType: 'INCIDENT_REPORT',
      payloadJson: jsonEncode(payloadMap),
      rawPayloadHex: Value(rawHex),
      transportPreference: const Value('WIFI'),
      status: const Value('PENDING'),
      retryCount: const Value(0),
      createdAt: now,
      observedAt: observedAt,
    );

    await db.into(db.outboxEntries).insert(companion);
    return (await (db.select(db.outboxEntries)..where((tbl) => tbl.id.equals(entryId))).getSingle());
  }

  /// Enqueue an assignment acknowledgement into the outbox
  Future<OutboxEntry> enqueueAssignmentAcknowledgement({
    required String assignmentId,
    required String deviceCode,
    required String status,
    String? notes,
  }) async {
    final now = DateTime.now().toUtc();
    final entryId = _uuid.v4();
    final originId = 'orig-ack-$assignmentId-${now.millisecondsSinceEpoch}';

    final payloadMap = {
      'assignment_id': assignmentId,
      'status': status,
      'notes': notes,
    };

    final companion = OutboxEntriesCompanion.insert(
      id: entryId,
      originId: originId,
      deviceId: deviceCode,
      itemType: 'ASSIGNMENT_ACK',
      payloadJson: jsonEncode(payloadMap),
      transportPreference: const Value('WIFI'),
      status: const Value('PENDING'),
      retryCount: const Value(0),
      createdAt: now,
      observedAt: now,
    );

    await db.into(db.outboxEntries).insert(companion);
    return (await (db.select(db.outboxEntries)..where((tbl) => tbl.id.equals(entryId))).getSingle());
  }

  /// Process all pending outbox entries with exponential backoff and jitter
  Future<int> processPendingQueue() async {
    final now = DateTime.now().toUtc();
    final pendingItems = await (db.select(db.outboxEntries)
          ..where((tbl) =>
              tbl.status.equals('PENDING') &
              (tbl.nextRetryAt.isNull() | tbl.nextRetryAt.isSmallerOrEqualValue(now))))
        .get();

    int successCount = 0;

    for (final item in pendingItems) {
      // Mark as TRANSMITTING
      await (db.update(db.outboxEntries)..where((tbl) => tbl.id.equals(item.id))).write(
        const OutboxEntriesCompanion(status: Value('TRANSMITTING')),
      );

      final result = await primaryTransport.transmit(item);

      if (result.isSuccess) {
        // Mark as SYNCHRONIZED
        await (db.update(db.outboxEntries)..where((tbl) => tbl.id.equals(item.id))).write(
          OutboxEntriesCompanion(
            status: const Value('SYNCHRONIZED'),
            serverAckId: Value(result.serverAckId),
            syncedAt: Value(DateTime.now().toUtc()),
            lastError: const Value(null),
          ),
        );

        // Update corresponding local entity
        await _applyServerAckToLocalEntity(item, result);
        successCount++;
      } else {
        // Handle failure with exponential backoff + jitter
        final newRetryCount = item.retryCount + 1;
        if (newRetryCount >= item.maxRetries) {
          await (db.update(db.outboxEntries)..where((tbl) => tbl.id.equals(item.id))).write(
            OutboxEntriesCompanion(
              status: const Value('FAILED'),
              retryCount: Value(newRetryCount),
              lastError: Value(result.errorMessage),
            ),
          );
        } else {
          final backoffSeconds = min(
            Environment.maxRetryDelay.inSeconds,
            Environment.baseRetryDelay.inSeconds * pow(2, newRetryCount).toInt(),
          );
          final jitterSeconds = _random.nextDouble() * 1.5;
          final nextRetry = DateTime.now().toUtc().add(Duration(
                milliseconds: ((backoffSeconds + jitterSeconds) * 1000).toInt(),
              ));

          await (db.update(db.outboxEntries)..where((tbl) => tbl.id.equals(item.id))).write(
            OutboxEntriesCompanion(
              status: const Value('PENDING'),
              retryCount: Value(newRetryCount),
              nextRetryAt: Value(nextRetry),
              lastError: Value(result.errorMessage),
            ),
          );
        }
      }
    }

    return successCount;
  }

  /// Apply verified server acknowledgment to authoritative local database entities
  Future<void> _applyServerAckToLocalEntity(OutboxEntry entry, TransportResult result) async {
    final payload = jsonDecode(entry.payloadJson) as Map<String, dynamic>;

    if (entry.itemType == 'INCIDENT_REPORT') {
      final reportId = payload['report_id'] as String?;
      if (reportId != null) {
        await (db.update(db.incidentReports)..where((tbl) => tbl.id.equals(reportId))).write(
          IncidentReportsCompanion(
            syncStatus: const Value('SYNCHRONIZED'),
            syncedAt: Value(DateTime.now().toUtc()),
            syncError: const Value(null),
          ),
        );
      }
    } else if (entry.itemType == 'ASSIGNMENT_ACK') {
      final assignmentId = payload['assignment_id'] as String?;
      if (assignmentId != null) {
        await (db.update(db.localAssignments)..where((tbl) => tbl.id.equals(assignmentId))).write(
          LocalAssignmentsCompanion(
            serverConfirmed: const Value(true),
            acknowledgedByDevice: Value(entry.deviceId),
            status: Value(payload['status'] ?? 'ACKNOWLEDGED'),
          ),
        );
      }
    }
  }

  int _categoryToMessageType(String category) {
    switch (category.toUpperCase()) {
      case 'FLOOD_WATER_LEVEL':
        return 1;
      case 'ROAD_BLOCKED':
        return 2;
      case 'INFRASTRUCTURE_DAMAGE':
        return 3;
      case 'PEOPLE_TRAPPED':
      case 'SOS':
        return 4;
      case 'MEDICAL_EMERGENCY':
        return 5;
      default:
        return 1;
    }
  }
}
