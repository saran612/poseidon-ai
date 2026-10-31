import 'dart:convert';
import 'dart:typed_data';
import 'package:crypto/crypto.dart';

class DecodedBinaryFrame {
  final int version;
  final int deviceId;
  final int counter;
  final int messageType;
  final double? latitude;
  final double? longitude;
  final int peopleAffected;
  final int flags;
  final DateTime observedAt;
  final Uint8List hmacTag;
  final bool isMacValid;
  final Uint8List rawBytes;

  DecodedBinaryFrame({
    required this.version,
    required this.deviceId,
    required this.counter,
    required this.messageType,
    this.latitude,
    this.longitude,
    required this.peopleAffected,
    required this.flags,
    required this.observedAt,
    required this.hmacTag,
    required this.isMacValid,
    required this.rawBytes,
  });
}

class BinaryFrameCodec {
  static const int frameSize = 31;
  static const double coordScale = 1e7;
  static const int noCoordSentinel = 0x7FFFFFFF;

  /// Compute truncated 8-byte HMAC-SHA256 matching Python's compute_hmac_8
  static Uint8List computeHmac8(List<int> key, List<int> dataToSign) {
    final hmacSha256 = Hmac(sha256, key);
    final digest = hmacSha256.convert(dataToSign);
    return Uint8List.fromList(digest.bytes.sublist(0, 8));
  }

  /// Encode report parameters into a 31-byte compact binary frame
  static Uint8List encodeFrame({
    required int deviceId,
    required int counter,
    required int messageType,
    double? latitude,
    double? longitude,
    required int peopleAffected,
    required int flags,
    required DateTime observedAt,
    required List<int> key,
    int version = 1,
  }) {
    if (deviceId < 0 || deviceId > 0xFFFF) {
      throw ArgumentError('deviceId $deviceId must fit in uint16 (0-65535)');
    }
    if (counter < 0 || counter > 0xFFFFFFFF) {
      throw ArgumentError('counter $counter must fit in uint32');
    }

    final latInt = latitude != null ? (latitude * coordScale).round() : noCoordSentinel;
    final lonInt = longitude != null ? (longitude * coordScale).round() : noCoordSentinel;
    final peopleInt = peopleAffected.clamp(0, 0xFFFF);
    final flagsInt = flags & 0xFF;

    final tsMin = (observedAt.toUtc().millisecondsSinceEpoch ~/ 60000);

    // 23-byte payload to sign
    final bdata = ByteData(23);
    bdata.setUint8(0, version & 0xFF);
    bdata.setUint16(1, deviceId, Endian.big);
    bdata.setUint32(3, counter, Endian.big);
    bdata.setUint8(7, messageType & 0xFF);
    bdata.setInt32(8, latInt, Endian.big);
    bdata.setInt32(12, lonInt, Endian.big);
    bdata.setUint16(16, peopleInt, Endian.big);
    bdata.setUint8(18, flagsInt);
    bdata.setUint32(19, tsMin, Endian.big);

    final payloadToSign = bdata.buffer.asUint8List();
    final tag = computeHmac8(key, payloadToSign);

    final frame = Uint8List(frameSize);
    frame.setRange(0, 23, payloadToSign);
    frame.setRange(23, 31, tag);

    return frame;
  }

  /// Decode 31-byte compact binary frame and optionally verify HMAC
  static DecodedBinaryFrame decodeFrame(Uint8List rawBytes, {List<int>? key}) {
    if (rawBytes.length != frameSize) {
      throw ArgumentError('Invalid frame length: expected $frameSize bytes, got ${rawBytes.length}');
    }

    final bdata = ByteData.sublistView(rawBytes);
    final version = bdata.getUint8(0);
    final deviceId = bdata.getUint16(1, Endian.big);
    final counter = bdata.getUint32(3, Endian.big);
    final msgType = bdata.getUint8(7);
    final latInt = bdata.getInt32(8, Endian.big);
    final lonInt = bdata.getInt32(12, Endian.big);
    final people = bdata.getUint16(16, Endian.big);
    final flags = bdata.getUint8(18);
    final tsMin = bdata.getUint32(19, Endian.big);

    final lat = latInt == noCoordSentinel ? null : latInt / coordScale;
    final lon = lonInt == noCoordSentinel ? null : lonInt / coordScale;
    final observedAt = DateTime.fromMillisecondsSinceEpoch(tsMin * 60000, isUtc: true);

    final incomingTag = rawBytes.sublist(23, 31);
    bool isValid = false;

    if (key != null) {
      final payloadToSign = rawBytes.sublist(0, 23);
      final expectedTag = computeHmac8(key, payloadToSign);
      isValid = _constantTimeCompare(expectedTag, incomingTag);
    }

    return DecodedBinaryFrame(
      version: version,
      deviceId: deviceId,
      counter: counter,
      messageType: msgType,
      latitude: lat,
      longitude: lon,
      peopleAffected: people,
      flags: flags,
      observedAt: observedAt,
      hmacTag: Uint8List.fromList(incomingTag),
      isMacValid: isValid,
      rawBytes: rawBytes,
    );
  }

  /// Encode binary frame into Base64 for SMS transport
  static String encodeSmsPayload(Uint8List frameBytes) {
    return base64Encode(frameBytes);
  }

  /// Decode Base64 SMS payload into binary frame
  static Uint8List decodeSmsPayload(String smsText) {
    return base64Decode(smsText.trim());
  }

  /// Constant-time comparison to prevent timing attacks
  static bool _constantTimeCompare(List<int> a, List<int> b) {
    if (a.length != b.length) return false;
    int diff = 0;
    for (int i = 0; i < a.length; i++) {
      diff |= a[i] ^ b[i];
    }
    return diff == 0;
  }

  /// Hex encoder helper
  static String toHex(Uint8List bytes) {
    return bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
  }

  /// Hex decoder helper
  static Uint8List fromHex(String hex) {
    final clean = hex.replaceAll(' ', '').replaceAll('0x', '');
    final result = Uint8List(clean.length ~/ 2);
    for (int i = 0; i < clean.length; i += 2) {
      result[i ~/ 2] = int.parse(clean.substring(i, i + 2), radix: 16);
    }
    return result;
  }
}

