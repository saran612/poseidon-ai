import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers.dart';
import '../models/map_models.dart';
import '../repositories/map_repository.dart';

class MapState {
  final DisasterScenarioType scenario;
  final Map<String, bool> layerVisibility;
  final MapFeatureEntity? selectedEntity;
  final TacticalRoute? activeRoute;
  final bool isLoading;
  final bool isOffline;
  final DateTime? lastSync;
  final Map<String, dynamic> remoteBundle;

  const MapState({
    required this.scenario,
    required this.layerVisibility,
    this.selectedEntity,
    this.activeRoute,
    this.isLoading = false,
    this.isOffline = false,
    this.lastSync,
    this.remoteBundle = const {},
  });

  MapState copyWith({
    DisasterScenarioType? scenario,
    Map<String, bool>? layerVisibility,
    MapFeatureEntity? Function()? selectedEntity,
    TacticalRoute? Function()? activeRoute,
    bool? isLoading,
    bool? isOffline,
    DateTime? lastSync,
    Map<String, dynamic>? remoteBundle,
  }) {
    return MapState(
      scenario: scenario ?? this.scenario,
      layerVisibility: layerVisibility ?? this.layerVisibility,
      selectedEntity: selectedEntity != null ? selectedEntity() : this.selectedEntity,
      activeRoute: activeRoute != null ? activeRoute() : this.activeRoute,
      isLoading: isLoading ?? this.isLoading,
      isOffline: isOffline ?? this.isOffline,
      lastSync: lastSync ?? this.lastSync,
      remoteBundle: remoteBundle ?? this.remoteBundle,
    );
  }
}

class MapControllerNotifier extends Notifier<MapState> {
  @override
  MapState build() {
    Future.microtask(() => loadMapData());
    return MapState(
      scenario: DisasterScenarioType.coimbatoreFlood,
      layerVisibility: const {
        'zones': true,
        'river': true,
        'roads': true,
        'bridges': true,
        'incidents': true,
        'shelters': true,
        'depots': true,
        'hospitals': true,
        'routes': true,
      },
      lastSync: DateTime.now(),
    );
  }

  Future<void> loadMapData() async {
    state = state.copyWith(isLoading: true);
    final repo = ref.read(mapRepositoryProvider);
    final session = ref.read(sessionProvider);
    final bundle = await repo.fetchOperationsBundle(
      scenario: state.scenario.id,
      role: session?.role,
      token: session?.token,
    );

    final isOffline = bundle.isEmpty;
    state = state.copyWith(
      isLoading: false,
      isOffline: isOffline,
      lastSync: isOffline ? state.lastSync : DateTime.now(),
      remoteBundle: bundle,
    );
  }

  void switchScenario(DisasterScenarioType newScenario) {
    state = state.copyWith(
      scenario: newScenario,
      selectedEntity: () => null,
      activeRoute: () => null,
    );
    loadMapData();
  }

  void toggleLayer(String layerKey) {
    final current = Map<String, bool>.from(state.layerVisibility);
    current[layerKey] = !(current[layerKey] ?? true);
    state = state.copyWith(layerVisibility: current);
  }

  void selectEntity(MapFeatureEntity? entity) {
    state = state.copyWith(selectedEntity: () => entity);
  }

  Future<void> planEmergencyRoute(String originId, String destinationId) async {
    state = state.copyWith(isLoading: true);
    final repo = ref.read(mapRepositoryProvider);
    final route = await repo.calculateRoute(
      originId: originId,
      destinationId: destinationId,
      scenario: state.scenario.id,
    );
    state = state.copyWith(
      isLoading: false,
      activeRoute: () => route,
    );
  }

  void clearRoute() {
    state = state.copyWith(activeRoute: () => null);
  }
}

final mapRepositoryProvider = Provider<MapRepository>((ref) {
  return MapRepository();
});

final mapControllerProvider = NotifierProvider<MapControllerNotifier, MapState>(() {
  return MapControllerNotifier();
});
