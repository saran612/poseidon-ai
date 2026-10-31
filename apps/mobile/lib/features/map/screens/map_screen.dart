import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';
import '../../../core/constants/colors.dart';
import '../../../core/providers.dart';
import '../controllers/map_controller.dart';
import '../models/map_models.dart';
import '../widgets/current_location_button.dart';
import '../widgets/map_entity_bottom_sheet.dart';
import '../widgets/map_layer_controls.dart';
import '../widgets/map_legend.dart';

class MapScreen extends ConsumerStatefulWidget {
  const MapScreen({super.key});

  @override
  ConsumerState<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends ConsumerState<MapScreen> {
  final MapController _mapController = MapController();

  // Realistic Noyyal River Corridor Waypoints in Coimbatore
  static const List<LatLng> _noyyalRiverCoimbatore = [
    LatLng(10.9650, 76.8850),
    LatLng(10.9700, 76.9050),
    LatLng(10.9712, 76.9180), // Perur Bridge
    LatLng(10.9790, 76.9280),
    LatLng(10.9875, 76.9385), // Selvapuram / Siruvani
    LatLng(10.9900, 76.9520),
    LatLng(10.9930, 76.9635), // Ukkadam / Sungam
    LatLng(10.9945, 76.9850),
    LatLng(10.9960, 77.0150),
    LatLng(10.9972, 77.0250), // Singanallur Trichy Rd
    LatLng(10.9950, 77.0420),
    LatLng(10.9940, 77.0550), // Ondipudur
  ];

  // Coimbatore Risk Zones Polygons
  static final List<Polygon> _zonesPolygonsCoimbatore = [
    Polygon(
      points: const [
        LatLng(10.965, 76.905),
        LatLng(10.978, 76.908),
        LatLng(10.975, 76.925),
        LatLng(10.962, 76.920),
      ],
      color: AppColors.critical.withValues(alpha: 0.18),
      borderColor: AppColors.critical,
      borderStrokeWidth: 2,
    ),
    Polygon(
      points: const [
        LatLng(10.982, 76.930),
        LatLng(10.995, 76.932),
        LatLng(10.992, 76.950),
        LatLng(10.979, 76.945),
      ],
      color: AppColors.high.withValues(alpha: 0.18),
      borderColor: AppColors.high,
      borderStrokeWidth: 2,
    ),
    Polygon(
      points: const [
        LatLng(10.985, 76.952),
        LatLng(10.998, 76.955),
        LatLng(10.995, 76.972),
        LatLng(10.982, 76.968),
      ],
      color: AppColors.high.withValues(alpha: 0.18),
      borderColor: AppColors.high,
      borderStrokeWidth: 2,
    ),
    Polygon(
      points: const [
        LatLng(10.990, 77.010),
        LatLng(11.005, 77.012),
        LatLng(11.002, 77.032),
        LatLng(10.988, 77.028),
      ],
      color: AppColors.primaryBlue.withValues(alpha: 0.15),
      borderColor: AppColors.primaryBlue,
      borderStrokeWidth: 2,
    ),
  ];

  // Arterial Road Network Edges
  static const List<List<LatLng>> _roadSegmentsCoimbatore = [
    [LatLng(11.0080, 76.9480), LatLng(10.9880, 76.9400)],
    [LatLng(10.9880, 76.9400), LatLng(10.9708, 76.9152)],
    [LatLng(11.0080, 76.9480), LatLng(10.9915, 76.9610)],
    [LatLng(10.9915, 76.9610), LatLng(11.0020, 76.9710)],
    [LatLng(10.9880, 76.9400), LatLng(10.9915, 76.9610)],
    [LatLng(10.9915, 76.9610), LatLng(10.9980, 77.0220)],
    [LatLng(11.0250, 77.0120), LatLng(10.9980, 77.0220)],
    [LatLng(11.0250, 77.0120), LatLng(11.0020, 76.9710)],
    [LatLng(10.9980, 77.0220), LatLng(11.0010, 77.0260)],
    [LatLng(10.9980, 77.0220), LatLng(10.9940, 77.0550)],
    [LatLng(11.0250, 77.0120), LatLng(10.9940, 77.0550)],
  ];

  @override
  Widget build(BuildContext context) {
    final mapState = ref.watch(mapControllerProvider);
    final mapNotifier = ref.read(mapControllerProvider.notifier);

    final reports = ref.watch(localReportsStreamProvider).valueOrNull ?? [];
    final bridges = ref.watch(localBridgesStreamProvider).valueOrNull ?? [];
    final bridgeLookup = {for (final b in bridges) b.bridgeId: b};

    final candidateBridges = [
      {
        'id': 'BR-PERUR-01',
        'name': 'Perur Noyyal Main Bridge',
        'lat': 10.9712,
        'lon': 76.9180,
        'status': bridgeLookup['BR-PERUR-01']?.status ?? 'OPEN',
        'reason': bridgeLookup['BR-PERUR-01']?.closureReason,
      },
      {
        'id': 'BR-SELVAPURAM-01',
        'name': 'Siruvani Road Canal Crossing',
        'lat': 10.9875,
        'lon': 76.9385,
        'status': bridgeLookup['BR-SELVAPURAM-01']?.status ?? 'OPEN',
        'reason': bridgeLookup['BR-SELVAPURAM-01']?.closureReason,
      },
      {
        'id': 'BR-UKKADAM-01',
        'name': 'Ukkadam Sungam Bypass Bridge',
        'lat': 10.9930,
        'lon': 76.9635,
        'status': bridgeLookup['BR-UKKADAM-01']?.status ?? 'CLOSED',
        'reason': bridgeLookup['BR-UKKADAM-01']?.closureReason ?? 'Flood overtopping by 0.9m',
      },
      {
        'id': 'BR-SINGANALLUR-01',
        'name': 'Singanallur Trichy Road Crossing',
        'lat': 10.9972,
        'lon': 77.0250,
        'status': bridgeLookup['BR-SINGANALLUR-01']?.status ?? 'OPEN',
        'reason': bridgeLookup['BR-SINGANALLUR-01']?.closureReason,
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('OSM Tactical Map'),
        actions: [
          // Scenario Dropdown
          DropdownButtonHideUnderline(
            child: DropdownButton<DisasterScenarioType>(
              value: mapState.scenario,
              icon: const Icon(Icons.arrow_drop_down, color: AppColors.primaryBlue),
              style: const TextStyle(color: AppColors.primaryBlue, fontWeight: FontWeight.w700, fontSize: 12),
              items: DisasterScenarioType.values.map((s) {
                return DropdownMenuItem(
                  value: s,
                  child: Text(s.label),
                );
              }).toList(),
              onChanged: (scen) {
                if (scen != null) {
                  mapNotifier.switchScenario(scen);
                  _mapController.move(scen.center, scen.defaultZoom);
                }
              },
            ),
          ),
          IconButton(
            icon: const Icon(Icons.layers_outlined, color: AppColors.primaryBlue),
            tooltip: 'Layer Controls',
            onPressed: () {
              MapLayerControlsModal.show(
                context,
                layerVisibility: mapState.layerVisibility,
                onToggleLayer: mapNotifier.toggleLayer,
              );
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: mapState.scenario.center,
              initialZoom: mapState.scenario.defaultZoom,
              minZoom: 6.0,
              maxZoom: 18.0,
            ),
            children: [
              // 1. OpenStreetMap TileLayer with clean attribution
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'ai.poseidon.mobile',
                errorTileCallback: (tile, error, stack) {
                  // Graceful offline fallback
                },
              ),

              // 2. Noyyal River Vector Polyline
              if (mapState.layerVisibility['river'] ?? true)
                PolylineLayer(
                  polylines: [
                    Polyline(
                      points: _noyyalRiverCoimbatore,
                      strokeWidth: 8.0,
                      color: const Color(0xFF93C5FD).withValues(alpha: 0.45),
                    ),
                    Polyline(
                      points: _noyyalRiverCoimbatore,
                      strokeWidth: 4.0,
                      color: const Color(0xFF0284C7),
                    ),
                  ],
                ),

              // 3. Risk Zones Polygons Layer
              if (mapState.layerVisibility['zones'] ?? true)
                PolygonLayer(polygons: _zonesPolygonsCoimbatore),

              // 4. Road Network Layer
              if (mapState.layerVisibility['roads'] ?? true)
                PolylineLayer(
                  polylines: _roadSegmentsCoimbatore.map((pts) {
                    return Polyline(
                      points: pts,
                      strokeWidth: 2.5,
                      color: const Color(0xFF64748B).withValues(alpha: 0.8),
                    );
                  }).toList(),
                ),

              // 5. Active Calculated Route Polyline
              if ((mapState.layerVisibility['routes'] ?? true) && mapState.activeRoute != null)
                PolylineLayer(
                  polylines: [
                    Polyline(
                      points: mapState.activeRoute!.waypoints,
                      strokeWidth: 5.0,
                      color: AppColors.safe,
                    ),
                  ],
                ),

              // 6. Interactive Markers Layer
              MarkerLayer(
                markers: [
                  // Candidate Bridges
                  if (mapState.layerVisibility['bridges'] ?? true)
                    ...candidateBridges.map((b) {
                      final isClosed = b['status'] == 'CLOSED';
                      return Marker(
                        point: LatLng(b['lat'] as double, b['lon'] as double),
                        width: 36,
                        height: 36,
                        child: GestureDetector(
                          onTap: () {
                            mapNotifier.selectEntity(
                              MapFeatureEntity(
                                id: b['id'] as String,
                                type: 'BRIDGE',
                                title: b['name'] as String,
                                position: LatLng(b['lat'] as double, b['lon'] as double),
                                status: b['status'] as String,
                                details: isClosed ? 'Closure: ${b['reason'] ?? 'Inundation'}' : 'Passable for relief convoys.',
                              ),
                            );
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              color: isClosed ? AppColors.critical : AppColors.safe,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                              boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 4)],
                            ),
                            child: Icon(
                              isClosed ? Icons.block : Icons.commute,
                              color: Colors.white,
                              size: 18,
                            ),
                          ),
                        ),
                      );
                    }),

                  // Base Depots
                  if (mapState.layerVisibility['depots'] ?? true)
                    Marker(
                      point: const LatLng(11.0080, 76.9480),
                      width: 36,
                      height: 36,
                      child: GestureDetector(
                        onTap: () {
                          mapNotifier.selectEntity(
                            const MapFeatureEntity(
                              id: 'DEPOT_RS_PURAM',
                              type: 'DEPOT',
                              title: 'RS Puram Emergency Base',
                              position: LatLng(11.0080, 76.9480),
                              status: 'OPERATIONAL',
                              details: 'Supply: 10 Rescue Boats, 150 Medical Kits',
                            ),
                          );
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            color: AppColors.primaryBlue,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                          child: const Icon(Icons.warehouse, color: Colors.white, size: 18),
                        ),
                      ),
                    ),

                  // Relief Shelters
                  if (mapState.layerVisibility['shelters'] ?? true)
                    Marker(
                      point: const LatLng(11.0020, 76.9710),
                      width: 36,
                      height: 36,
                      child: GestureDetector(
                        onTap: () {
                          mapNotifier.selectEntity(
                            const MapFeatureEntity(
                              id: 'SHELTER_VOC_PARK',
                              type: 'SHELTER',
                              title: 'VOC Park Stadium Shelter',
                              position: LatLng(11.0020, 76.9710),
                              status: 'ACTIVE',
                              details: 'Capacity: 350 persons • Occupancy: 120 (34%)',
                            ),
                          );
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            color: AppColors.safe,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                          child: const Icon(Icons.night_shelter, color: Colors.white, size: 18),
                        ),
                      ),
                    ),

                  // Critical Hospitals
                  if (mapState.layerVisibility['hospitals'] ?? true)
                    Marker(
                      point: const LatLng(11.0015, 76.9660),
                      width: 36,
                      height: 36,
                      child: GestureDetector(
                        onTap: () {
                          mapNotifier.selectEntity(
                            const MapFeatureEntity(
                              id: 'HOSP_CMCH',
                              type: 'HOSPITAL',
                              title: 'Coimbatore Medical College (CMCH)',
                              position: LatLng(11.0015, 76.9660),
                              status: 'ACTIVE',
                              details: 'Trauma Facility: 45 beds • Available ICU: 12',
                            ),
                          );
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            color: AppColors.critical,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                          child: const Icon(Icons.local_hospital, color: Colors.white, size: 18),
                        ),
                      ),
                    ),

                  // Field Incident Reports
                  if (mapState.layerVisibility['incidents'] ?? true)
                    ...reports.where((r) => r.latitude != null && r.longitude != null).map((r) {
                      return Marker(
                        point: LatLng(r.latitude!, r.longitude!),
                        width: 32,
                        height: 32,
                        child: GestureDetector(
                          onTap: () {
                            mapNotifier.selectEntity(
                              MapFeatureEntity(
                                id: r.reportCode,
                                type: 'INCIDENT',
                                title: r.title,
                                position: LatLng(r.latitude!, r.longitude!),
                                status: r.casualties > 0 ? 'CRITICAL' : 'ACTIVE',
                                details: '${r.category} • ${r.peopleAffected} affected • Sync: ${r.syncStatus}',
                              ),
                            );
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              color: r.casualties > 0 ? AppColors.critical : AppColors.high,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                            ),
                            child: const Icon(Icons.warning, color: Colors.white, size: 16),
                          ),
                        ),
                      );
                    }),
                ],
              ),
            ],
          ),

          // Offline Status & Last Sync Banner
          if (mapState.isOffline)
            Positioned(
              top: 8,
              left: 12,
              right: 12,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.high.withValues(alpha: 0.95),
                  borderRadius: BorderRadius.circular(6),
                  boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)],
                ),
                child: const Row(
                  children: [
                    Icon(Icons.wifi_off, color: Colors.white, size: 14),
                    SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'Offline Mode: Using cached regional OSM tiles & local SQLite data',
                        style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // Map Legend Card
          Positioned(
            top: 40,
            left: 12,
            child: const MapLegendWidget(),
          ),

          // Current Location / Reset Centering Button
          Positioned(
            bottom: mapState.selectedEntity != null ? 180 : 20,
            right: 14,
            child: CurrentLocationButton(
              onCenterLocation: () {
                _mapController.move(mapState.scenario.center, mapState.scenario.defaultZoom);
              },
            ),
          ),

          // Selected Entity Bottom Sheet
          if (mapState.selectedEntity != null)
            Positioned(
              bottom: 12,
              left: 12,
              right: 12,
              child: MapEntityBottomSheet(
                entity: mapState.selectedEntity!,
                onClose: () => mapNotifier.selectEntity(null),
                onPlanRoute: (orig, dest) {
                  mapNotifier.planEmergencyRoute(orig, dest);
                },
              ),
            ),
        ],
      ),
    );
  }
}
