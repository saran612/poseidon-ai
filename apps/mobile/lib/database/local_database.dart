import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

part 'local_database.g.dart';

// 1. Durable Outbox Queue Table
class OutboxEntries extends Table {
  TextColumn get id => text()(); // UUID
  TextColumn get originId => text()(); // Idempotency origin_id
  TextColumn get deviceId => text()();
  TextColumn get itemType => text()(); // INCIDENT_REPORT, EVIDENCE, ASSIGNMENT_ACK
  TextColumn get payloadJson => text()();
  TextColumn get rawPayloadHex => text().nullable()();
  TextColumn get transportPreference => text().withDefault(const Constant('WIFI'))();
  TextColumn get status => text().withDefault(const Constant('PENDING'))(); // PENDING, TRANSMITTING, SYNCHRONIZED, FAILED, REJECTED
  IntColumn get retryCount => integer().withDefault(const Constant(0))();
  IntColumn get maxRetries => integer().withDefault(const Constant(5))();
  DateTimeColumn get nextRetryAt => dateTime().nullable()();
  TextColumn get lastError => text().nullable()();
  TextColumn get serverAckId => text().nullable()();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get observedAt => dateTime()();
  DateTimeColumn get syncedAt => dateTime().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

// 2. Local Incident Reports Table
class IncidentReports extends Table {
  TextColumn get id => text()(); // UUID
  TextColumn get reportCode => text()();
  TextColumn get category => text()();
  TextColumn get title => text()();
  TextColumn get description => text()();
  RealColumn get latitude => real().nullable()();
  RealColumn get longitude => real().nullable()();
  IntColumn get peopleAffected => integer().withDefault(const Constant(0))();
  IntColumn get casualties => integer().withDefault(const Constant(0))();
  TextColumn get photoPath => text().nullable()();
  BoolColumn get photoPendingUpload => boolean().withDefault(const Constant(false))();
  TextColumn get syncStatus => text().withDefault(const Constant('PENDING'))(); // PENDING, SYNCHRONIZED, REJECTED
  TextColumn get syncError => text().nullable()();
  DateTimeColumn get observedAt => dateTime()();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get syncedAt => dateTime().nullable()();
  BoolColumn get isDeleted => boolean().withDefault(const Constant(false))(); // Soft deletion tombstone

  @override
  Set<Column> get primaryKey => {id};
}

// 3. Local Evidence Records Table
class EvidenceRecords extends Table {
  TextColumn get id => text()(); // UUID
  TextColumn get messageId => text()();
  TextColumn get incidentType => text()();
  TextColumn get description => text()();
  TextColumn get photoPath => text().nullable()();
  RealColumn get latitude => real().nullable()();
  RealColumn get longitude => real().nullable()();
  TextColumn get sourceTier => text()();
  RealColumn get confidence => real().withDefault(const Constant(0.0))();
  TextColumn get status => text().withDefault(const Constant('LOCAL'))(); // LOCAL, PENDING_UPLOAD, VERIFIED, CORROBORATED, REJECTED
  DateTimeColumn get observedAt => dateTime()();
  DateTimeColumn get uploadedAt => dateTime().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

// 4. Local Rescue Assignments Table
class LocalAssignments extends Table {
  TextColumn get id => text()(); // e.g. ASGN-PERUR-01
  TextColumn get planId => text()();
  IntColumn get versionNumber => integer()();
  TextColumn get depotId => text()();
  TextColumn get zoneId => text()();
  TextColumn get zoneName => text()();
  TextColumn get resourceType => text()();
  IntColumn get quantity => integer()();
  TextColumn get priority => text()();
  RealColumn get priorityScore => real()();
  RealColumn get travelTimeMin => real()();
  TextColumn get destination => text()();
  RealColumn get latitude => real()();
  RealColumn get longitude => real()();
  TextColumn get routeNodesJson => text()();
  TextColumn get status => text().withDefault(const Constant('SCHEDULED'))(); // SCHEDULED, DISPATCHED, ACKNOWLEDGED, EN_ROUTE, COMPLETED
  TextColumn get acknowledgedByDevice => text().nullable()();
  BoolColumn get serverConfirmed => boolean().withDefault(const Constant(false))();
  DateTimeColumn get lastUpdated => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

// 5. Local Road Closures & Bridges
class LocalRoadClosures extends Table {
  TextColumn get bridgeId => text()();
  TextColumn get name => text()();
  TextColumn get status => text().withDefault(const Constant('OPEN'))(); // OPEN, CLOSED
  TextColumn get closureReason => text().nullable()();
  RealColumn get latitude => real()();
  RealColumn get longitude => real()();
  DateTimeColumn get lastUpdated => dateTime()();

  @override
  Set<Column> get primaryKey => {bridgeId};
}

// 6. Sync Metadata Table (key-value)
class SyncMetadata extends Table {
  TextColumn get key => text()();
  TextColumn get value => text()();
  DateTimeColumn get updatedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {key};
}

@DriftDatabase(tables: [
  OutboxEntries,
  IncidentReports,
  EvidenceRecords,
  LocalAssignments,
  LocalRoadClosures,
  SyncMetadata,
])
class AppDatabase extends _$AppDatabase {
  AppDatabase([QueryExecutor? e]) : super(e ?? _openConnection());

  @override
  int get schemaVersion => 1;

  static LazyDatabase _openConnection() {
    return LazyDatabase(() async {
      final dbFolder = await getApplicationDocumentsDirectory();
      final file = File(p.join(dbFolder.path, 'poseidon_offline.sqlite'));
      return NativeDatabase.createInBackground(file);
    });
  }
}

