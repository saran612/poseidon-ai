import 'dart:async';
import 'package:dio/dio.dart';
import 'package:drift/drift.dart';
import '../config/env.dart';
import '../database/local_database.dart';
import 'outbox_manager.dart';
import 'transport_adapter.dart';

class SyncEngineState {
  final bool isOnline;
  final bool isSyncing;
  final int pendingOutboxCount;
  final DateTime? lastSyncedAt;
  final String? lastError;

  SyncEngineState({
    required this.isOnline,
    required this.isSyncing,
    required this.pendingOutboxCount,
    this.lastSyncedAt,
    this.lastError,
  });

  SyncEngineState copyWith({
    bool? isOnline,
    bool? isSyncing,
    int? pendingOutboxCount,
    DateTime? lastSyncedAt,
    String? lastError,
  }) {
    return SyncEngineState(
      isOnline: isOnline ?? this.isOnline,
      isSyncing: isSyncing ?? this.isSyncing,
      pendingOutboxCount: pendingOutboxCount ?? this.pendingOutboxCount,
      lastSyncedAt: lastSyncedAt ?? this.lastSyncedAt,
      lastError: lastError,
    );
  }
}

class SyncEngine {
  final AppDatabase db;
  final OutboxManager outboxManager;
  final TransportAdapter transportAdapter;
  final Dio dio;

  final _stateController = StreamController<SyncEngineState>.broadcast();
  SyncEngineState _currentState = SyncEngineState(
    isOnline: false,
    isSyncing: false,
    pendingOutboxCount: 0,
  );

  Stream<SyncEngineState> get stateStream => _stateController.stream;
  SyncEngineState get currentState => _currentState;

  Timer? _periodicSyncTimer;

  SyncEngine({
    required this.db,
    required this.outboxManager,
    required this.transportAdapter,
    Dio? dioClient,
  }) : dio = dioClient ??
            Dio(BaseOptions(
              baseUrl: Environment.defaultBaseUrl,
              connectTimeout: Environment.connectTimeout,
              receiveTimeout: Environment.receiveTimeout,
            )) {
    _updatePendingCount();
  }

  void startPeriodicSync({Duration interval = const Duration(seconds: 30)}) {
    _periodicSyncTimer?.cancel();
    _periodicSyncTimer = Timer.periodic(interval, (_) => triggerFullSync());
  }

  void stopPeriodicSync() {
    _periodicSyncTimer?.cancel();
  }

  void dispose() {
    _periodicSyncTimer?.cancel();
    _stateController.close();
  }

  void _emitState(SyncEngineState s) {
    _currentState = s;
    if (!_stateController.isClosed) {
      _stateController.add(_currentState);
    }
  }

  Future<void> _updatePendingCount() async {
    final pending = await (db.select(db.outboxEntries)..where((tbl) => tbl.status.equals('PENDING'))).get();
    _emitState(_currentState.copyWith(pendingOutboxCount: pending.length));
  }

  /// Perform two-way sync: Push outbox and Pull server state
  Future<bool> triggerFullSync() async {
    if (_currentState.isSyncing) return false;

    _emitState(_currentState.copyWith(isSyncing: true, lastError: null));

    try {
      final isAvailable = await transportAdapter.isAvailable();
      _emitState(_currentState.copyWith(isOnline: isAvailable));

      if (!isAvailable) {
        _emitState(_currentState.copyWith(
          isSyncing: false,
          lastError: 'Server unreachable. Operating in Offline Mode.',
        ));
        return false;
      }

      // 1. Flush Outbox transmissions
      await outboxManager.processPendingQueue();
      await _updatePendingCount();

      // 2. Fetch authoritative assignments
      await _syncInboundAssignments();

      // 3. Fetch bridges and road closures
      await _syncInboundBridges();

      // 4. Update sync metadata
      final now = DateTime.now().toUtc();
      await db.into(db.syncMetadata).insertOnConflictUpdate(
            SyncMetadataCompanion.insert(
              key: 'last_successful_sync',
              value: now.toIso8601String(),
              updatedAt: now,
            ),
          );

      _emitState(_currentState.copyWith(
        isOnline: true,
        isSyncing: false,
        lastSyncedAt: now,
        lastError: null,
      ));
      return true;
    } catch (e) {
      _emitState(_currentState.copyWith(
        isSyncing: false,
        lastError: 'Sync error: $e',
      ));
      return false;
    }
  }

  Future<void> _syncInboundAssignments() async {
    try {
      final resp = await dio.get('${Environment.apiV1Prefix}/assignments');
      if (resp.statusCode == 200) {
        final list = (resp.data['assignments'] as List?) ?? [];
        for (final item in list) {
          final m = item as Map<String, dynamic>;
          await db.into(db.localAssignments).insertOnConflictUpdate(
                LocalAssignmentsCompanion.insert(
                  id: m['assignment_id'],
                  planId: m['plan_id'] ?? 'PLAN-OPERATIONAL-01',
                  versionNumber: m['version_number'] ?? 1,
                  depotId: m['depot_id'] ?? '',
                  zoneId: m['zone_id'] ?? '',
                  zoneName: m['zone_name'] ?? m['zone_id'] ?? '',
                  resourceType: m['resource_type'] ?? 'BOAT',
                  quantity: m['quantity'] ?? 1,
                  priority: m['priority'] ?? 'MEDIUM',
                  priorityScore: (m['priority_score'] as num?)?.toDouble() ?? 0.5,
                  travelTimeMin: (m['travel_time_min'] as num?)?.toDouble() ?? 0.0,
                  destination: m['destination'] ?? 'Disaster Sector',
                  latitude: (m['latitude'] as num?)?.toDouble() ?? 10.9708,
                  longitude: (m['longitude'] as num?)?.toDouble() ?? 76.9152,
                  routeNodesJson: (m['route_nodes'] as List?)?.join(',') ?? '',
                  status: Value(m['status'] ?? 'SCHEDULED'),
                  serverConfirmed: const Value(true),
                  lastUpdated: DateTime.now().toUtc(),
                ),
              );
        }
      }
    } catch (_) {
      // Retain existing local assignments if fetch fails
    }
  }

  Future<void> _syncInboundBridges() async {
    try {
      final resp = await dio.get('${Environment.apiV1Prefix}/situation/bridges');
      if (resp.statusCode == 200) {
        final list = (resp.data['bridges'] as List?) ?? [];
        for (final b in list) {
          final m = b as Map<String, dynamic>;
          await db.into(db.localRoadClosures).insertOnConflictUpdate(
                LocalRoadClosuresCompanion.insert(
                  bridgeId: m['bridge_id'],
                  name: m['name'] ?? m['bridge_id'],
                  status: Value(m['status'] ?? 'OPEN'),
                  closureReason: Value(m['closure_reason']),
                  latitude: (m['latitude'] as num?)?.toDouble() ?? 10.9708,
                  longitude: (m['longitude'] as num?)?.toDouble() ?? 76.9152,
                  lastUpdated: DateTime.now().toUtc(),
                ),
              );
        }
      }
    } catch (_) {}
  }
}

