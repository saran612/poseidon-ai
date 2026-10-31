import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../database/local_database.dart';
import '../models/user_session.dart';
import '../services/auth_service.dart';
import '../services/websocket_service.dart';
import '../sync/outbox_manager.dart';
import '../sync/sync_engine.dart';
import '../sync/transport_adapter.dart';

extension AsyncValueX<T> on AsyncValue<T> {
  T? get valueOrNull => asData?.value;
}

// 1. Local Drift SQLite Database Provider
final databaseProvider = Provider<AppDatabase>((ref) {
  final db = AppDatabase();
  ref.onDispose(() => db.close());
  return db;
});

// 2. Authentication Service Provider
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

// 3. Current User Session Notifier
class SessionNotifier extends Notifier<UserSession?> {
  @override
  UserSession? build() {
    _init();
    return null;
  }

  Future<void> _init() async {
    final session = await ref.read(authServiceProvider).loadPersistedSession();
    state = session;
  }

  Future<void> login(String deviceCode, String secretKey) async {
    final session = await ref.read(authServiceProvider).login(deviceCode: deviceCode, secretKey: secretKey);
    state = session;
  }

  Future<void> logout() async {
    await ref.read(authServiceProvider).logout();
    state = null;
  }
}

final sessionProvider = NotifierProvider<SessionNotifier, UserSession?>(() {
  return SessionNotifier();
});

// 4. Primary Transport Adapter Provider
final transportAdapterProvider = Provider<TransportAdapter>((ref) {
  return HttpTransportAdapter();
});

// 5. Outbox Manager Provider
final outboxManagerProvider = Provider<OutboxManager>((ref) {
  final db = ref.watch(databaseProvider);
  final transport = ref.watch(transportAdapterProvider);
  return OutboxManager(db: db, primaryTransport: transport);
});

// 6. Sync Engine Provider
final syncEngineProvider = Provider<SyncEngine>((ref) {
  final db = ref.watch(databaseProvider);
  final outbox = ref.watch(outboxManagerProvider);
  final transport = ref.watch(transportAdapterProvider);
  final engine = SyncEngine(db: db, outboxManager: outbox, transportAdapter: transport);
  engine.startPeriodicSync();
  ref.onDispose(() => engine.dispose());
  return engine;
});

// 7. Sync Engine State Stream Provider
final syncStateProvider = StreamProvider<SyncEngineState>((ref) {
  final engine = ref.watch(syncEngineProvider);
  return engine.stateStream;
});

// 8. Stream of Local Incident Reports
final localReportsStreamProvider = StreamProvider<List<IncidentReport>>((ref) {
  final db = ref.watch(databaseProvider);
  return (db.select(db.incidentReports)
        ..where((t) => t.isDeleted.equals(false))
        ..orderBy([(t) => OrderingTerm.desc(t.createdAt)]))
      .watch();
});

// 9. Stream of Local Rescue Assignments
final localAssignmentsStreamProvider = StreamProvider<List<LocalAssignment>>((ref) {
  final db = ref.watch(databaseProvider);
  return (db.select(db.localAssignments)..orderBy([(t) => OrderingTerm.asc(t.travelTimeMin)])).watch();
});

// 10. Stream of Local Bridges & Road Closures
final localBridgesStreamProvider = StreamProvider<List<LocalRoadClosure>>((ref) {
  final db = ref.watch(databaseProvider);
  return db.select(db.localRoadClosures).watch();
});

// 11. WebSocket Service Provider
final webSocketServiceProvider = Provider<WebSocketService>((ref) {
  final ws = WebSocketService();
  ws.connect();
  ref.onDispose(() => ws.dispose());
  return ws;
});
