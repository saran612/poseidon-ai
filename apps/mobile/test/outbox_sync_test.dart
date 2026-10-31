import 'package:drift/drift.dart' hide isNull, isNotNull;
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:poseidon_mobile/database/local_database.dart';
import 'package:poseidon_mobile/sync/outbox_manager.dart';
import 'package:poseidon_mobile/sync/transport_adapter.dart';

class MockTransportAdapter implements TransportAdapter {
  bool shouldSucceed = true;
  int transmitCallCount = 0;
  final List<OutboxEntry> transmittedEntries = [];

  @override
  String get transportName => 'MOCK_TRANSPORT';

  @override
  Future<bool> isAvailable() async => true;

  @override
  Future<TransportResult> transmit(OutboxEntry entry) async {
    transmitCallCount++;
    transmittedEntries.add(entry);

    if (shouldSucceed) {
      return TransportResult.success('ack-mock-${entry.id}', isDuplicate: false);
    } else {
      return TransportResult.failure('Simulated network timeout');
    }
  }
}

void main() {
  late AppDatabase db;
  late MockTransportAdapter mockTransport;
  late OutboxManager outboxManager;

  setUp(() {
    db = AppDatabase(NativeDatabase.memory());
    mockTransport = MockTransportAdapter();
    outboxManager = OutboxManager(db: db, primaryTransport: mockTransport);
  });

  tearDown(() async {
    await db.close();
  });

  group('Offline Outbox & Synchronization Engine Tests', () {
    test('Create report offline, verify pending outbox and local storage', () async {
      final now = DateTime.utc(2026, 10, 31, 11, 20);

      // 1. Insert local report first
      await db.into(db.incidentReports).insert(
            IncidentReportsCompanion.insert(
              id: 'rep-test-01',
              reportCode: 'REP-OFFLINE-01',
              category: 'PEOPLE_TRAPPED',
              title: 'Trapped Civilians near Ukkadam',
              description: 'Elderly residents stranded by rising flood water.',
              latitude: const Value(10.9915),
              longitude: const Value(76.9610),
              peopleAffected: const Value(12),
              casualties: const Value(0),
              observedAt: now,
              createdAt: now,
              syncStatus: const Value('PENDING'),
            ),
          );

      // 2. Enqueue into outbox
      final outboxItem = await outboxManager.enqueueIncidentReport(
        reportId: 'rep-test-01',
        reportCode: 'REP-OFFLINE-01',
        category: 'PEOPLE_TRAPPED',
        title: 'Trapped Civilians near Ukkadam',
        description: 'Elderly residents stranded by rising flood water.',
        latitude: 10.9915,
        longitude: 76.9610,
        peopleAffected: 12,
        casualties: 0,
        observedAt: now,
        deviceNumericId: 101,
        deviceCode: 'DEV-OFFICER-PERUR',
        secretKey: 'poseidon-field-officer-key-32b!',
        counter: 1,
      );

      expect(outboxItem.status, equals('PENDING'));
      expect(outboxItem.rawPayloadHex, isNotNull);
      expect(outboxItem.rawPayloadHex!.length, equals(62)); // 31 bytes * 2 hex chars
      expect(outboxItem.originId.startsWith('orig-'), isTrue);

      // Verify report in DB is still PENDING
      final storedReport = await (db.select(db.incidentReports)..where((t) => t.id.equals('rep-test-01'))).getSingle();
      expect(storedReport.syncStatus, equals('PENDING'));
      expect(storedReport.syncedAt, isNull);
    });

    test('Simulate transmission failure: does not discard report, schedules retry with backoff', () async {
      final now = DateTime.utc(2026, 10, 31, 11, 25);
      mockTransport.shouldSucceed = false;

      await outboxManager.enqueueIncidentReport(
        reportId: 'rep-fail-01',
        reportCode: 'REP-FAIL-01',
        category: 'FLOOD_WATER_LEVEL',
        title: 'Water Level Alert',
        description: 'Testing failure handling',
        latitude: 10.9708,
        longitude: 76.9152,
        peopleAffected: 5,
        casualties: 0,
        observedAt: now,
        deviceNumericId: 101,
        deviceCode: 'DEV-OFFICER-PERUR',
        secretKey: 'poseidon-field-officer-key-32b!',
        counter: 2,
      );

      final successCount = await outboxManager.processPendingQueue();
      expect(successCount, equals(0));

      final items = await db.select(db.outboxEntries).get();
      expect(items.length, equals(1));
      expect(items.first.status, equals('PENDING'));
      expect(items.first.retryCount, equals(1));
      expect(items.first.nextRetryAt, isNotNull);
      expect(items.first.lastError, contains('timeout'));
    });

    test('Restore connectivity: successfully synchronizes and marks authoritative ack', () async {
      final now = DateTime.utc(2026, 10, 31, 11, 30);
      mockTransport.shouldSucceed = true;

      await db.into(db.incidentReports).insert(
            IncidentReportsCompanion.insert(
              id: 'rep-sync-01',
              reportCode: 'REP-SYNC-01',
              category: 'ROAD_BLOCKED',
              title: 'Bridge Approach Inundated',
              description: 'Perur bridgehead impassable',
              latitude: const Value(10.9708),
              longitude: const Value(76.9152),
              observedAt: now,
              createdAt: now,
              syncStatus: const Value('PENDING'),
            ),
          );

      await outboxManager.enqueueIncidentReport(
        reportId: 'rep-sync-01',
        reportCode: 'REP-SYNC-01',
        category: 'ROAD_BLOCKED',
        title: 'Bridge Approach Inundated',
        description: 'Perur bridgehead impassable',
        latitude: 10.9708,
        longitude: 76.9152,
        peopleAffected: 0,
        casualties: 0,
        observedAt: now,
        deviceNumericId: 101,
        deviceCode: 'DEV-OFFICER-PERUR',
        secretKey: 'poseidon-field-officer-key-32b!',
        counter: 3,
      );

      final successCount = await outboxManager.processPendingQueue();
      expect(successCount, equals(1));

      // Verify outbox entry is SYNCHRONIZED
      final outboxItem = (await db.select(db.outboxEntries).get()).first;
      expect(outboxItem.status, equals('SYNCHRONIZED'));
      expect(outboxItem.serverAckId, startsWith('ack-mock-'));

      // Verify local report syncStatus is now SYNCHRONIZED
      final updatedReport = await (db.select(db.incidentReports)..where((t) => t.id.equals('rep-sync-01'))).getSingle();
      expect(updatedReport.syncStatus, equals('SYNCHRONIZED'));
      expect(updatedReport.syncedAt, isNotNull);
    });

    test('Deterministic originId prevents duplicate transmissions', () {
      final originId1 = outboxManager.computeOriginId(101, 42, 29800000);
      final originId2 = outboxManager.computeOriginId(101, 42, 29800000);
      final originId3 = outboxManager.computeOriginId(101, 43, 29800000);

      expect(originId1, equals(originId2));
      expect(originId1, isNot(equals(originId3)));
    });
  });
}
