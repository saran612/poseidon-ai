import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/env.dart';
import '../models/user_session.dart';

class AuthService {
  final Dio dio;
  static const String _sessionPrefKey = 'poseidon_user_session';
  UserSession? _currentSession;

  AuthService({Dio? dioClient})
      : dio = dioClient ??
            Dio(BaseOptions(
              baseUrl: Environment.defaultBaseUrl,
              connectTimeout: Environment.connectTimeout,
              receiveTimeout: Environment.receiveTimeout,
            ));

  UserSession? get currentSession => _currentSession;
  bool get isAuthenticated => _currentSession != null;

  Future<UserSession?> loadPersistedSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonStr = prefs.getString(_sessionPrefKey);
      if (jsonStr != null) {
        final map = jsonDecode(jsonStr) as Map<String, dynamic>;
        _currentSession = UserSession.fromJson(map);
        return _currentSession;
      }
    } catch (_) {}
    return null;
  }

  Future<UserSession> login({
    required String deviceCode,
    required String secretKey,
  }) async {
    try {
      final response = await dio.post(
        '${Environment.apiV1Prefix}/auth/login',
        data: {
          'device_code': deviceCode,
          'secret_key': secretKey,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data as Map<String, dynamic>;
        _currentSession = UserSession(
          token: data['token'],
          numericId: data['numeric_id'],
          deviceCode: data['device_code'],
          role: data['role'],
          tier: data['tier'] ?? 'T1',
          ownerName: data['owner_name'],
          isFieldOfficer: data['is_field_officer'] ?? false,
          isResponder: data['is_responder'] ?? true,
          secretKey: secretKey,
        );

        await _persistSession(_currentSession!);
        return _currentSession!;
      } else {
        throw Exception('Login failed with status ${response.statusCode}');
      }
    } catch (e) {
      // Offline fallback: check default test devices or previously authenticated session
      if (Environment.defaultTestDevices.containsKey(deviceCode)) {
        final dev = Environment.defaultTestDevices[deviceCode]!;
        if (dev['secret_key'] == secretKey) {
          final isOfficer = dev['role'] == 'T1';
          _currentSession = UserSession(
            token: 'offline-token-${DateTime.now().millisecondsSinceEpoch}',
            numericId: int.parse(dev['numeric_id']!),
            deviceCode: deviceCode,
            role: dev['role']!,
            tier: dev['tier']!,
            ownerName: dev['owner']!,
            isFieldOfficer: isOfficer,
            isResponder: true,
            secretKey: secretKey,
          );
          await _persistSession(_currentSession!);
          return _currentSession!;
        }
      }
      throw Exception('Authentication failed: Invalid credentials or offline without cached credentials.');
    }
  }

  Future<bool> registerDevice({
    required int numericId,
    required String deviceCode,
    required String role,
    required String secretKeyHex,
    required String ownerName,
  }) async {
    final response = await dio.post(
      '${Environment.apiV1Prefix}/auth/register',
      data: {
        'numeric_id': numericId,
        'device_code': deviceCode,
        'role': role,
        'secret_key_hex': secretKeyHex,
        'owner_name': ownerName,
      },
    );
    return response.statusCode == 200;
  }

  Future<void> logout() async {
    _currentSession = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_sessionPrefKey);
  }

  Future<void> _persistSession(UserSession session) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_sessionPrefKey, jsonEncode(session.toJson()));
  }
}

