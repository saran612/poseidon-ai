import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:poseidon_mobile/core/utils/binary_codec.dart';

void main() {
  group('BinaryFrameCodec Tests', () {
    final key = utf8.encode('poseidon-field-officer-key-32b!');
    final now = DateTime.utc(2026, 10, 31, 10, 30);

    test('Encode and decode 31-byte binary frame with valid HMAC', () {
      final frame = BinaryFrameCodec.encodeFrame(
        deviceId: 101,
        counter: 42,
        messageType: 1, // Water level
        latitude: 10.9708,
        longitude: 76.9152,
        peopleAffected: 30,
        flags: 0x01,
        observedAt: now,
        key: key,
      );

      expect(frame.length, equals(31));

      final decoded = BinaryFrameCodec.decodeFrame(frame, key: key);
      expect(decoded.version, equals(1));
      expect(decoded.deviceId, equals(101));
      expect(decoded.counter, equals(42));
      expect(decoded.messageType, equals(1));
      expect(decoded.latitude, closeTo(10.9708, 0.00001));
      expect(decoded.longitude, closeTo(76.9152, 0.00001));
      expect(decoded.peopleAffected, equals(30));
      expect(decoded.flags, equals(0x01));
      expect(decoded.isMacValid, isTrue);
    });

    test('Tampered frame fails HMAC verification', () {
      final frame = BinaryFrameCodec.encodeFrame(
        deviceId: 101,
        counter: 1,
        messageType: 4,
        latitude: 10.9915,
        longitude: 76.9610,
        peopleAffected: 10,
        flags: 0x00,
        observedAt: now,
        key: key,
      );

      // Tamper with peopleAffected byte
      frame[17] = 99;

      final decoded = BinaryFrameCodec.decodeFrame(frame, key: key);
      expect(decoded.isMacValid, isFalse);
    });

    test('SMS base64 serialization cycle', () {
      final frame = BinaryFrameCodec.encodeFrame(
        deviceId: 303,
        counter: 5,
        messageType: 4,
        latitude: 10.9915,
        longitude: 76.9610,
        peopleAffected: 12,
        flags: 0x01,
        observedAt: now,
        key: utf8.encode('poseidon-citizen-volunteer-key32'),
      );

      final smsText = BinaryFrameCodec.encodeSmsPayload(frame);
      expect(smsText.isNotEmpty, isTrue);

      final decodedBytes = BinaryFrameCodec.decodeSmsPayload(smsText);
      expect(decodedBytes, equals(frame));
    });
  });
}
