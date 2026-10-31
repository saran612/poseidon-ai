import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:poseidon_mobile/database/local_database.dart';

void main() {
  late AppDatabase db;

  setUp(() {
    db = AppDatabase(NativeDatabase.memory());
  });

  tearDown(() async {
    await db.close();
  });

  group('Drift SQLite Local Database Tests', () {
    test('Can write and read incident report offline', () async {
      final now = DateTime.utc(2026, 10, 31, 11, 0);
      final report = IncidentReportsCompanion.insert(
        id: 'rep-uuid-1',
        reportCode: 'REP-001',
        category: 'FLOOD_WATER_LEVEL',
        title: 'Severe Inundation at Perur',
        description: 'Water level rose 1.5m above normal riverbed.',
        peopleAffected: const Value(25),
        casualties: const Value(0),
        latitude: const Value(10.9708),
        longitude: const Value(76.9152),
        observedAt: now,
        createdAt: now,
        syncStatus: const Value('PENDING'),
      );

      await db.into(db.incidentReports).insert(report);

      final reports = await db.select(db.incidentReports).get();
      expect(reports.length, equals(1));
      expect(reports.first.title, equals('Severe Inundation at Perur'));
      expect(reports.first.syncStatus, equals('PENDING'));
      expect(reports.first.peopleAffected, equals(25));
    });

    test('Outbox item idempotency and status transitions', () async {
      final now = DateTime.utc(2026, 10, 31, 11, 5);
      final outboxItem = OutboxEntriesCompanion.insert(
        id: 'outbox-msg-1',
        originId: 'orig-sha256-hash-01',
        deviceId: 'DEV-OFFICER-PERUR',
        itemType: 'INCIDENT_REPORT',
        payloadJson: '{"title":"Perur Inundation"}',
        createdAt: now,
        observedAt: now,
        status: const Value('PENDING'),
      );

      await db.into(db.outboxEntries).insert(outboxItem);

      // Verify pending outbox
      final pending = await (db.select(db.outboxEntries)..where((tbl) => tbl.status.equals('PENDING'))).get();
      expect(pending.length, equals(1));
      expect(pending.first.originId, equals('orig-sha256-hash-01'));

      // Transition to SYNCHRONIZED with serverAckId
      await (db.update(db.outboxEntries)..where((tbl) => tbl.id.equals('outbox-msg-1'))).write(
        const OutboxEntriesCompanion(
          status: Value('SYNCHRONIZED'),
          serverAckId: Value('ack-server-99'),
        ),
      );

      final updated = await (db.select(db.outboxEntries)..where((tbl) => tbl.id.equals('outbox-msg-1'))).getSingle();
      expect(updated.status, equals('SYNCHRONIZED'));
      expect(updated.serverAckId, equals('ack-server-99'));
    });

    test('Assignment persistence and status update', () async {
      final now = DateTime.utc(2026, 10, 31, 11, 10);
      final assignment = LocalAssignmentsCompanion.insert(
        id: 'ASGN-PERUR-01',
        planId: 'PLAN-OPERATIONAL-01',
        versionNumber: 1,
        depotId: 'DEPOT_RS_PURAM',
        zoneId: 'ZONE_PERUR',
        zoneName: 'Perur Noyyal Corridor',
        resourceType: 'BOAT',
        quantity: 6,
        priority: 'HIGH',
        priorityScore: 0.88,
        travelTimeMin: 14.5,
        destination: 'Perur Sector Relief Area',
        latitude: 10.9708,
        longitude: 76.9152,
        routeNodesJson: '["DEPOT_RS_PURAM", "ZONE_SELVAPURAM", "ZONE_PERUR"]',
        lastUpdated: now,
      );

      await db.into(db.localAssignments).insert(assignment);

      final list = await db.select(db.localAssignments).get();
      expect(list.length, equals(1));
      expect(list.first.status, equals('SCHEDULED'));

      // Update status to ACKNOWLEDGED
      await (db.update(db.localAssignments)..where((tbl) => tbl.id.equals('ASGN-PERUR-01'))).write(
        const LocalAssignmentsCompanion(
          status: Value('ACKNOWLEDGED'),
          acknowledgedByDevice: Value('DEV-OFFICER-PERUR'),
          serverConfirmed: Value(true),
        ),
      );

      final updated = await (db.select(db.localAssignments)..where((tbl) => tbl.id.equals('ASGN-PERUR-01'))).getSingle();
      expect(updated.status, equals('ACKNOWLEDGED'));
      expect(updated.serverConfirmed, isTrue);
    });
  });
}
