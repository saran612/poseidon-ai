class UserSession {
  final String token;
  final int numericId;
  final String deviceCode;
  final String role;
  final String tier;
  final String ownerName;
  final bool isFieldOfficer;
  final bool isResponder;
  final String secretKey;
  int messageCounter;

  UserSession({
    required this.token,
    required this.numericId,
    required this.deviceCode,
    required this.role,
    required this.tier,
    required this.ownerName,
    required this.isFieldOfficer,
    required this.isResponder,
    required this.secretKey,
    this.messageCounter = 1,
  });

  int getNextCounter() {
    return messageCounter++;
  }

  Map<String, dynamic> toJson() => {
        'token': token,
        'numeric_id': numericId,
        'device_code': deviceCode,
        'role': role,
        'tier': tier,
        'owner_name': ownerName,
        'is_field_officer': isFieldOfficer,
        'is_responder': isResponder,
        'secret_key': secretKey,
        'message_counter': messageCounter,
      };

  factory UserSession.fromJson(Map<String, dynamic> json) => UserSession(
        token: json['token'] ?? '',
        numericId: json['numeric_id'] ?? 0,
        deviceCode: json['device_code'] ?? '',
        role: json['role'] ?? 'T3',
        tier: json['tier'] ?? 'T3',
        ownerName: json['owner_name'] ?? 'Responder',
        isFieldOfficer: json['is_field_officer'] ?? false,
        isResponder: json['is_responder'] ?? true,
        secretKey: json['secret_key'] ?? '',
        messageCounter: json['message_counter'] ?? 1,
      );
}

