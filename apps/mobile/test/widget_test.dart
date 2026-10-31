import 'package:drift/native.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:poseidon_mobile/core/providers.dart';
import 'package:poseidon_mobile/database/local_database.dart';
import 'package:poseidon_mobile/main.dart';
import 'package:poseidon_mobile/sync/outbox_manager.dart';
import 'package:poseidon_mobile/sync/sync_engine.dart';
import 'package:poseidon_mobile/sync/transport_adapter.dart';

class TestTransportAdapter implements TransportAdapter {
  @override
  String get transportName => 'TEST_ADAPTER';
  @override
  Future<bool> isAvailable() async => false;
  @override
  Future<TransportResult> transmit(OutboxEntry entry) async => TransportResult.success('test-ack');
}

void main() {
  testWidgets('Poseidon mobile smoke and navigation test', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(800, 1200);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    final memoryDb = AppDatabase(NativeDatabase.memory());
    final transport = TestTransportAdapter();
    final outbox = OutboxManager(db: memoryDb, primaryTransport: transport);
    final syncEngine = SyncEngine(db: memoryDb, outboxManager: outbox, transportAdapter: transport);

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          databaseProvider.overrideWithValue(memoryDb),
          transportAdapterProvider.overrideWithValue(transport),
          outboxManagerProvider.overrideWithValue(outbox),
          syncEngineProvider.overrideWithValue(syncEngine),
        ],
        child: const PoseidonMobileApp(),
      ),
    );

    await tester.pump(const Duration(milliseconds: 200));

    // Verify Dashboard renders
    expect(find.text('POSEIDON AI'), findsOneWidget);
    expect(find.text('ACTIVE MISSIONS'), findsOneWidget);

    // Verify Bottom Navigation items by label
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Map'), findsOneWidget);
    expect(find.text('Reports'), findsOneWidget);
    expect(find.text('Assignments'), findsOneWidget);
    expect(find.text('Profile'), findsOneWidget);

    // Navigate to Reports tab
    await tester.tap(find.text('Reports'));
    await tester.pump(const Duration(milliseconds: 200));
    expect(find.text('Field Incident Reports'), findsOneWidget);

    // Navigate to Assignments tab
    await tester.tap(find.text('Assignments'));
    await tester.pump(const Duration(milliseconds: 200));
    expect(find.text('Rescue & Relief Assignments'), findsOneWidget);

    // Navigate to Profile tab
    await tester.tap(find.text('Profile'));
    await tester.pump(const Duration(milliseconds: 200));
    expect(find.text('Device & Field Operator Profile'), findsOneWidget);

    syncEngine.dispose();
    await memoryDb.close();
  });
}
