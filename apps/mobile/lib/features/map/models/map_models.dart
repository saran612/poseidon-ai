import 'package:latlong2/latlong.dart';

enum DisasterScenarioType {
  coimbatoreFlood('coimbatore_flood', 'Coimbatore Noyyal Flood', LatLng(10.9900, 76.9750), 12.0),
  andhraCyclone('andhra_cyclone', 'Andhra Pradesh Cyclone', LatLng(16.5062, 80.6480), 11.0);

  final String id;
  final String label;
  final LatLng center;
  final double defaultZoom;

  const DisasterScenarioType(this.id, this.label, this.center, this.defaultZoom);
}

class MapFeatureEntity {
  final String id;
  final String type; // BRIDGE, ZONE, DEPOT, SHELTER, HOSPITAL, INCIDENT, ROAD
  final String title;
  final LatLng? position;
  final String status;
  final String details;
  final Map<String, dynamic> rawProperties;

  const MapFeatureEntity({
    required this.id,
    required this.type,
    required this.title,
    this.position,
    required this.status,
    required this.details,
    this.rawProperties = const {},
  });
}

class TacticalRoute {
  final String originId;
  final String destinationId;
  final List<LatLng> waypoints;
  final double distanceKm;
  final double durationMin;
  final String routingStatus; // VERIFIED_ACCESSIBLE, PROPOSED, BLOCKED

  const TacticalRoute({
    required this.originId,
    required this.destinationId,
    required this.waypoints,
    required this.distanceKm,
    required this.durationMin,
    required this.routingStatus,
  });
}

