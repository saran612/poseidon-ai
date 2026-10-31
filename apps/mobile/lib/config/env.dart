class Environment {
  Environment._();

  static const String appName = 'POSEIDON AI Mobile';
  static const String appVersion = '1.0.0';

  // Base API URLs
  static String defaultBaseUrl = 'http://127.0.0.1:8000';
  static const String apiV1Prefix = '/api/v1';

  // WebSocket URL
  static String defaultWsUrl = 'ws://127.0.0.1:8000/api/v1/ws/updates';

  // Network Timeouts
  static const Duration connectTimeout = Duration(seconds: 10);
  static const Duration receiveTimeout = Duration(seconds: 15);

  // Sync Outbox & Backoff
  static const int maxRetryAttempts = 5;
  static const Duration baseRetryDelay = Duration(seconds: 2);
  static const Duration maxRetryDelay = Duration(seconds: 32);

  // Default seeded testing devices
  static const Map<String, Map<String, String>> defaultTestDevices = {
    'DEV-OFFICER-PERUR': {
      'numeric_id': '101',
      'role': 'T1',
      'secret_key': 'poseidon-field-officer-key-32b!',
      'owner': 'Inspector S. Murugan (NDRF/SDMA)',
      'tier': 'T1 (Authoritative Government)',
    },
    'DEV-CITIZEN-UKKADAM': {
      'numeric_id': '303',
      'role': 'T3',
      'secret_key': 'poseidon-citizen-volunteer-key32',
      'owner': 'K. Arumugam (Resident Volunteer)',
      'tier': 'T3 (Field Responder / Volunteer)',
    },
  };
}

