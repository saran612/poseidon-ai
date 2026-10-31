import 'package:dio/dio.dart';
import 'package:latlong2/latlong.dart';
import '../../../config/env.dart';
import '../models/map_models.dart';

class MapRepository {
  final Dio _dio;

  MapRepository({Dio? dio})
      : _dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: '${Environment.defaultBaseUrl}${Environment.apiV1Prefix}',
                connectTimeout: Environment.connectTimeout,
                receiveTimeout: Environment.receiveTimeout,
              ),
            );

  Future<Map<String, dynamic>> fetchOperationsBundle({
    String scenario = 'coimbatore_flood',
    String? role,
    String? token,
  }) async {
    try {
      final headers = <String, dynamic>{};
      if (role != null) headers['x-poseidon-role'] = role;
      if (token != null) headers['x-poseidon-token'] = token;

      final res = await _dio.get(
        '/map/operations',
        queryParameters: {'scenario': scenario},
        options: Options(headers: headers),
      );
      if (res.statusCode == 200 && res.data is Map<String, dynamic>) {
        return res.data as Map<String, dynamic>;
      }
      return {};
    } catch (_) {
      return {};
    }
  }

  Future<TacticalRoute?> calculateRoute({
    required String originId,
    required String destinationId,
    String scenario = 'coimbatore_flood',
  }) async {
    try {
      final res = await _dio.post(
        '/map/routes',
        data: {
          'origin_id': originId,
          'destination_id': destinationId,
          'scenario': scenario,
          'avoid_closed_bridges': true,
        },
      );
      if (res.statusCode == 200 && res.data is Map<String, dynamic>) {
        final data = res.data as Map<String, dynamic>;
        final geom = data['geometry'] as Map<String, dynamic>?;
        final props = data['properties'] as Map<String, dynamic>? ?? {};
        final rawCoords = (geom?['coordinates'] as List?) ?? [];
        final waypoints = rawCoords.map((c) {
          final lon = (c[0] as num).toDouble();
          final lat = (c[1] as num).toDouble();
          return LatLng(lat, lon);
        }).toList();

        return TacticalRoute(
          originId: originId,
          destinationId: destinationId,
          waypoints: waypoints,
          distanceKm: (props['distance_km'] as num?)?.toDouble() ?? 0.0,
          durationMin: (props['estimated_duration_min'] as num?)?.toDouble() ?? 0.0,
          routingStatus: props['routing_status']?.toString() ?? 'VERIFIED_ACCESSIBLE',
        );
      }
      return null;
    } catch (_) {
      return null;
    }
  }
}

