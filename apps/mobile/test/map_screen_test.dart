import 'package:drift/native.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:latlong2/latlong.dart';
import 'package:poseidon_mobile/core/providers.dart';
import 'package:poseidon_mobile/database/local_database.dart';
import 'package:poseidon_mobile/features/map/controllers/map_controller.dart';
import 'package:poseidon_mobile/features/map/models/map_models.dart';
import 'package:poseidon_mobile/features/map/repositories/map_repository.dart';
import 'package:poseidon_mobile/features/map/screens/map_screen.dart';
import 'package:poseidon_mobile/features/map/widgets/map_entity_bottom_sheet.dart';
import 'package:poseidon_mobile/features/map/widgets/map_legend.dart';

class MockMapRepository extends MapRepository {
  @override
  Future<Map<String, dynamic>> fetchOperationsBundle({
    String scenario = 'coimbatore_flood',
    String? role,
    String? token,
  }) async {
    return {
      'scenario': {'id': 'coimbatore_flood', 'name': 'Coimbatore Noyyal Flood'},
      'bridges': {'features': []},
      'shelters': {'features': []},
      'depots': {'features': []},
      'hospitals': {'features': []},
      'incidents': {'features': []},
    };
  }
}

void main() {
  testWidgets('MissionMapScreen renders with OSM legend and layer controls', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(800, 1200);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    final memoryDb = AppDatabase(NativeDatabase.memory());

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          databaseProvider.overrideWithValue(memoryDb),
          mapRepositoryProvider.overrideWithValue(MockMapRepository()),
        ],
        child: const MaterialApp(
          home: MapScreen(),
        ),
      ),
    );

    await tester.pump(const Duration(milliseconds: 200));

    // Verify AppBar Title & Scenario dropdown
    expect(find.text('OSM Tactical Map'), findsOneWidget);
    expect(find.text('Coimbatore Noyyal Flood'), findsOneWidget);

    // Verify Map Legend presence
    expect(find.byType(MapLegendWidget), findsOneWidget);
    expect(find.text('Critical Zone'), findsOneWidget);
    expect(find.text('Noyyal Corridor'), findsOneWidget);

    // Verify Layer Controls modal opens
    await tester.tap(find.byIcon(Icons.layers_outlined));
    await tester.pumpAndSettle();
    expect(find.text('Tactical GIS Layers'), findsOneWidget);
    expect(find.text('Flood Risk Zones'), findsOneWidget);
    expect(find.text('Candidate Bridges & Cuts'), findsOneWidget);

    // Close modal
    await tester.tap(find.byIcon(Icons.close));
    await tester.pumpAndSettle();

    await memoryDb.close();
  });

  testWidgets('MapEntityBottomSheet renders inspected bridge entity', (WidgetTester tester) async {
    const bridgeEntity = MapFeatureEntity(
      id: 'BR-PERUR-01',
      type: 'BRIDGE',
      title: 'Perur Noyyal Main Bridge',
      position: LatLng(10.9712, 76.9180),
      status: 'OPEN',
      details: 'Passable for relief convoys.',
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: MapEntityBottomSheet(
            entity: bridgeEntity,
            onClose: () {},
          ),
        ),
      ),
    );

    expect(find.text('BRIDGE'), findsOneWidget);
    expect(find.text('Perur Noyyal Main Bridge'), findsOneWidget);
    expect(find.text('Passable for relief convoys.'), findsOneWidget);
  });
}

