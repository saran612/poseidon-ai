import 'package:drift/native.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:poseidon_mobile/config/theme.dart';
import 'package:poseidon_mobile/core/providers.dart';
import 'package:poseidon_mobile/database/local_database.dart';
import 'package:poseidon_mobile/features/assignments/screens/assignments_screen.dart';
import 'package:poseidon_mobile/features/authentication/screens/login_screen.dart';
import 'package:poseidon_mobile/features/dashboard/screens/dashboard_screen.dart';
import 'package:poseidon_mobile/features/reporting/screens/reporting_screen.dart';
import 'package:poseidon_mobile/models/user_session.dart';
import 'package:poseidon_mobile/sync/outbox_manager.dart';
import 'package:poseidon_mobile/sync/sync_engine.dart';
import 'package:poseidon_mobile/sync/transport_adapter.dart';
import 'package:shared_preferences/shared_preferences.dart';

class TestTransportAdapter implements TransportAdapter {
  @override
  String get transportName => 'TEST_ADAPTER';
  @override
  Future<bool> isAvailable() async => true;
  @override
  Future<TransportResult> transmit(OutboxEntry entry) async => TransportResult.success('test-ack');
}

class MockSessionNotifier extends SessionNotifier {
  @override
  UserSession? build() {
    return UserSession(
      token: 'test-token',
      numericId: 101,
      deviceCode: 'DEV-OFFICER-PERUR',
      role: 'T1',
      tier: 'T1',
      ownerName: 'Inspector S. Murugan',
      isFieldOfficer: true,
      isResponder: true,
      secretKey: 'poseidon-field-officer-key-32b!',
    );
  }
}

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  Widget buildTestableWidget(Widget child, AppDatabase db, SyncEngine syncEngine, OutboxManager outbox, TransportAdapter transport) {
    return ProviderScope(
      overrides: [
        databaseProvider.overrideWithValue(db),
        sessionProvider.overrideWith(() => MockSessionNotifier()),
        transportAdapterProvider.overrideWithValue(transport),
        outboxManagerProvider.overrideWithValue(outbox),
        syncEngineProvider.overrideWithValue(syncEngine),
      ],
      child: MaterialApp(
        theme: AppTheme.lightTheme,
        home: child,
      ),
    );
  }

  testWidgets('DashboardScreen renders operational metrics and actions', (WidgetTester tester) async {
    final db = AppDatabase(NativeDatabase.memory());
    final transport = TestTransportAdapter();
    final outbox = OutboxManager(db: db, primaryTransport: transport);
    final syncEngine = SyncEngine(db: db, outboxManager: outbox, transportAdapter: transport);

    await tester.pumpWidget(buildTestableWidget(const DashboardScreen(), db, syncEngine, outbox, transport));
    await tester.pump(const Duration(milliseconds: 50));

    expect(find.text('POSEIDON AI'), findsOneWidget);
    expect(find.text('ACTIVE MISSIONS'), findsOneWidget);
    expect(find.text('OUTBOX QUEUE'), findsOneWidget);
    expect(find.text('REPORTS SAVED'), findsOneWidget);
    expect(find.text('Report Incident'), findsOneWidget);
    expect(find.text('Capture Evidence'), findsOneWidget);

    await tester.pump(const Duration(milliseconds: 50));
    syncEngine.dispose();
    await db.close();
  });

  testWidgets('ReportingScreen renders filters and empty state', (WidgetTester tester) async {
    final db = AppDatabase(NativeDatabase.memory());
    final transport = TestTransportAdapter();
    final outbox = OutboxManager(db: db, primaryTransport: transport);
    final syncEngine = SyncEngine(db: db, outboxManager: outbox, transportAdapter: transport);

    await tester.pumpWidget(buildTestableWidget(const ReportingScreen(), db, syncEngine, outbox, transport));
    await tester.pump(const Duration(milliseconds: 50));

    expect(find.text('Field Incident Reports'), findsOneWidget);
    expect(find.text('All (0)'), findsOneWidget);
    expect(find.text('New Report'), findsOneWidget);

    await tester.pump(const Duration(milliseconds: 50));
    syncEngine.dispose();
    await db.close();
  });

  testWidgets('AssignmentsScreen renders empty dispatch standby', (WidgetTester tester) async {
    final db = AppDatabase(NativeDatabase.memory());
    final transport = TestTransportAdapter();
    final outbox = OutboxManager(db: db, primaryTransport: transport);
    final syncEngine = SyncEngine(db: db, outboxManager: outbox, transportAdapter: transport);

    await tester.pumpWidget(buildTestableWidget(const AssignmentsScreen(), db, syncEngine, outbox, transport));
    await tester.pump(const Duration(milliseconds: 50));

    expect(find.text('Rescue & Relief Assignments'), findsOneWidget);
    expect(find.text('No rescue assignments in local database.'), findsOneWidget);

    await tester.pump(const Duration(milliseconds: 50));
    syncEngine.dispose();
    await db.close();
  });

  testWidgets('LoginScreen renders pre-set credentials and button', (WidgetTester tester) async {
    final db = AppDatabase(NativeDatabase.memory());
    final transport = TestTransportAdapter();
    final outbox = OutboxManager(db: db, primaryTransport: transport);
    final syncEngine = SyncEngine(db: db, outboxManager: outbox, transportAdapter: transport);

    await tester.pumpWidget(buildTestableWidget(const LoginScreen(), db, syncEngine, outbox, transport));
    await tester.pump(const Duration(milliseconds: 50));

    expect(find.text('POSEIDON AI'), findsOneWidget);
    expect(find.text('T1 Officer (Perur)'), findsOneWidget);
    expect(find.text('T3 Responder'), findsOneWidget);
    expect(find.text('Authenticate Device & Enter'), findsOneWidget);

    await tester.pump(const Duration(milliseconds: 50));
    syncEngine.dispose();
    await db.close();
  });
}
