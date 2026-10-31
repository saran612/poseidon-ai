// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'local_database.dart';

// ignore_for_file: type=lint
class $OutboxEntriesTable extends OutboxEntries
    with TableInfo<$OutboxEntriesTable, OutboxEntry> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $OutboxEntriesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _originIdMeta = const VerificationMeta(
    'originId',
  );
  @override
  late final GeneratedColumn<String> originId = GeneratedColumn<String>(
    'origin_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _deviceIdMeta = const VerificationMeta(
    'deviceId',
  );
  @override
  late final GeneratedColumn<String> deviceId = GeneratedColumn<String>(
    'device_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _itemTypeMeta = const VerificationMeta(
    'itemType',
  );
  @override
  late final GeneratedColumn<String> itemType = GeneratedColumn<String>(
    'item_type',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _payloadJsonMeta = const VerificationMeta(
    'payloadJson',
  );
  @override
  late final GeneratedColumn<String> payloadJson = GeneratedColumn<String>(
    'payload_json',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _rawPayloadHexMeta = const VerificationMeta(
    'rawPayloadHex',
  );
  @override
  late final GeneratedColumn<String> rawPayloadHex = GeneratedColumn<String>(
    'raw_payload_hex',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _transportPreferenceMeta =
      const VerificationMeta('transportPreference');
  @override
  late final GeneratedColumn<String> transportPreference =
      GeneratedColumn<String>(
        'transport_preference',
        aliasedName,
        false,
        type: DriftSqlType.string,
        requiredDuringInsert: false,
        defaultValue: const Constant('WIFI'),
      );
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
    'status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('PENDING'),
  );
  static const VerificationMeta _retryCountMeta = const VerificationMeta(
    'retryCount',
  );
  @override
  late final GeneratedColumn<int> retryCount = GeneratedColumn<int>(
    'retry_count',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(0),
  );
  static const VerificationMeta _maxRetriesMeta = const VerificationMeta(
    'maxRetries',
  );
  @override
  late final GeneratedColumn<int> maxRetries = GeneratedColumn<int>(
    'max_retries',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(5),
  );
  static const VerificationMeta _nextRetryAtMeta = const VerificationMeta(
    'nextRetryAt',
  );
  @override
  late final GeneratedColumn<DateTime> nextRetryAt = GeneratedColumn<DateTime>(
    'next_retry_at',
    aliasedName,
    true,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _lastErrorMeta = const VerificationMeta(
    'lastError',
  );
  @override
  late final GeneratedColumn<String> lastError = GeneratedColumn<String>(
    'last_error',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _serverAckIdMeta = const VerificationMeta(
    'serverAckId',
  );
  @override
  late final GeneratedColumn<String> serverAckId = GeneratedColumn<String>(
    'server_ack_id',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _observedAtMeta = const VerificationMeta(
    'observedAt',
  );
  @override
  late final GeneratedColumn<DateTime> observedAt = GeneratedColumn<DateTime>(
    'observed_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _syncedAtMeta = const VerificationMeta(
    'syncedAt',
  );
  @override
  late final GeneratedColumn<DateTime> syncedAt = GeneratedColumn<DateTime>(
    'synced_at',
    aliasedName,
    true,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    originId,
    deviceId,
    itemType,
    payloadJson,
    rawPayloadHex,
    transportPreference,
    status,
    retryCount,
    maxRetries,
    nextRetryAt,
    lastError,
    serverAckId,
    createdAt,
    observedAt,
    syncedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'outbox_entries';
  @override
  VerificationContext validateIntegrity(
    Insertable<OutboxEntry> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('origin_id')) {
      context.handle(
        _originIdMeta,
        originId.isAcceptableOrUnknown(data['origin_id']!, _originIdMeta),
      );
    } else if (isInserting) {
      context.missing(_originIdMeta);
    }
    if (data.containsKey('device_id')) {
      context.handle(
        _deviceIdMeta,
        deviceId.isAcceptableOrUnknown(data['device_id']!, _deviceIdMeta),
      );
    } else if (isInserting) {
      context.missing(_deviceIdMeta);
    }
    if (data.containsKey('item_type')) {
      context.handle(
        _itemTypeMeta,
        itemType.isAcceptableOrUnknown(data['item_type']!, _itemTypeMeta),
      );
    } else if (isInserting) {
      context.missing(_itemTypeMeta);
    }
    if (data.containsKey('payload_json')) {
      context.handle(
        _payloadJsonMeta,
        payloadJson.isAcceptableOrUnknown(
          data['payload_json']!,
          _payloadJsonMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_payloadJsonMeta);
    }
    if (data.containsKey('raw_payload_hex')) {
      context.handle(
        _rawPayloadHexMeta,
        rawPayloadHex.isAcceptableOrUnknown(
          data['raw_payload_hex']!,
          _rawPayloadHexMeta,
        ),
      );
    }
    if (data.containsKey('transport_preference')) {
      context.handle(
        _transportPreferenceMeta,
        transportPreference.isAcceptableOrUnknown(
          data['transport_preference']!,
          _transportPreferenceMeta,
        ),
      );
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    }
    if (data.containsKey('retry_count')) {
      context.handle(
        _retryCountMeta,
        retryCount.isAcceptableOrUnknown(data['retry_count']!, _retryCountMeta),
      );
    }
    if (data.containsKey('max_retries')) {
      context.handle(
        _maxRetriesMeta,
        maxRetries.isAcceptableOrUnknown(data['max_retries']!, _maxRetriesMeta),
      );
    }
    if (data.containsKey('next_retry_at')) {
      context.handle(
        _nextRetryAtMeta,
        nextRetryAt.isAcceptableOrUnknown(
          data['next_retry_at']!,
          _nextRetryAtMeta,
        ),
      );
    }
    if (data.containsKey('last_error')) {
      context.handle(
        _lastErrorMeta,
        lastError.isAcceptableOrUnknown(data['last_error']!, _lastErrorMeta),
      );
    }
    if (data.containsKey('server_ack_id')) {
      context.handle(
        _serverAckIdMeta,
        serverAckId.isAcceptableOrUnknown(
          data['server_ack_id']!,
          _serverAckIdMeta,
        ),
      );
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('observed_at')) {
      context.handle(
        _observedAtMeta,
        observedAt.isAcceptableOrUnknown(data['observed_at']!, _observedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_observedAtMeta);
    }
    if (data.containsKey('synced_at')) {
      context.handle(
        _syncedAtMeta,
        syncedAt.isAcceptableOrUnknown(data['synced_at']!, _syncedAtMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  OutboxEntry map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return OutboxEntry(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      originId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}origin_id'],
      )!,
      deviceId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}device_id'],
      )!,
      itemType: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}item_type'],
      )!,
      payloadJson: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}payload_json'],
      )!,
      rawPayloadHex: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}raw_payload_hex'],
      ),
      transportPreference: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}transport_preference'],
      )!,
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
      retryCount: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}retry_count'],
      )!,
      maxRetries: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}max_retries'],
      )!,
      nextRetryAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}next_retry_at'],
      ),
      lastError: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}last_error'],
      ),
      serverAckId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}server_ack_id'],
      ),
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}created_at'],
      )!,
      observedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}observed_at'],
      )!,
      syncedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}synced_at'],
      ),
    );
  }

  @override
  $OutboxEntriesTable createAlias(String alias) {
    return $OutboxEntriesTable(attachedDatabase, alias);
  }
}

class OutboxEntry extends DataClass implements Insertable<OutboxEntry> {
  final String id;
  final String originId;
  final String deviceId;
  final String itemType;
  final String payloadJson;
  final String? rawPayloadHex;
  final String transportPreference;
  final String status;
  final int retryCount;
  final int maxRetries;
  final DateTime? nextRetryAt;
  final String? lastError;
  final String? serverAckId;
  final DateTime createdAt;
  final DateTime observedAt;
  final DateTime? syncedAt;
  const OutboxEntry({
    required this.id,
    required this.originId,
    required this.deviceId,
    required this.itemType,
    required this.payloadJson,
    this.rawPayloadHex,
    required this.transportPreference,
    required this.status,
    required this.retryCount,
    required this.maxRetries,
    this.nextRetryAt,
    this.lastError,
    this.serverAckId,
    required this.createdAt,
    required this.observedAt,
    this.syncedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['origin_id'] = Variable<String>(originId);
    map['device_id'] = Variable<String>(deviceId);
    map['item_type'] = Variable<String>(itemType);
    map['payload_json'] = Variable<String>(payloadJson);
    if (!nullToAbsent || rawPayloadHex != null) {
      map['raw_payload_hex'] = Variable<String>(rawPayloadHex);
    }
    map['transport_preference'] = Variable<String>(transportPreference);
    map['status'] = Variable<String>(status);
    map['retry_count'] = Variable<int>(retryCount);
    map['max_retries'] = Variable<int>(maxRetries);
    if (!nullToAbsent || nextRetryAt != null) {
      map['next_retry_at'] = Variable<DateTime>(nextRetryAt);
    }
    if (!nullToAbsent || lastError != null) {
      map['last_error'] = Variable<String>(lastError);
    }
    if (!nullToAbsent || serverAckId != null) {
      map['server_ack_id'] = Variable<String>(serverAckId);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    map['observed_at'] = Variable<DateTime>(observedAt);
    if (!nullToAbsent || syncedAt != null) {
      map['synced_at'] = Variable<DateTime>(syncedAt);
    }
    return map;
  }

  OutboxEntriesCompanion toCompanion(bool nullToAbsent) {
    return OutboxEntriesCompanion(
      id: Value(id),
      originId: Value(originId),
      deviceId: Value(deviceId),
      itemType: Value(itemType),
      payloadJson: Value(payloadJson),
      rawPayloadHex: rawPayloadHex == null && nullToAbsent
          ? const Value.absent()
          : Value(rawPayloadHex),
      transportPreference: Value(transportPreference),
      status: Value(status),
      retryCount: Value(retryCount),
      maxRetries: Value(maxRetries),
      nextRetryAt: nextRetryAt == null && nullToAbsent
          ? const Value.absent()
          : Value(nextRetryAt),
      lastError: lastError == null && nullToAbsent
          ? const Value.absent()
          : Value(lastError),
      serverAckId: serverAckId == null && nullToAbsent
          ? const Value.absent()
          : Value(serverAckId),
      createdAt: Value(createdAt),
      observedAt: Value(observedAt),
      syncedAt: syncedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(syncedAt),
    );
  }

  factory OutboxEntry.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return OutboxEntry(
      id: serializer.fromJson<String>(json['id']),
      originId: serializer.fromJson<String>(json['originId']),
      deviceId: serializer.fromJson<String>(json['deviceId']),
      itemType: serializer.fromJson<String>(json['itemType']),
      payloadJson: serializer.fromJson<String>(json['payloadJson']),
      rawPayloadHex: serializer.fromJson<String?>(json['rawPayloadHex']),
      transportPreference: serializer.fromJson<String>(
        json['transportPreference'],
      ),
      status: serializer.fromJson<String>(json['status']),
      retryCount: serializer.fromJson<int>(json['retryCount']),
      maxRetries: serializer.fromJson<int>(json['maxRetries']),
      nextRetryAt: serializer.fromJson<DateTime?>(json['nextRetryAt']),
      lastError: serializer.fromJson<String?>(json['lastError']),
      serverAckId: serializer.fromJson<String?>(json['serverAckId']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      observedAt: serializer.fromJson<DateTime>(json['observedAt']),
      syncedAt: serializer.fromJson<DateTime?>(json['syncedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'originId': serializer.toJson<String>(originId),
      'deviceId': serializer.toJson<String>(deviceId),
      'itemType': serializer.toJson<String>(itemType),
      'payloadJson': serializer.toJson<String>(payloadJson),
      'rawPayloadHex': serializer.toJson<String?>(rawPayloadHex),
      'transportPreference': serializer.toJson<String>(transportPreference),
      'status': serializer.toJson<String>(status),
      'retryCount': serializer.toJson<int>(retryCount),
      'maxRetries': serializer.toJson<int>(maxRetries),
      'nextRetryAt': serializer.toJson<DateTime?>(nextRetryAt),
      'lastError': serializer.toJson<String?>(lastError),
      'serverAckId': serializer.toJson<String?>(serverAckId),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'observedAt': serializer.toJson<DateTime>(observedAt),
      'syncedAt': serializer.toJson<DateTime?>(syncedAt),
    };
  }

  OutboxEntry copyWith({
    String? id,
    String? originId,
    String? deviceId,
    String? itemType,
    String? payloadJson,
    Value<String?> rawPayloadHex = const Value.absent(),
    String? transportPreference,
    String? status,
    int? retryCount,
    int? maxRetries,
    Value<DateTime?> nextRetryAt = const Value.absent(),
    Value<String?> lastError = const Value.absent(),
    Value<String?> serverAckId = const Value.absent(),
    DateTime? createdAt,
    DateTime? observedAt,
    Value<DateTime?> syncedAt = const Value.absent(),
  }) => OutboxEntry(
    id: id ?? this.id,
    originId: originId ?? this.originId,
    deviceId: deviceId ?? this.deviceId,
    itemType: itemType ?? this.itemType,
    payloadJson: payloadJson ?? this.payloadJson,
    rawPayloadHex: rawPayloadHex.present
        ? rawPayloadHex.value
        : this.rawPayloadHex,
    transportPreference: transportPreference ?? this.transportPreference,
    status: status ?? this.status,
    retryCount: retryCount ?? this.retryCount,
    maxRetries: maxRetries ?? this.maxRetries,
    nextRetryAt: nextRetryAt.present ? nextRetryAt.value : this.nextRetryAt,
    lastError: lastError.present ? lastError.value : this.lastError,
    serverAckId: serverAckId.present ? serverAckId.value : this.serverAckId,
    createdAt: createdAt ?? this.createdAt,
    observedAt: observedAt ?? this.observedAt,
    syncedAt: syncedAt.present ? syncedAt.value : this.syncedAt,
  );
  OutboxEntry copyWithCompanion(OutboxEntriesCompanion data) {
    return OutboxEntry(
      id: data.id.present ? data.id.value : this.id,
      originId: data.originId.present ? data.originId.value : this.originId,
      deviceId: data.deviceId.present ? data.deviceId.value : this.deviceId,
      itemType: data.itemType.present ? data.itemType.value : this.itemType,
      payloadJson: data.payloadJson.present
          ? data.payloadJson.value
          : this.payloadJson,
      rawPayloadHex: data.rawPayloadHex.present
          ? data.rawPayloadHex.value
          : this.rawPayloadHex,
      transportPreference: data.transportPreference.present
          ? data.transportPreference.value
          : this.transportPreference,
      status: data.status.present ? data.status.value : this.status,
      retryCount: data.retryCount.present
          ? data.retryCount.value
          : this.retryCount,
      maxRetries: data.maxRetries.present
          ? data.maxRetries.value
          : this.maxRetries,
      nextRetryAt: data.nextRetryAt.present
          ? data.nextRetryAt.value
          : this.nextRetryAt,
      lastError: data.lastError.present ? data.lastError.value : this.lastError,
      serverAckId: data.serverAckId.present
          ? data.serverAckId.value
          : this.serverAckId,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      observedAt: data.observedAt.present
          ? data.observedAt.value
          : this.observedAt,
      syncedAt: data.syncedAt.present ? data.syncedAt.value : this.syncedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('OutboxEntry(')
          ..write('id: $id, ')
          ..write('originId: $originId, ')
          ..write('deviceId: $deviceId, ')
          ..write('itemType: $itemType, ')
          ..write('payloadJson: $payloadJson, ')
          ..write('rawPayloadHex: $rawPayloadHex, ')
          ..write('transportPreference: $transportPreference, ')
          ..write('status: $status, ')
          ..write('retryCount: $retryCount, ')
          ..write('maxRetries: $maxRetries, ')
          ..write('nextRetryAt: $nextRetryAt, ')
          ..write('lastError: $lastError, ')
          ..write('serverAckId: $serverAckId, ')
          ..write('createdAt: $createdAt, ')
          ..write('observedAt: $observedAt, ')
          ..write('syncedAt: $syncedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    originId,
    deviceId,
    itemType,
    payloadJson,
    rawPayloadHex,
    transportPreference,
    status,
    retryCount,
    maxRetries,
    nextRetryAt,
    lastError,
    serverAckId,
    createdAt,
    observedAt,
    syncedAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is OutboxEntry &&
          other.id == this.id &&
          other.originId == this.originId &&
          other.deviceId == this.deviceId &&
          other.itemType == this.itemType &&
          other.payloadJson == this.payloadJson &&
          other.rawPayloadHex == this.rawPayloadHex &&
          other.transportPreference == this.transportPreference &&
          other.status == this.status &&
          other.retryCount == this.retryCount &&
          other.maxRetries == this.maxRetries &&
          other.nextRetryAt == this.nextRetryAt &&
          other.lastError == this.lastError &&
          other.serverAckId == this.serverAckId &&
          other.createdAt == this.createdAt &&
          other.observedAt == this.observedAt &&
          other.syncedAt == this.syncedAt);
}

class OutboxEntriesCompanion extends UpdateCompanion<OutboxEntry> {
  final Value<String> id;
  final Value<String> originId;
  final Value<String> deviceId;
  final Value<String> itemType;
  final Value<String> payloadJson;
  final Value<String?> rawPayloadHex;
  final Value<String> transportPreference;
  final Value<String> status;
  final Value<int> retryCount;
  final Value<int> maxRetries;
  final Value<DateTime?> nextRetryAt;
  final Value<String?> lastError;
  final Value<String?> serverAckId;
  final Value<DateTime> createdAt;
  final Value<DateTime> observedAt;
  final Value<DateTime?> syncedAt;
  final Value<int> rowid;
  const OutboxEntriesCompanion({
    this.id = const Value.absent(),
    this.originId = const Value.absent(),
    this.deviceId = const Value.absent(),
    this.itemType = const Value.absent(),
    this.payloadJson = const Value.absent(),
    this.rawPayloadHex = const Value.absent(),
    this.transportPreference = const Value.absent(),
    this.status = const Value.absent(),
    this.retryCount = const Value.absent(),
    this.maxRetries = const Value.absent(),
    this.nextRetryAt = const Value.absent(),
    this.lastError = const Value.absent(),
    this.serverAckId = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.observedAt = const Value.absent(),
    this.syncedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  OutboxEntriesCompanion.insert({
    required String id,
    required String originId,
    required String deviceId,
    required String itemType,
    required String payloadJson,
    this.rawPayloadHex = const Value.absent(),
    this.transportPreference = const Value.absent(),
    this.status = const Value.absent(),
    this.retryCount = const Value.absent(),
    this.maxRetries = const Value.absent(),
    this.nextRetryAt = const Value.absent(),
    this.lastError = const Value.absent(),
    this.serverAckId = const Value.absent(),
    required DateTime createdAt,
    required DateTime observedAt,
    this.syncedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       originId = Value(originId),
       deviceId = Value(deviceId),
       itemType = Value(itemType),
       payloadJson = Value(payloadJson),
       createdAt = Value(createdAt),
       observedAt = Value(observedAt);
  static Insertable<OutboxEntry> custom({
    Expression<String>? id,
    Expression<String>? originId,
    Expression<String>? deviceId,
    Expression<String>? itemType,
    Expression<String>? payloadJson,
    Expression<String>? rawPayloadHex,
    Expression<String>? transportPreference,
    Expression<String>? status,
    Expression<int>? retryCount,
    Expression<int>? maxRetries,
    Expression<DateTime>? nextRetryAt,
    Expression<String>? lastError,
    Expression<String>? serverAckId,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? observedAt,
    Expression<DateTime>? syncedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (originId != null) 'origin_id': originId,
      if (deviceId != null) 'device_id': deviceId,
      if (itemType != null) 'item_type': itemType,
      if (payloadJson != null) 'payload_json': payloadJson,
      if (rawPayloadHex != null) 'raw_payload_hex': rawPayloadHex,
      if (transportPreference != null)
        'transport_preference': transportPreference,
      if (status != null) 'status': status,
      if (retryCount != null) 'retry_count': retryCount,
      if (maxRetries != null) 'max_retries': maxRetries,
      if (nextRetryAt != null) 'next_retry_at': nextRetryAt,
      if (lastError != null) 'last_error': lastError,
      if (serverAckId != null) 'server_ack_id': serverAckId,
      if (createdAt != null) 'created_at': createdAt,
      if (observedAt != null) 'observed_at': observedAt,
      if (syncedAt != null) 'synced_at': syncedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  OutboxEntriesCompanion copyWith({
    Value<String>? id,
    Value<String>? originId,
    Value<String>? deviceId,
    Value<String>? itemType,
    Value<String>? payloadJson,
    Value<String?>? rawPayloadHex,
    Value<String>? transportPreference,
    Value<String>? status,
    Value<int>? retryCount,
    Value<int>? maxRetries,
    Value<DateTime?>? nextRetryAt,
    Value<String?>? lastError,
    Value<String?>? serverAckId,
    Value<DateTime>? createdAt,
    Value<DateTime>? observedAt,
    Value<DateTime?>? syncedAt,
    Value<int>? rowid,
  }) {
    return OutboxEntriesCompanion(
      id: id ?? this.id,
      originId: originId ?? this.originId,
      deviceId: deviceId ?? this.deviceId,
      itemType: itemType ?? this.itemType,
      payloadJson: payloadJson ?? this.payloadJson,
      rawPayloadHex: rawPayloadHex ?? this.rawPayloadHex,
      transportPreference: transportPreference ?? this.transportPreference,
      status: status ?? this.status,
      retryCount: retryCount ?? this.retryCount,
      maxRetries: maxRetries ?? this.maxRetries,
      nextRetryAt: nextRetryAt ?? this.nextRetryAt,
      lastError: lastError ?? this.lastError,
      serverAckId: serverAckId ?? this.serverAckId,
      createdAt: createdAt ?? this.createdAt,
      observedAt: observedAt ?? this.observedAt,
      syncedAt: syncedAt ?? this.syncedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (originId.present) {
      map['origin_id'] = Variable<String>(originId.value);
    }
    if (deviceId.present) {
      map['device_id'] = Variable<String>(deviceId.value);
    }
    if (itemType.present) {
      map['item_type'] = Variable<String>(itemType.value);
    }
    if (payloadJson.present) {
      map['payload_json'] = Variable<String>(payloadJson.value);
    }
    if (rawPayloadHex.present) {
      map['raw_payload_hex'] = Variable<String>(rawPayloadHex.value);
    }
    if (transportPreference.present) {
      map['transport_preference'] = Variable<String>(transportPreference.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (retryCount.present) {
      map['retry_count'] = Variable<int>(retryCount.value);
    }
    if (maxRetries.present) {
      map['max_retries'] = Variable<int>(maxRetries.value);
    }
    if (nextRetryAt.present) {
      map['next_retry_at'] = Variable<DateTime>(nextRetryAt.value);
    }
    if (lastError.present) {
      map['last_error'] = Variable<String>(lastError.value);
    }
    if (serverAckId.present) {
      map['server_ack_id'] = Variable<String>(serverAckId.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (observedAt.present) {
      map['observed_at'] = Variable<DateTime>(observedAt.value);
    }
    if (syncedAt.present) {
      map['synced_at'] = Variable<DateTime>(syncedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('OutboxEntriesCompanion(')
          ..write('id: $id, ')
          ..write('originId: $originId, ')
          ..write('deviceId: $deviceId, ')
          ..write('itemType: $itemType, ')
          ..write('payloadJson: $payloadJson, ')
          ..write('rawPayloadHex: $rawPayloadHex, ')
          ..write('transportPreference: $transportPreference, ')
          ..write('status: $status, ')
          ..write('retryCount: $retryCount, ')
          ..write('maxRetries: $maxRetries, ')
          ..write('nextRetryAt: $nextRetryAt, ')
          ..write('lastError: $lastError, ')
          ..write('serverAckId: $serverAckId, ')
          ..write('createdAt: $createdAt, ')
          ..write('observedAt: $observedAt, ')
          ..write('syncedAt: $syncedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $IncidentReportsTable extends IncidentReports
    with TableInfo<$IncidentReportsTable, IncidentReport> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $IncidentReportsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _reportCodeMeta = const VerificationMeta(
    'reportCode',
  );
  @override
  late final GeneratedColumn<String> reportCode = GeneratedColumn<String>(
    'report_code',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _categoryMeta = const VerificationMeta(
    'category',
  );
  @override
  late final GeneratedColumn<String> category = GeneratedColumn<String>(
    'category',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _titleMeta = const VerificationMeta('title');
  @override
  late final GeneratedColumn<String> title = GeneratedColumn<String>(
    'title',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _descriptionMeta = const VerificationMeta(
    'description',
  );
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
    'description',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _latitudeMeta = const VerificationMeta(
    'latitude',
  );
  @override
  late final GeneratedColumn<double> latitude = GeneratedColumn<double>(
    'latitude',
    aliasedName,
    true,
    type: DriftSqlType.double,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _longitudeMeta = const VerificationMeta(
    'longitude',
  );
  @override
  late final GeneratedColumn<double> longitude = GeneratedColumn<double>(
    'longitude',
    aliasedName,
    true,
    type: DriftSqlType.double,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _peopleAffectedMeta = const VerificationMeta(
    'peopleAffected',
  );
  @override
  late final GeneratedColumn<int> peopleAffected = GeneratedColumn<int>(
    'people_affected',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(0),
  );
  static const VerificationMeta _casualtiesMeta = const VerificationMeta(
    'casualties',
  );
  @override
  late final GeneratedColumn<int> casualties = GeneratedColumn<int>(
    'casualties',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(0),
  );
  static const VerificationMeta _photoPathMeta = const VerificationMeta(
    'photoPath',
  );
  @override
  late final GeneratedColumn<String> photoPath = GeneratedColumn<String>(
    'photo_path',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _photoPendingUploadMeta =
      const VerificationMeta('photoPendingUpload');
  @override
  late final GeneratedColumn<bool> photoPendingUpload = GeneratedColumn<bool>(
    'photo_pending_upload',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("photo_pending_upload" IN (0, 1))',
    ),
    defaultValue: const Constant(false),
  );
  static const VerificationMeta _syncStatusMeta = const VerificationMeta(
    'syncStatus',
  );
  @override
  late final GeneratedColumn<String> syncStatus = GeneratedColumn<String>(
    'sync_status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('PENDING'),
  );
  static const VerificationMeta _syncErrorMeta = const VerificationMeta(
    'syncError',
  );
  @override
  late final GeneratedColumn<String> syncError = GeneratedColumn<String>(
    'sync_error',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _observedAtMeta = const VerificationMeta(
    'observedAt',
  );
  @override
  late final GeneratedColumn<DateTime> observedAt = GeneratedColumn<DateTime>(
    'observed_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _syncedAtMeta = const VerificationMeta(
    'syncedAt',
  );
  @override
  late final GeneratedColumn<DateTime> syncedAt = GeneratedColumn<DateTime>(
    'synced_at',
    aliasedName,
    true,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _isDeletedMeta = const VerificationMeta(
    'isDeleted',
  );
  @override
  late final GeneratedColumn<bool> isDeleted = GeneratedColumn<bool>(
    'is_deleted',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("is_deleted" IN (0, 1))',
    ),
    defaultValue: const Constant(false),
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    reportCode,
    category,
    title,
    description,
    latitude,
    longitude,
    peopleAffected,
    casualties,
    photoPath,
    photoPendingUpload,
    syncStatus,
    syncError,
    observedAt,
    createdAt,
    syncedAt,
    isDeleted,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'incident_reports';
  @override
  VerificationContext validateIntegrity(
    Insertable<IncidentReport> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('report_code')) {
      context.handle(
        _reportCodeMeta,
        reportCode.isAcceptableOrUnknown(data['report_code']!, _reportCodeMeta),
      );
    } else if (isInserting) {
      context.missing(_reportCodeMeta);
    }
    if (data.containsKey('category')) {
      context.handle(
        _categoryMeta,
        category.isAcceptableOrUnknown(data['category']!, _categoryMeta),
      );
    } else if (isInserting) {
      context.missing(_categoryMeta);
    }
    if (data.containsKey('title')) {
      context.handle(
        _titleMeta,
        title.isAcceptableOrUnknown(data['title']!, _titleMeta),
      );
    } else if (isInserting) {
      context.missing(_titleMeta);
    }
    if (data.containsKey('description')) {
      context.handle(
        _descriptionMeta,
        description.isAcceptableOrUnknown(
          data['description']!,
          _descriptionMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_descriptionMeta);
    }
    if (data.containsKey('latitude')) {
      context.handle(
        _latitudeMeta,
        latitude.isAcceptableOrUnknown(data['latitude']!, _latitudeMeta),
      );
    }
    if (data.containsKey('longitude')) {
      context.handle(
        _longitudeMeta,
        longitude.isAcceptableOrUnknown(data['longitude']!, _longitudeMeta),
      );
    }
    if (data.containsKey('people_affected')) {
      context.handle(
        _peopleAffectedMeta,
        peopleAffected.isAcceptableOrUnknown(
          data['people_affected']!,
          _peopleAffectedMeta,
        ),
      );
    }
    if (data.containsKey('casualties')) {
      context.handle(
        _casualtiesMeta,
        casualties.isAcceptableOrUnknown(data['casualties']!, _casualtiesMeta),
      );
    }
    if (data.containsKey('photo_path')) {
      context.handle(
        _photoPathMeta,
        photoPath.isAcceptableOrUnknown(data['photo_path']!, _photoPathMeta),
      );
    }
    if (data.containsKey('photo_pending_upload')) {
      context.handle(
        _photoPendingUploadMeta,
        photoPendingUpload.isAcceptableOrUnknown(
          data['photo_pending_upload']!,
          _photoPendingUploadMeta,
        ),
      );
    }
    if (data.containsKey('sync_status')) {
      context.handle(
        _syncStatusMeta,
        syncStatus.isAcceptableOrUnknown(data['sync_status']!, _syncStatusMeta),
      );
    }
    if (data.containsKey('sync_error')) {
      context.handle(
        _syncErrorMeta,
        syncError.isAcceptableOrUnknown(data['sync_error']!, _syncErrorMeta),
      );
    }
    if (data.containsKey('observed_at')) {
      context.handle(
        _observedAtMeta,
        observedAt.isAcceptableOrUnknown(data['observed_at']!, _observedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_observedAtMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('synced_at')) {
      context.handle(
        _syncedAtMeta,
        syncedAt.isAcceptableOrUnknown(data['synced_at']!, _syncedAtMeta),
      );
    }
    if (data.containsKey('is_deleted')) {
      context.handle(
        _isDeletedMeta,
        isDeleted.isAcceptableOrUnknown(data['is_deleted']!, _isDeletedMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  IncidentReport map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return IncidentReport(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      reportCode: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}report_code'],
      )!,
      category: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}category'],
      )!,
      title: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}title'],
      )!,
      description: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}description'],
      )!,
      latitude: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}latitude'],
      ),
      longitude: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}longitude'],
      ),
      peopleAffected: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}people_affected'],
      )!,
      casualties: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}casualties'],
      )!,
      photoPath: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}photo_path'],
      ),
      photoPendingUpload: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}photo_pending_upload'],
      )!,
      syncStatus: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}sync_status'],
      )!,
      syncError: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}sync_error'],
      ),
      observedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}observed_at'],
      )!,
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}created_at'],
      )!,
      syncedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}synced_at'],
      ),
      isDeleted: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}is_deleted'],
      )!,
    );
  }

  @override
  $IncidentReportsTable createAlias(String alias) {
    return $IncidentReportsTable(attachedDatabase, alias);
  }
}

class IncidentReport extends DataClass implements Insertable<IncidentReport> {
  final String id;
  final String reportCode;
  final String category;
  final String title;
  final String description;
  final double? latitude;
  final double? longitude;
  final int peopleAffected;
  final int casualties;
  final String? photoPath;
  final bool photoPendingUpload;
  final String syncStatus;
  final String? syncError;
  final DateTime observedAt;
  final DateTime createdAt;
  final DateTime? syncedAt;
  final bool isDeleted;
  const IncidentReport({
    required this.id,
    required this.reportCode,
    required this.category,
    required this.title,
    required this.description,
    this.latitude,
    this.longitude,
    required this.peopleAffected,
    required this.casualties,
    this.photoPath,
    required this.photoPendingUpload,
    required this.syncStatus,
    this.syncError,
    required this.observedAt,
    required this.createdAt,
    this.syncedAt,
    required this.isDeleted,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['report_code'] = Variable<String>(reportCode);
    map['category'] = Variable<String>(category);
    map['title'] = Variable<String>(title);
    map['description'] = Variable<String>(description);
    if (!nullToAbsent || latitude != null) {
      map['latitude'] = Variable<double>(latitude);
    }
    if (!nullToAbsent || longitude != null) {
      map['longitude'] = Variable<double>(longitude);
    }
    map['people_affected'] = Variable<int>(peopleAffected);
    map['casualties'] = Variable<int>(casualties);
    if (!nullToAbsent || photoPath != null) {
      map['photo_path'] = Variable<String>(photoPath);
    }
    map['photo_pending_upload'] = Variable<bool>(photoPendingUpload);
    map['sync_status'] = Variable<String>(syncStatus);
    if (!nullToAbsent || syncError != null) {
      map['sync_error'] = Variable<String>(syncError);
    }
    map['observed_at'] = Variable<DateTime>(observedAt);
    map['created_at'] = Variable<DateTime>(createdAt);
    if (!nullToAbsent || syncedAt != null) {
      map['synced_at'] = Variable<DateTime>(syncedAt);
    }
    map['is_deleted'] = Variable<bool>(isDeleted);
    return map;
  }

  IncidentReportsCompanion toCompanion(bool nullToAbsent) {
    return IncidentReportsCompanion(
      id: Value(id),
      reportCode: Value(reportCode),
      category: Value(category),
      title: Value(title),
      description: Value(description),
      latitude: latitude == null && nullToAbsent
          ? const Value.absent()
          : Value(latitude),
      longitude: longitude == null && nullToAbsent
          ? const Value.absent()
          : Value(longitude),
      peopleAffected: Value(peopleAffected),
      casualties: Value(casualties),
      photoPath: photoPath == null && nullToAbsent
          ? const Value.absent()
          : Value(photoPath),
      photoPendingUpload: Value(photoPendingUpload),
      syncStatus: Value(syncStatus),
      syncError: syncError == null && nullToAbsent
          ? const Value.absent()
          : Value(syncError),
      observedAt: Value(observedAt),
      createdAt: Value(createdAt),
      syncedAt: syncedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(syncedAt),
      isDeleted: Value(isDeleted),
    );
  }

  factory IncidentReport.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return IncidentReport(
      id: serializer.fromJson<String>(json['id']),
      reportCode: serializer.fromJson<String>(json['reportCode']),
      category: serializer.fromJson<String>(json['category']),
      title: serializer.fromJson<String>(json['title']),
      description: serializer.fromJson<String>(json['description']),
      latitude: serializer.fromJson<double?>(json['latitude']),
      longitude: serializer.fromJson<double?>(json['longitude']),
      peopleAffected: serializer.fromJson<int>(json['peopleAffected']),
      casualties: serializer.fromJson<int>(json['casualties']),
      photoPath: serializer.fromJson<String?>(json['photoPath']),
      photoPendingUpload: serializer.fromJson<bool>(json['photoPendingUpload']),
      syncStatus: serializer.fromJson<String>(json['syncStatus']),
      syncError: serializer.fromJson<String?>(json['syncError']),
      observedAt: serializer.fromJson<DateTime>(json['observedAt']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      syncedAt: serializer.fromJson<DateTime?>(json['syncedAt']),
      isDeleted: serializer.fromJson<bool>(json['isDeleted']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'reportCode': serializer.toJson<String>(reportCode),
      'category': serializer.toJson<String>(category),
      'title': serializer.toJson<String>(title),
      'description': serializer.toJson<String>(description),
      'latitude': serializer.toJson<double?>(latitude),
      'longitude': serializer.toJson<double?>(longitude),
      'peopleAffected': serializer.toJson<int>(peopleAffected),
      'casualties': serializer.toJson<int>(casualties),
      'photoPath': serializer.toJson<String?>(photoPath),
      'photoPendingUpload': serializer.toJson<bool>(photoPendingUpload),
      'syncStatus': serializer.toJson<String>(syncStatus),
      'syncError': serializer.toJson<String?>(syncError),
      'observedAt': serializer.toJson<DateTime>(observedAt),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'syncedAt': serializer.toJson<DateTime?>(syncedAt),
      'isDeleted': serializer.toJson<bool>(isDeleted),
    };
  }

  IncidentReport copyWith({
    String? id,
    String? reportCode,
    String? category,
    String? title,
    String? description,
    Value<double?> latitude = const Value.absent(),
    Value<double?> longitude = const Value.absent(),
    int? peopleAffected,
    int? casualties,
    Value<String?> photoPath = const Value.absent(),
    bool? photoPendingUpload,
    String? syncStatus,
    Value<String?> syncError = const Value.absent(),
    DateTime? observedAt,
    DateTime? createdAt,
    Value<DateTime?> syncedAt = const Value.absent(),
    bool? isDeleted,
  }) => IncidentReport(
    id: id ?? this.id,
    reportCode: reportCode ?? this.reportCode,
    category: category ?? this.category,
    title: title ?? this.title,
    description: description ?? this.description,
    latitude: latitude.present ? latitude.value : this.latitude,
    longitude: longitude.present ? longitude.value : this.longitude,
    peopleAffected: peopleAffected ?? this.peopleAffected,
    casualties: casualties ?? this.casualties,
    photoPath: photoPath.present ? photoPath.value : this.photoPath,
    photoPendingUpload: photoPendingUpload ?? this.photoPendingUpload,
    syncStatus: syncStatus ?? this.syncStatus,
    syncError: syncError.present ? syncError.value : this.syncError,
    observedAt: observedAt ?? this.observedAt,
    createdAt: createdAt ?? this.createdAt,
    syncedAt: syncedAt.present ? syncedAt.value : this.syncedAt,
    isDeleted: isDeleted ?? this.isDeleted,
  );
  IncidentReport copyWithCompanion(IncidentReportsCompanion data) {
    return IncidentReport(
      id: data.id.present ? data.id.value : this.id,
      reportCode: data.reportCode.present
          ? data.reportCode.value
          : this.reportCode,
      category: data.category.present ? data.category.value : this.category,
      title: data.title.present ? data.title.value : this.title,
      description: data.description.present
          ? data.description.value
          : this.description,
      latitude: data.latitude.present ? data.latitude.value : this.latitude,
      longitude: data.longitude.present ? data.longitude.value : this.longitude,
      peopleAffected: data.peopleAffected.present
          ? data.peopleAffected.value
          : this.peopleAffected,
      casualties: data.casualties.present
          ? data.casualties.value
          : this.casualties,
      photoPath: data.photoPath.present ? data.photoPath.value : this.photoPath,
      photoPendingUpload: data.photoPendingUpload.present
          ? data.photoPendingUpload.value
          : this.photoPendingUpload,
      syncStatus: data.syncStatus.present
          ? data.syncStatus.value
          : this.syncStatus,
      syncError: data.syncError.present ? data.syncError.value : this.syncError,
      observedAt: data.observedAt.present
          ? data.observedAt.value
          : this.observedAt,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      syncedAt: data.syncedAt.present ? data.syncedAt.value : this.syncedAt,
      isDeleted: data.isDeleted.present ? data.isDeleted.value : this.isDeleted,
    );
  }

  @override
  String toString() {
    return (StringBuffer('IncidentReport(')
          ..write('id: $id, ')
          ..write('reportCode: $reportCode, ')
          ..write('category: $category, ')
          ..write('title: $title, ')
          ..write('description: $description, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('peopleAffected: $peopleAffected, ')
          ..write('casualties: $casualties, ')
          ..write('photoPath: $photoPath, ')
          ..write('photoPendingUpload: $photoPendingUpload, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('syncError: $syncError, ')
          ..write('observedAt: $observedAt, ')
          ..write('createdAt: $createdAt, ')
          ..write('syncedAt: $syncedAt, ')
          ..write('isDeleted: $isDeleted')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    reportCode,
    category,
    title,
    description,
    latitude,
    longitude,
    peopleAffected,
    casualties,
    photoPath,
    photoPendingUpload,
    syncStatus,
    syncError,
    observedAt,
    createdAt,
    syncedAt,
    isDeleted,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is IncidentReport &&
          other.id == this.id &&
          other.reportCode == this.reportCode &&
          other.category == this.category &&
          other.title == this.title &&
          other.description == this.description &&
          other.latitude == this.latitude &&
          other.longitude == this.longitude &&
          other.peopleAffected == this.peopleAffected &&
          other.casualties == this.casualties &&
          other.photoPath == this.photoPath &&
          other.photoPendingUpload == this.photoPendingUpload &&
          other.syncStatus == this.syncStatus &&
          other.syncError == this.syncError &&
          other.observedAt == this.observedAt &&
          other.createdAt == this.createdAt &&
          other.syncedAt == this.syncedAt &&
          other.isDeleted == this.isDeleted);
}

class IncidentReportsCompanion extends UpdateCompanion<IncidentReport> {
  final Value<String> id;
  final Value<String> reportCode;
  final Value<String> category;
  final Value<String> title;
  final Value<String> description;
  final Value<double?> latitude;
  final Value<double?> longitude;
  final Value<int> peopleAffected;
  final Value<int> casualties;
  final Value<String?> photoPath;
  final Value<bool> photoPendingUpload;
  final Value<String> syncStatus;
  final Value<String?> syncError;
  final Value<DateTime> observedAt;
  final Value<DateTime> createdAt;
  final Value<DateTime?> syncedAt;
  final Value<bool> isDeleted;
  final Value<int> rowid;
  const IncidentReportsCompanion({
    this.id = const Value.absent(),
    this.reportCode = const Value.absent(),
    this.category = const Value.absent(),
    this.title = const Value.absent(),
    this.description = const Value.absent(),
    this.latitude = const Value.absent(),
    this.longitude = const Value.absent(),
    this.peopleAffected = const Value.absent(),
    this.casualties = const Value.absent(),
    this.photoPath = const Value.absent(),
    this.photoPendingUpload = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.syncError = const Value.absent(),
    this.observedAt = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.syncedAt = const Value.absent(),
    this.isDeleted = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  IncidentReportsCompanion.insert({
    required String id,
    required String reportCode,
    required String category,
    required String title,
    required String description,
    this.latitude = const Value.absent(),
    this.longitude = const Value.absent(),
    this.peopleAffected = const Value.absent(),
    this.casualties = const Value.absent(),
    this.photoPath = const Value.absent(),
    this.photoPendingUpload = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.syncError = const Value.absent(),
    required DateTime observedAt,
    required DateTime createdAt,
    this.syncedAt = const Value.absent(),
    this.isDeleted = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       reportCode = Value(reportCode),
       category = Value(category),
       title = Value(title),
       description = Value(description),
       observedAt = Value(observedAt),
       createdAt = Value(createdAt);
  static Insertable<IncidentReport> custom({
    Expression<String>? id,
    Expression<String>? reportCode,
    Expression<String>? category,
    Expression<String>? title,
    Expression<String>? description,
    Expression<double>? latitude,
    Expression<double>? longitude,
    Expression<int>? peopleAffected,
    Expression<int>? casualties,
    Expression<String>? photoPath,
    Expression<bool>? photoPendingUpload,
    Expression<String>? syncStatus,
    Expression<String>? syncError,
    Expression<DateTime>? observedAt,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? syncedAt,
    Expression<bool>? isDeleted,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (reportCode != null) 'report_code': reportCode,
      if (category != null) 'category': category,
      if (title != null) 'title': title,
      if (description != null) 'description': description,
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
      if (peopleAffected != null) 'people_affected': peopleAffected,
      if (casualties != null) 'casualties': casualties,
      if (photoPath != null) 'photo_path': photoPath,
      if (photoPendingUpload != null)
        'photo_pending_upload': photoPendingUpload,
      if (syncStatus != null) 'sync_status': syncStatus,
      if (syncError != null) 'sync_error': syncError,
      if (observedAt != null) 'observed_at': observedAt,
      if (createdAt != null) 'created_at': createdAt,
      if (syncedAt != null) 'synced_at': syncedAt,
      if (isDeleted != null) 'is_deleted': isDeleted,
      if (rowid != null) 'rowid': rowid,
    });
  }

  IncidentReportsCompanion copyWith({
    Value<String>? id,
    Value<String>? reportCode,
    Value<String>? category,
    Value<String>? title,
    Value<String>? description,
    Value<double?>? latitude,
    Value<double?>? longitude,
    Value<int>? peopleAffected,
    Value<int>? casualties,
    Value<String?>? photoPath,
    Value<bool>? photoPendingUpload,
    Value<String>? syncStatus,
    Value<String?>? syncError,
    Value<DateTime>? observedAt,
    Value<DateTime>? createdAt,
    Value<DateTime?>? syncedAt,
    Value<bool>? isDeleted,
    Value<int>? rowid,
  }) {
    return IncidentReportsCompanion(
      id: id ?? this.id,
      reportCode: reportCode ?? this.reportCode,
      category: category ?? this.category,
      title: title ?? this.title,
      description: description ?? this.description,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      peopleAffected: peopleAffected ?? this.peopleAffected,
      casualties: casualties ?? this.casualties,
      photoPath: photoPath ?? this.photoPath,
      photoPendingUpload: photoPendingUpload ?? this.photoPendingUpload,
      syncStatus: syncStatus ?? this.syncStatus,
      syncError: syncError ?? this.syncError,
      observedAt: observedAt ?? this.observedAt,
      createdAt: createdAt ?? this.createdAt,
      syncedAt: syncedAt ?? this.syncedAt,
      isDeleted: isDeleted ?? this.isDeleted,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (reportCode.present) {
      map['report_code'] = Variable<String>(reportCode.value);
    }
    if (category.present) {
      map['category'] = Variable<String>(category.value);
    }
    if (title.present) {
      map['title'] = Variable<String>(title.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (latitude.present) {
      map['latitude'] = Variable<double>(latitude.value);
    }
    if (longitude.present) {
      map['longitude'] = Variable<double>(longitude.value);
    }
    if (peopleAffected.present) {
      map['people_affected'] = Variable<int>(peopleAffected.value);
    }
    if (casualties.present) {
      map['casualties'] = Variable<int>(casualties.value);
    }
    if (photoPath.present) {
      map['photo_path'] = Variable<String>(photoPath.value);
    }
    if (photoPendingUpload.present) {
      map['photo_pending_upload'] = Variable<bool>(photoPendingUpload.value);
    }
    if (syncStatus.present) {
      map['sync_status'] = Variable<String>(syncStatus.value);
    }
    if (syncError.present) {
      map['sync_error'] = Variable<String>(syncError.value);
    }
    if (observedAt.present) {
      map['observed_at'] = Variable<DateTime>(observedAt.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (syncedAt.present) {
      map['synced_at'] = Variable<DateTime>(syncedAt.value);
    }
    if (isDeleted.present) {
      map['is_deleted'] = Variable<bool>(isDeleted.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('IncidentReportsCompanion(')
          ..write('id: $id, ')
          ..write('reportCode: $reportCode, ')
          ..write('category: $category, ')
          ..write('title: $title, ')
          ..write('description: $description, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('peopleAffected: $peopleAffected, ')
          ..write('casualties: $casualties, ')
          ..write('photoPath: $photoPath, ')
          ..write('photoPendingUpload: $photoPendingUpload, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('syncError: $syncError, ')
          ..write('observedAt: $observedAt, ')
          ..write('createdAt: $createdAt, ')
          ..write('syncedAt: $syncedAt, ')
          ..write('isDeleted: $isDeleted, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $EvidenceRecordsTable extends EvidenceRecords
    with TableInfo<$EvidenceRecordsTable, EvidenceRecord> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $EvidenceRecordsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _messageIdMeta = const VerificationMeta(
    'messageId',
  );
  @override
  late final GeneratedColumn<String> messageId = GeneratedColumn<String>(
    'message_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _incidentTypeMeta = const VerificationMeta(
    'incidentType',
  );
  @override
  late final GeneratedColumn<String> incidentType = GeneratedColumn<String>(
    'incident_type',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _descriptionMeta = const VerificationMeta(
    'description',
  );
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
    'description',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _photoPathMeta = const VerificationMeta(
    'photoPath',
  );
  @override
  late final GeneratedColumn<String> photoPath = GeneratedColumn<String>(
    'photo_path',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _latitudeMeta = const VerificationMeta(
    'latitude',
  );
  @override
  late final GeneratedColumn<double> latitude = GeneratedColumn<double>(
    'latitude',
    aliasedName,
    true,
    type: DriftSqlType.double,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _longitudeMeta = const VerificationMeta(
    'longitude',
  );
  @override
  late final GeneratedColumn<double> longitude = GeneratedColumn<double>(
    'longitude',
    aliasedName,
    true,
    type: DriftSqlType.double,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _sourceTierMeta = const VerificationMeta(
    'sourceTier',
  );
  @override
  late final GeneratedColumn<String> sourceTier = GeneratedColumn<String>(
    'source_tier',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _confidenceMeta = const VerificationMeta(
    'confidence',
  );
  @override
  late final GeneratedColumn<double> confidence = GeneratedColumn<double>(
    'confidence',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: false,
    defaultValue: const Constant(0.0),
  );
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
    'status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('LOCAL'),
  );
  static const VerificationMeta _observedAtMeta = const VerificationMeta(
    'observedAt',
  );
  @override
  late final GeneratedColumn<DateTime> observedAt = GeneratedColumn<DateTime>(
    'observed_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _uploadedAtMeta = const VerificationMeta(
    'uploadedAt',
  );
  @override
  late final GeneratedColumn<DateTime> uploadedAt = GeneratedColumn<DateTime>(
    'uploaded_at',
    aliasedName,
    true,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    messageId,
    incidentType,
    description,
    photoPath,
    latitude,
    longitude,
    sourceTier,
    confidence,
    status,
    observedAt,
    uploadedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'evidence_records';
  @override
  VerificationContext validateIntegrity(
    Insertable<EvidenceRecord> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('message_id')) {
      context.handle(
        _messageIdMeta,
        messageId.isAcceptableOrUnknown(data['message_id']!, _messageIdMeta),
      );
    } else if (isInserting) {
      context.missing(_messageIdMeta);
    }
    if (data.containsKey('incident_type')) {
      context.handle(
        _incidentTypeMeta,
        incidentType.isAcceptableOrUnknown(
          data['incident_type']!,
          _incidentTypeMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_incidentTypeMeta);
    }
    if (data.containsKey('description')) {
      context.handle(
        _descriptionMeta,
        description.isAcceptableOrUnknown(
          data['description']!,
          _descriptionMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_descriptionMeta);
    }
    if (data.containsKey('photo_path')) {
      context.handle(
        _photoPathMeta,
        photoPath.isAcceptableOrUnknown(data['photo_path']!, _photoPathMeta),
      );
    }
    if (data.containsKey('latitude')) {
      context.handle(
        _latitudeMeta,
        latitude.isAcceptableOrUnknown(data['latitude']!, _latitudeMeta),
      );
    }
    if (data.containsKey('longitude')) {
      context.handle(
        _longitudeMeta,
        longitude.isAcceptableOrUnknown(data['longitude']!, _longitudeMeta),
      );
    }
    if (data.containsKey('source_tier')) {
      context.handle(
        _sourceTierMeta,
        sourceTier.isAcceptableOrUnknown(data['source_tier']!, _sourceTierMeta),
      );
    } else if (isInserting) {
      context.missing(_sourceTierMeta);
    }
    if (data.containsKey('confidence')) {
      context.handle(
        _confidenceMeta,
        confidence.isAcceptableOrUnknown(data['confidence']!, _confidenceMeta),
      );
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    }
    if (data.containsKey('observed_at')) {
      context.handle(
        _observedAtMeta,
        observedAt.isAcceptableOrUnknown(data['observed_at']!, _observedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_observedAtMeta);
    }
    if (data.containsKey('uploaded_at')) {
      context.handle(
        _uploadedAtMeta,
        uploadedAt.isAcceptableOrUnknown(data['uploaded_at']!, _uploadedAtMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  EvidenceRecord map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return EvidenceRecord(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      messageId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}message_id'],
      )!,
      incidentType: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}incident_type'],
      )!,
      description: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}description'],
      )!,
      photoPath: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}photo_path'],
      ),
      latitude: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}latitude'],
      ),
      longitude: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}longitude'],
      ),
      sourceTier: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}source_tier'],
      )!,
      confidence: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}confidence'],
      )!,
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
      observedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}observed_at'],
      )!,
      uploadedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}uploaded_at'],
      ),
    );
  }

  @override
  $EvidenceRecordsTable createAlias(String alias) {
    return $EvidenceRecordsTable(attachedDatabase, alias);
  }
}

class EvidenceRecord extends DataClass implements Insertable<EvidenceRecord> {
  final String id;
  final String messageId;
  final String incidentType;
  final String description;
  final String? photoPath;
  final double? latitude;
  final double? longitude;
  final String sourceTier;
  final double confidence;
  final String status;
  final DateTime observedAt;
  final DateTime? uploadedAt;
  const EvidenceRecord({
    required this.id,
    required this.messageId,
    required this.incidentType,
    required this.description,
    this.photoPath,
    this.latitude,
    this.longitude,
    required this.sourceTier,
    required this.confidence,
    required this.status,
    required this.observedAt,
    this.uploadedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['message_id'] = Variable<String>(messageId);
    map['incident_type'] = Variable<String>(incidentType);
    map['description'] = Variable<String>(description);
    if (!nullToAbsent || photoPath != null) {
      map['photo_path'] = Variable<String>(photoPath);
    }
    if (!nullToAbsent || latitude != null) {
      map['latitude'] = Variable<double>(latitude);
    }
    if (!nullToAbsent || longitude != null) {
      map['longitude'] = Variable<double>(longitude);
    }
    map['source_tier'] = Variable<String>(sourceTier);
    map['confidence'] = Variable<double>(confidence);
    map['status'] = Variable<String>(status);
    map['observed_at'] = Variable<DateTime>(observedAt);
    if (!nullToAbsent || uploadedAt != null) {
      map['uploaded_at'] = Variable<DateTime>(uploadedAt);
    }
    return map;
  }

  EvidenceRecordsCompanion toCompanion(bool nullToAbsent) {
    return EvidenceRecordsCompanion(
      id: Value(id),
      messageId: Value(messageId),
      incidentType: Value(incidentType),
      description: Value(description),
      photoPath: photoPath == null && nullToAbsent
          ? const Value.absent()
          : Value(photoPath),
      latitude: latitude == null && nullToAbsent
          ? const Value.absent()
          : Value(latitude),
      longitude: longitude == null && nullToAbsent
          ? const Value.absent()
          : Value(longitude),
      sourceTier: Value(sourceTier),
      confidence: Value(confidence),
      status: Value(status),
      observedAt: Value(observedAt),
      uploadedAt: uploadedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(uploadedAt),
    );
  }

  factory EvidenceRecord.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return EvidenceRecord(
      id: serializer.fromJson<String>(json['id']),
      messageId: serializer.fromJson<String>(json['messageId']),
      incidentType: serializer.fromJson<String>(json['incidentType']),
      description: serializer.fromJson<String>(json['description']),
      photoPath: serializer.fromJson<String?>(json['photoPath']),
      latitude: serializer.fromJson<double?>(json['latitude']),
      longitude: serializer.fromJson<double?>(json['longitude']),
      sourceTier: serializer.fromJson<String>(json['sourceTier']),
      confidence: serializer.fromJson<double>(json['confidence']),
      status: serializer.fromJson<String>(json['status']),
      observedAt: serializer.fromJson<DateTime>(json['observedAt']),
      uploadedAt: serializer.fromJson<DateTime?>(json['uploadedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'messageId': serializer.toJson<String>(messageId),
      'incidentType': serializer.toJson<String>(incidentType),
      'description': serializer.toJson<String>(description),
      'photoPath': serializer.toJson<String?>(photoPath),
      'latitude': serializer.toJson<double?>(latitude),
      'longitude': serializer.toJson<double?>(longitude),
      'sourceTier': serializer.toJson<String>(sourceTier),
      'confidence': serializer.toJson<double>(confidence),
      'status': serializer.toJson<String>(status),
      'observedAt': serializer.toJson<DateTime>(observedAt),
      'uploadedAt': serializer.toJson<DateTime?>(uploadedAt),
    };
  }

  EvidenceRecord copyWith({
    String? id,
    String? messageId,
    String? incidentType,
    String? description,
    Value<String?> photoPath = const Value.absent(),
    Value<double?> latitude = const Value.absent(),
    Value<double?> longitude = const Value.absent(),
    String? sourceTier,
    double? confidence,
    String? status,
    DateTime? observedAt,
    Value<DateTime?> uploadedAt = const Value.absent(),
  }) => EvidenceRecord(
    id: id ?? this.id,
    messageId: messageId ?? this.messageId,
    incidentType: incidentType ?? this.incidentType,
    description: description ?? this.description,
    photoPath: photoPath.present ? photoPath.value : this.photoPath,
    latitude: latitude.present ? latitude.value : this.latitude,
    longitude: longitude.present ? longitude.value : this.longitude,
    sourceTier: sourceTier ?? this.sourceTier,
    confidence: confidence ?? this.confidence,
    status: status ?? this.status,
    observedAt: observedAt ?? this.observedAt,
    uploadedAt: uploadedAt.present ? uploadedAt.value : this.uploadedAt,
  );
  EvidenceRecord copyWithCompanion(EvidenceRecordsCompanion data) {
    return EvidenceRecord(
      id: data.id.present ? data.id.value : this.id,
      messageId: data.messageId.present ? data.messageId.value : this.messageId,
      incidentType: data.incidentType.present
          ? data.incidentType.value
          : this.incidentType,
      description: data.description.present
          ? data.description.value
          : this.description,
      photoPath: data.photoPath.present ? data.photoPath.value : this.photoPath,
      latitude: data.latitude.present ? data.latitude.value : this.latitude,
      longitude: data.longitude.present ? data.longitude.value : this.longitude,
      sourceTier: data.sourceTier.present
          ? data.sourceTier.value
          : this.sourceTier,
      confidence: data.confidence.present
          ? data.confidence.value
          : this.confidence,
      status: data.status.present ? data.status.value : this.status,
      observedAt: data.observedAt.present
          ? data.observedAt.value
          : this.observedAt,
      uploadedAt: data.uploadedAt.present
          ? data.uploadedAt.value
          : this.uploadedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('EvidenceRecord(')
          ..write('id: $id, ')
          ..write('messageId: $messageId, ')
          ..write('incidentType: $incidentType, ')
          ..write('description: $description, ')
          ..write('photoPath: $photoPath, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('sourceTier: $sourceTier, ')
          ..write('confidence: $confidence, ')
          ..write('status: $status, ')
          ..write('observedAt: $observedAt, ')
          ..write('uploadedAt: $uploadedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    messageId,
    incidentType,
    description,
    photoPath,
    latitude,
    longitude,
    sourceTier,
    confidence,
    status,
    observedAt,
    uploadedAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is EvidenceRecord &&
          other.id == this.id &&
          other.messageId == this.messageId &&
          other.incidentType == this.incidentType &&
          other.description == this.description &&
          other.photoPath == this.photoPath &&
          other.latitude == this.latitude &&
          other.longitude == this.longitude &&
          other.sourceTier == this.sourceTier &&
          other.confidence == this.confidence &&
          other.status == this.status &&
          other.observedAt == this.observedAt &&
          other.uploadedAt == this.uploadedAt);
}

class EvidenceRecordsCompanion extends UpdateCompanion<EvidenceRecord> {
  final Value<String> id;
  final Value<String> messageId;
  final Value<String> incidentType;
  final Value<String> description;
  final Value<String?> photoPath;
  final Value<double?> latitude;
  final Value<double?> longitude;
  final Value<String> sourceTier;
  final Value<double> confidence;
  final Value<String> status;
  final Value<DateTime> observedAt;
  final Value<DateTime?> uploadedAt;
  final Value<int> rowid;
  const EvidenceRecordsCompanion({
    this.id = const Value.absent(),
    this.messageId = const Value.absent(),
    this.incidentType = const Value.absent(),
    this.description = const Value.absent(),
    this.photoPath = const Value.absent(),
    this.latitude = const Value.absent(),
    this.longitude = const Value.absent(),
    this.sourceTier = const Value.absent(),
    this.confidence = const Value.absent(),
    this.status = const Value.absent(),
    this.observedAt = const Value.absent(),
    this.uploadedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  EvidenceRecordsCompanion.insert({
    required String id,
    required String messageId,
    required String incidentType,
    required String description,
    this.photoPath = const Value.absent(),
    this.latitude = const Value.absent(),
    this.longitude = const Value.absent(),
    required String sourceTier,
    this.confidence = const Value.absent(),
    this.status = const Value.absent(),
    required DateTime observedAt,
    this.uploadedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       messageId = Value(messageId),
       incidentType = Value(incidentType),
       description = Value(description),
       sourceTier = Value(sourceTier),
       observedAt = Value(observedAt);
  static Insertable<EvidenceRecord> custom({
    Expression<String>? id,
    Expression<String>? messageId,
    Expression<String>? incidentType,
    Expression<String>? description,
    Expression<String>? photoPath,
    Expression<double>? latitude,
    Expression<double>? longitude,
    Expression<String>? sourceTier,
    Expression<double>? confidence,
    Expression<String>? status,
    Expression<DateTime>? observedAt,
    Expression<DateTime>? uploadedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (messageId != null) 'message_id': messageId,
      if (incidentType != null) 'incident_type': incidentType,
      if (description != null) 'description': description,
      if (photoPath != null) 'photo_path': photoPath,
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
      if (sourceTier != null) 'source_tier': sourceTier,
      if (confidence != null) 'confidence': confidence,
      if (status != null) 'status': status,
      if (observedAt != null) 'observed_at': observedAt,
      if (uploadedAt != null) 'uploaded_at': uploadedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  EvidenceRecordsCompanion copyWith({
    Value<String>? id,
    Value<String>? messageId,
    Value<String>? incidentType,
    Value<String>? description,
    Value<String?>? photoPath,
    Value<double?>? latitude,
    Value<double?>? longitude,
    Value<String>? sourceTier,
    Value<double>? confidence,
    Value<String>? status,
    Value<DateTime>? observedAt,
    Value<DateTime?>? uploadedAt,
    Value<int>? rowid,
  }) {
    return EvidenceRecordsCompanion(
      id: id ?? this.id,
      messageId: messageId ?? this.messageId,
      incidentType: incidentType ?? this.incidentType,
      description: description ?? this.description,
      photoPath: photoPath ?? this.photoPath,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      sourceTier: sourceTier ?? this.sourceTier,
      confidence: confidence ?? this.confidence,
      status: status ?? this.status,
      observedAt: observedAt ?? this.observedAt,
      uploadedAt: uploadedAt ?? this.uploadedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (messageId.present) {
      map['message_id'] = Variable<String>(messageId.value);
    }
    if (incidentType.present) {
      map['incident_type'] = Variable<String>(incidentType.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (photoPath.present) {
      map['photo_path'] = Variable<String>(photoPath.value);
    }
    if (latitude.present) {
      map['latitude'] = Variable<double>(latitude.value);
    }
    if (longitude.present) {
      map['longitude'] = Variable<double>(longitude.value);
    }
    if (sourceTier.present) {
      map['source_tier'] = Variable<String>(sourceTier.value);
    }
    if (confidence.present) {
      map['confidence'] = Variable<double>(confidence.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (observedAt.present) {
      map['observed_at'] = Variable<DateTime>(observedAt.value);
    }
    if (uploadedAt.present) {
      map['uploaded_at'] = Variable<DateTime>(uploadedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('EvidenceRecordsCompanion(')
          ..write('id: $id, ')
          ..write('messageId: $messageId, ')
          ..write('incidentType: $incidentType, ')
          ..write('description: $description, ')
          ..write('photoPath: $photoPath, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('sourceTier: $sourceTier, ')
          ..write('confidence: $confidence, ')
          ..write('status: $status, ')
          ..write('observedAt: $observedAt, ')
          ..write('uploadedAt: $uploadedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LocalAssignmentsTable extends LocalAssignments
    with TableInfo<$LocalAssignmentsTable, LocalAssignment> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalAssignmentsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _planIdMeta = const VerificationMeta('planId');
  @override
  late final GeneratedColumn<String> planId = GeneratedColumn<String>(
    'plan_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _versionNumberMeta = const VerificationMeta(
    'versionNumber',
  );
  @override
  late final GeneratedColumn<int> versionNumber = GeneratedColumn<int>(
    'version_number',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _depotIdMeta = const VerificationMeta(
    'depotId',
  );
  @override
  late final GeneratedColumn<String> depotId = GeneratedColumn<String>(
    'depot_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _zoneIdMeta = const VerificationMeta('zoneId');
  @override
  late final GeneratedColumn<String> zoneId = GeneratedColumn<String>(
    'zone_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _zoneNameMeta = const VerificationMeta(
    'zoneName',
  );
  @override
  late final GeneratedColumn<String> zoneName = GeneratedColumn<String>(
    'zone_name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _resourceTypeMeta = const VerificationMeta(
    'resourceType',
  );
  @override
  late final GeneratedColumn<String> resourceType = GeneratedColumn<String>(
    'resource_type',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _quantityMeta = const VerificationMeta(
    'quantity',
  );
  @override
  late final GeneratedColumn<int> quantity = GeneratedColumn<int>(
    'quantity',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _priorityMeta = const VerificationMeta(
    'priority',
  );
  @override
  late final GeneratedColumn<String> priority = GeneratedColumn<String>(
    'priority',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _priorityScoreMeta = const VerificationMeta(
    'priorityScore',
  );
  @override
  late final GeneratedColumn<double> priorityScore = GeneratedColumn<double>(
    'priority_score',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _travelTimeMinMeta = const VerificationMeta(
    'travelTimeMin',
  );
  @override
  late final GeneratedColumn<double> travelTimeMin = GeneratedColumn<double>(
    'travel_time_min',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _destinationMeta = const VerificationMeta(
    'destination',
  );
  @override
  late final GeneratedColumn<String> destination = GeneratedColumn<String>(
    'destination',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _latitudeMeta = const VerificationMeta(
    'latitude',
  );
  @override
  late final GeneratedColumn<double> latitude = GeneratedColumn<double>(
    'latitude',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _longitudeMeta = const VerificationMeta(
    'longitude',
  );
  @override
  late final GeneratedColumn<double> longitude = GeneratedColumn<double>(
    'longitude',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _routeNodesJsonMeta = const VerificationMeta(
    'routeNodesJson',
  );
  @override
  late final GeneratedColumn<String> routeNodesJson = GeneratedColumn<String>(
    'route_nodes_json',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
    'status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('SCHEDULED'),
  );
  static const VerificationMeta _acknowledgedByDeviceMeta =
      const VerificationMeta('acknowledgedByDevice');
  @override
  late final GeneratedColumn<String> acknowledgedByDevice =
      GeneratedColumn<String>(
        'acknowledged_by_device',
        aliasedName,
        true,
        type: DriftSqlType.string,
        requiredDuringInsert: false,
      );
  static const VerificationMeta _serverConfirmedMeta = const VerificationMeta(
    'serverConfirmed',
  );
  @override
  late final GeneratedColumn<bool> serverConfirmed = GeneratedColumn<bool>(
    'server_confirmed',
    aliasedName,
    false,
    type: DriftSqlType.bool,
    requiredDuringInsert: false,
    defaultConstraints: GeneratedColumn.constraintIsAlways(
      'CHECK ("server_confirmed" IN (0, 1))',
    ),
    defaultValue: const Constant(false),
  );
  static const VerificationMeta _lastUpdatedMeta = const VerificationMeta(
    'lastUpdated',
  );
  @override
  late final GeneratedColumn<DateTime> lastUpdated = GeneratedColumn<DateTime>(
    'last_updated',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    planId,
    versionNumber,
    depotId,
    zoneId,
    zoneName,
    resourceType,
    quantity,
    priority,
    priorityScore,
    travelTimeMin,
    destination,
    latitude,
    longitude,
    routeNodesJson,
    status,
    acknowledgedByDevice,
    serverConfirmed,
    lastUpdated,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_assignments';
  @override
  VerificationContext validateIntegrity(
    Insertable<LocalAssignment> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('plan_id')) {
      context.handle(
        _planIdMeta,
        planId.isAcceptableOrUnknown(data['plan_id']!, _planIdMeta),
      );
    } else if (isInserting) {
      context.missing(_planIdMeta);
    }
    if (data.containsKey('version_number')) {
      context.handle(
        _versionNumberMeta,
        versionNumber.isAcceptableOrUnknown(
          data['version_number']!,
          _versionNumberMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_versionNumberMeta);
    }
    if (data.containsKey('depot_id')) {
      context.handle(
        _depotIdMeta,
        depotId.isAcceptableOrUnknown(data['depot_id']!, _depotIdMeta),
      );
    } else if (isInserting) {
      context.missing(_depotIdMeta);
    }
    if (data.containsKey('zone_id')) {
      context.handle(
        _zoneIdMeta,
        zoneId.isAcceptableOrUnknown(data['zone_id']!, _zoneIdMeta),
      );
    } else if (isInserting) {
      context.missing(_zoneIdMeta);
    }
    if (data.containsKey('zone_name')) {
      context.handle(
        _zoneNameMeta,
        zoneName.isAcceptableOrUnknown(data['zone_name']!, _zoneNameMeta),
      );
    } else if (isInserting) {
      context.missing(_zoneNameMeta);
    }
    if (data.containsKey('resource_type')) {
      context.handle(
        _resourceTypeMeta,
        resourceType.isAcceptableOrUnknown(
          data['resource_type']!,
          _resourceTypeMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_resourceTypeMeta);
    }
    if (data.containsKey('quantity')) {
      context.handle(
        _quantityMeta,
        quantity.isAcceptableOrUnknown(data['quantity']!, _quantityMeta),
      );
    } else if (isInserting) {
      context.missing(_quantityMeta);
    }
    if (data.containsKey('priority')) {
      context.handle(
        _priorityMeta,
        priority.isAcceptableOrUnknown(data['priority']!, _priorityMeta),
      );
    } else if (isInserting) {
      context.missing(_priorityMeta);
    }
    if (data.containsKey('priority_score')) {
      context.handle(
        _priorityScoreMeta,
        priorityScore.isAcceptableOrUnknown(
          data['priority_score']!,
          _priorityScoreMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_priorityScoreMeta);
    }
    if (data.containsKey('travel_time_min')) {
      context.handle(
        _travelTimeMinMeta,
        travelTimeMin.isAcceptableOrUnknown(
          data['travel_time_min']!,
          _travelTimeMinMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_travelTimeMinMeta);
    }
    if (data.containsKey('destination')) {
      context.handle(
        _destinationMeta,
        destination.isAcceptableOrUnknown(
          data['destination']!,
          _destinationMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_destinationMeta);
    }
    if (data.containsKey('latitude')) {
      context.handle(
        _latitudeMeta,
        latitude.isAcceptableOrUnknown(data['latitude']!, _latitudeMeta),
      );
    } else if (isInserting) {
      context.missing(_latitudeMeta);
    }
    if (data.containsKey('longitude')) {
      context.handle(
        _longitudeMeta,
        longitude.isAcceptableOrUnknown(data['longitude']!, _longitudeMeta),
      );
    } else if (isInserting) {
      context.missing(_longitudeMeta);
    }
    if (data.containsKey('route_nodes_json')) {
      context.handle(
        _routeNodesJsonMeta,
        routeNodesJson.isAcceptableOrUnknown(
          data['route_nodes_json']!,
          _routeNodesJsonMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_routeNodesJsonMeta);
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    }
    if (data.containsKey('acknowledged_by_device')) {
      context.handle(
        _acknowledgedByDeviceMeta,
        acknowledgedByDevice.isAcceptableOrUnknown(
          data['acknowledged_by_device']!,
          _acknowledgedByDeviceMeta,
        ),
      );
    }
    if (data.containsKey('server_confirmed')) {
      context.handle(
        _serverConfirmedMeta,
        serverConfirmed.isAcceptableOrUnknown(
          data['server_confirmed']!,
          _serverConfirmedMeta,
        ),
      );
    }
    if (data.containsKey('last_updated')) {
      context.handle(
        _lastUpdatedMeta,
        lastUpdated.isAcceptableOrUnknown(
          data['last_updated']!,
          _lastUpdatedMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_lastUpdatedMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LocalAssignment map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LocalAssignment(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      planId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}plan_id'],
      )!,
      versionNumber: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}version_number'],
      )!,
      depotId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}depot_id'],
      )!,
      zoneId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}zone_id'],
      )!,
      zoneName: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}zone_name'],
      )!,
      resourceType: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}resource_type'],
      )!,
      quantity: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}quantity'],
      )!,
      priority: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}priority'],
      )!,
      priorityScore: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}priority_score'],
      )!,
      travelTimeMin: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}travel_time_min'],
      )!,
      destination: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}destination'],
      )!,
      latitude: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}latitude'],
      )!,
      longitude: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}longitude'],
      )!,
      routeNodesJson: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}route_nodes_json'],
      )!,
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
      acknowledgedByDevice: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}acknowledged_by_device'],
      ),
      serverConfirmed: attachedDatabase.typeMapping.read(
        DriftSqlType.bool,
        data['${effectivePrefix}server_confirmed'],
      )!,
      lastUpdated: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}last_updated'],
      )!,
    );
  }

  @override
  $LocalAssignmentsTable createAlias(String alias) {
    return $LocalAssignmentsTable(attachedDatabase, alias);
  }
}

class LocalAssignment extends DataClass implements Insertable<LocalAssignment> {
  final String id;
  final String planId;
  final int versionNumber;
  final String depotId;
  final String zoneId;
  final String zoneName;
  final String resourceType;
  final int quantity;
  final String priority;
  final double priorityScore;
  final double travelTimeMin;
  final String destination;
  final double latitude;
  final double longitude;
  final String routeNodesJson;
  final String status;
  final String? acknowledgedByDevice;
  final bool serverConfirmed;
  final DateTime lastUpdated;
  const LocalAssignment({
    required this.id,
    required this.planId,
    required this.versionNumber,
    required this.depotId,
    required this.zoneId,
    required this.zoneName,
    required this.resourceType,
    required this.quantity,
    required this.priority,
    required this.priorityScore,
    required this.travelTimeMin,
    required this.destination,
    required this.latitude,
    required this.longitude,
    required this.routeNodesJson,
    required this.status,
    this.acknowledgedByDevice,
    required this.serverConfirmed,
    required this.lastUpdated,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['plan_id'] = Variable<String>(planId);
    map['version_number'] = Variable<int>(versionNumber);
    map['depot_id'] = Variable<String>(depotId);
    map['zone_id'] = Variable<String>(zoneId);
    map['zone_name'] = Variable<String>(zoneName);
    map['resource_type'] = Variable<String>(resourceType);
    map['quantity'] = Variable<int>(quantity);
    map['priority'] = Variable<String>(priority);
    map['priority_score'] = Variable<double>(priorityScore);
    map['travel_time_min'] = Variable<double>(travelTimeMin);
    map['destination'] = Variable<String>(destination);
    map['latitude'] = Variable<double>(latitude);
    map['longitude'] = Variable<double>(longitude);
    map['route_nodes_json'] = Variable<String>(routeNodesJson);
    map['status'] = Variable<String>(status);
    if (!nullToAbsent || acknowledgedByDevice != null) {
      map['acknowledged_by_device'] = Variable<String>(acknowledgedByDevice);
    }
    map['server_confirmed'] = Variable<bool>(serverConfirmed);
    map['last_updated'] = Variable<DateTime>(lastUpdated);
    return map;
  }

  LocalAssignmentsCompanion toCompanion(bool nullToAbsent) {
    return LocalAssignmentsCompanion(
      id: Value(id),
      planId: Value(planId),
      versionNumber: Value(versionNumber),
      depotId: Value(depotId),
      zoneId: Value(zoneId),
      zoneName: Value(zoneName),
      resourceType: Value(resourceType),
      quantity: Value(quantity),
      priority: Value(priority),
      priorityScore: Value(priorityScore),
      travelTimeMin: Value(travelTimeMin),
      destination: Value(destination),
      latitude: Value(latitude),
      longitude: Value(longitude),
      routeNodesJson: Value(routeNodesJson),
      status: Value(status),
      acknowledgedByDevice: acknowledgedByDevice == null && nullToAbsent
          ? const Value.absent()
          : Value(acknowledgedByDevice),
      serverConfirmed: Value(serverConfirmed),
      lastUpdated: Value(lastUpdated),
    );
  }

  factory LocalAssignment.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LocalAssignment(
      id: serializer.fromJson<String>(json['id']),
      planId: serializer.fromJson<String>(json['planId']),
      versionNumber: serializer.fromJson<int>(json['versionNumber']),
      depotId: serializer.fromJson<String>(json['depotId']),
      zoneId: serializer.fromJson<String>(json['zoneId']),
      zoneName: serializer.fromJson<String>(json['zoneName']),
      resourceType: serializer.fromJson<String>(json['resourceType']),
      quantity: serializer.fromJson<int>(json['quantity']),
      priority: serializer.fromJson<String>(json['priority']),
      priorityScore: serializer.fromJson<double>(json['priorityScore']),
      travelTimeMin: serializer.fromJson<double>(json['travelTimeMin']),
      destination: serializer.fromJson<String>(json['destination']),
      latitude: serializer.fromJson<double>(json['latitude']),
      longitude: serializer.fromJson<double>(json['longitude']),
      routeNodesJson: serializer.fromJson<String>(json['routeNodesJson']),
      status: serializer.fromJson<String>(json['status']),
      acknowledgedByDevice: serializer.fromJson<String?>(
        json['acknowledgedByDevice'],
      ),
      serverConfirmed: serializer.fromJson<bool>(json['serverConfirmed']),
      lastUpdated: serializer.fromJson<DateTime>(json['lastUpdated']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'planId': serializer.toJson<String>(planId),
      'versionNumber': serializer.toJson<int>(versionNumber),
      'depotId': serializer.toJson<String>(depotId),
      'zoneId': serializer.toJson<String>(zoneId),
      'zoneName': serializer.toJson<String>(zoneName),
      'resourceType': serializer.toJson<String>(resourceType),
      'quantity': serializer.toJson<int>(quantity),
      'priority': serializer.toJson<String>(priority),
      'priorityScore': serializer.toJson<double>(priorityScore),
      'travelTimeMin': serializer.toJson<double>(travelTimeMin),
      'destination': serializer.toJson<String>(destination),
      'latitude': serializer.toJson<double>(latitude),
      'longitude': serializer.toJson<double>(longitude),
      'routeNodesJson': serializer.toJson<String>(routeNodesJson),
      'status': serializer.toJson<String>(status),
      'acknowledgedByDevice': serializer.toJson<String?>(acknowledgedByDevice),
      'serverConfirmed': serializer.toJson<bool>(serverConfirmed),
      'lastUpdated': serializer.toJson<DateTime>(lastUpdated),
    };
  }

  LocalAssignment copyWith({
    String? id,
    String? planId,
    int? versionNumber,
    String? depotId,
    String? zoneId,
    String? zoneName,
    String? resourceType,
    int? quantity,
    String? priority,
    double? priorityScore,
    double? travelTimeMin,
    String? destination,
    double? latitude,
    double? longitude,
    String? routeNodesJson,
    String? status,
    Value<String?> acknowledgedByDevice = const Value.absent(),
    bool? serverConfirmed,
    DateTime? lastUpdated,
  }) => LocalAssignment(
    id: id ?? this.id,
    planId: planId ?? this.planId,
    versionNumber: versionNumber ?? this.versionNumber,
    depotId: depotId ?? this.depotId,
    zoneId: zoneId ?? this.zoneId,
    zoneName: zoneName ?? this.zoneName,
    resourceType: resourceType ?? this.resourceType,
    quantity: quantity ?? this.quantity,
    priority: priority ?? this.priority,
    priorityScore: priorityScore ?? this.priorityScore,
    travelTimeMin: travelTimeMin ?? this.travelTimeMin,
    destination: destination ?? this.destination,
    latitude: latitude ?? this.latitude,
    longitude: longitude ?? this.longitude,
    routeNodesJson: routeNodesJson ?? this.routeNodesJson,
    status: status ?? this.status,
    acknowledgedByDevice: acknowledgedByDevice.present
        ? acknowledgedByDevice.value
        : this.acknowledgedByDevice,
    serverConfirmed: serverConfirmed ?? this.serverConfirmed,
    lastUpdated: lastUpdated ?? this.lastUpdated,
  );
  LocalAssignment copyWithCompanion(LocalAssignmentsCompanion data) {
    return LocalAssignment(
      id: data.id.present ? data.id.value : this.id,
      planId: data.planId.present ? data.planId.value : this.planId,
      versionNumber: data.versionNumber.present
          ? data.versionNumber.value
          : this.versionNumber,
      depotId: data.depotId.present ? data.depotId.value : this.depotId,
      zoneId: data.zoneId.present ? data.zoneId.value : this.zoneId,
      zoneName: data.zoneName.present ? data.zoneName.value : this.zoneName,
      resourceType: data.resourceType.present
          ? data.resourceType.value
          : this.resourceType,
      quantity: data.quantity.present ? data.quantity.value : this.quantity,
      priority: data.priority.present ? data.priority.value : this.priority,
      priorityScore: data.priorityScore.present
          ? data.priorityScore.value
          : this.priorityScore,
      travelTimeMin: data.travelTimeMin.present
          ? data.travelTimeMin.value
          : this.travelTimeMin,
      destination: data.destination.present
          ? data.destination.value
          : this.destination,
      latitude: data.latitude.present ? data.latitude.value : this.latitude,
      longitude: data.longitude.present ? data.longitude.value : this.longitude,
      routeNodesJson: data.routeNodesJson.present
          ? data.routeNodesJson.value
          : this.routeNodesJson,
      status: data.status.present ? data.status.value : this.status,
      acknowledgedByDevice: data.acknowledgedByDevice.present
          ? data.acknowledgedByDevice.value
          : this.acknowledgedByDevice,
      serverConfirmed: data.serverConfirmed.present
          ? data.serverConfirmed.value
          : this.serverConfirmed,
      lastUpdated: data.lastUpdated.present
          ? data.lastUpdated.value
          : this.lastUpdated,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LocalAssignment(')
          ..write('id: $id, ')
          ..write('planId: $planId, ')
          ..write('versionNumber: $versionNumber, ')
          ..write('depotId: $depotId, ')
          ..write('zoneId: $zoneId, ')
          ..write('zoneName: $zoneName, ')
          ..write('resourceType: $resourceType, ')
          ..write('quantity: $quantity, ')
          ..write('priority: $priority, ')
          ..write('priorityScore: $priorityScore, ')
          ..write('travelTimeMin: $travelTimeMin, ')
          ..write('destination: $destination, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('routeNodesJson: $routeNodesJson, ')
          ..write('status: $status, ')
          ..write('acknowledgedByDevice: $acknowledgedByDevice, ')
          ..write('serverConfirmed: $serverConfirmed, ')
          ..write('lastUpdated: $lastUpdated')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    planId,
    versionNumber,
    depotId,
    zoneId,
    zoneName,
    resourceType,
    quantity,
    priority,
    priorityScore,
    travelTimeMin,
    destination,
    latitude,
    longitude,
    routeNodesJson,
    status,
    acknowledgedByDevice,
    serverConfirmed,
    lastUpdated,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LocalAssignment &&
          other.id == this.id &&
          other.planId == this.planId &&
          other.versionNumber == this.versionNumber &&
          other.depotId == this.depotId &&
          other.zoneId == this.zoneId &&
          other.zoneName == this.zoneName &&
          other.resourceType == this.resourceType &&
          other.quantity == this.quantity &&
          other.priority == this.priority &&
          other.priorityScore == this.priorityScore &&
          other.travelTimeMin == this.travelTimeMin &&
          other.destination == this.destination &&
          other.latitude == this.latitude &&
          other.longitude == this.longitude &&
          other.routeNodesJson == this.routeNodesJson &&
          other.status == this.status &&
          other.acknowledgedByDevice == this.acknowledgedByDevice &&
          other.serverConfirmed == this.serverConfirmed &&
          other.lastUpdated == this.lastUpdated);
}

class LocalAssignmentsCompanion extends UpdateCompanion<LocalAssignment> {
  final Value<String> id;
  final Value<String> planId;
  final Value<int> versionNumber;
  final Value<String> depotId;
  final Value<String> zoneId;
  final Value<String> zoneName;
  final Value<String> resourceType;
  final Value<int> quantity;
  final Value<String> priority;
  final Value<double> priorityScore;
  final Value<double> travelTimeMin;
  final Value<String> destination;
  final Value<double> latitude;
  final Value<double> longitude;
  final Value<String> routeNodesJson;
  final Value<String> status;
  final Value<String?> acknowledgedByDevice;
  final Value<bool> serverConfirmed;
  final Value<DateTime> lastUpdated;
  final Value<int> rowid;
  const LocalAssignmentsCompanion({
    this.id = const Value.absent(),
    this.planId = const Value.absent(),
    this.versionNumber = const Value.absent(),
    this.depotId = const Value.absent(),
    this.zoneId = const Value.absent(),
    this.zoneName = const Value.absent(),
    this.resourceType = const Value.absent(),
    this.quantity = const Value.absent(),
    this.priority = const Value.absent(),
    this.priorityScore = const Value.absent(),
    this.travelTimeMin = const Value.absent(),
    this.destination = const Value.absent(),
    this.latitude = const Value.absent(),
    this.longitude = const Value.absent(),
    this.routeNodesJson = const Value.absent(),
    this.status = const Value.absent(),
    this.acknowledgedByDevice = const Value.absent(),
    this.serverConfirmed = const Value.absent(),
    this.lastUpdated = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LocalAssignmentsCompanion.insert({
    required String id,
    required String planId,
    required int versionNumber,
    required String depotId,
    required String zoneId,
    required String zoneName,
    required String resourceType,
    required int quantity,
    required String priority,
    required double priorityScore,
    required double travelTimeMin,
    required String destination,
    required double latitude,
    required double longitude,
    required String routeNodesJson,
    this.status = const Value.absent(),
    this.acknowledgedByDevice = const Value.absent(),
    this.serverConfirmed = const Value.absent(),
    required DateTime lastUpdated,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       planId = Value(planId),
       versionNumber = Value(versionNumber),
       depotId = Value(depotId),
       zoneId = Value(zoneId),
       zoneName = Value(zoneName),
       resourceType = Value(resourceType),
       quantity = Value(quantity),
       priority = Value(priority),
       priorityScore = Value(priorityScore),
       travelTimeMin = Value(travelTimeMin),
       destination = Value(destination),
       latitude = Value(latitude),
       longitude = Value(longitude),
       routeNodesJson = Value(routeNodesJson),
       lastUpdated = Value(lastUpdated);
  static Insertable<LocalAssignment> custom({
    Expression<String>? id,
    Expression<String>? planId,
    Expression<int>? versionNumber,
    Expression<String>? depotId,
    Expression<String>? zoneId,
    Expression<String>? zoneName,
    Expression<String>? resourceType,
    Expression<int>? quantity,
    Expression<String>? priority,
    Expression<double>? priorityScore,
    Expression<double>? travelTimeMin,
    Expression<String>? destination,
    Expression<double>? latitude,
    Expression<double>? longitude,
    Expression<String>? routeNodesJson,
    Expression<String>? status,
    Expression<String>? acknowledgedByDevice,
    Expression<bool>? serverConfirmed,
    Expression<DateTime>? lastUpdated,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (planId != null) 'plan_id': planId,
      if (versionNumber != null) 'version_number': versionNumber,
      if (depotId != null) 'depot_id': depotId,
      if (zoneId != null) 'zone_id': zoneId,
      if (zoneName != null) 'zone_name': zoneName,
      if (resourceType != null) 'resource_type': resourceType,
      if (quantity != null) 'quantity': quantity,
      if (priority != null) 'priority': priority,
      if (priorityScore != null) 'priority_score': priorityScore,
      if (travelTimeMin != null) 'travel_time_min': travelTimeMin,
      if (destination != null) 'destination': destination,
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
      if (routeNodesJson != null) 'route_nodes_json': routeNodesJson,
      if (status != null) 'status': status,
      if (acknowledgedByDevice != null)
        'acknowledged_by_device': acknowledgedByDevice,
      if (serverConfirmed != null) 'server_confirmed': serverConfirmed,
      if (lastUpdated != null) 'last_updated': lastUpdated,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalAssignmentsCompanion copyWith({
    Value<String>? id,
    Value<String>? planId,
    Value<int>? versionNumber,
    Value<String>? depotId,
    Value<String>? zoneId,
    Value<String>? zoneName,
    Value<String>? resourceType,
    Value<int>? quantity,
    Value<String>? priority,
    Value<double>? priorityScore,
    Value<double>? travelTimeMin,
    Value<String>? destination,
    Value<double>? latitude,
    Value<double>? longitude,
    Value<String>? routeNodesJson,
    Value<String>? status,
    Value<String?>? acknowledgedByDevice,
    Value<bool>? serverConfirmed,
    Value<DateTime>? lastUpdated,
    Value<int>? rowid,
  }) {
    return LocalAssignmentsCompanion(
      id: id ?? this.id,
      planId: planId ?? this.planId,
      versionNumber: versionNumber ?? this.versionNumber,
      depotId: depotId ?? this.depotId,
      zoneId: zoneId ?? this.zoneId,
      zoneName: zoneName ?? this.zoneName,
      resourceType: resourceType ?? this.resourceType,
      quantity: quantity ?? this.quantity,
      priority: priority ?? this.priority,
      priorityScore: priorityScore ?? this.priorityScore,
      travelTimeMin: travelTimeMin ?? this.travelTimeMin,
      destination: destination ?? this.destination,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      routeNodesJson: routeNodesJson ?? this.routeNodesJson,
      status: status ?? this.status,
      acknowledgedByDevice: acknowledgedByDevice ?? this.acknowledgedByDevice,
      serverConfirmed: serverConfirmed ?? this.serverConfirmed,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (planId.present) {
      map['plan_id'] = Variable<String>(planId.value);
    }
    if (versionNumber.present) {
      map['version_number'] = Variable<int>(versionNumber.value);
    }
    if (depotId.present) {
      map['depot_id'] = Variable<String>(depotId.value);
    }
    if (zoneId.present) {
      map['zone_id'] = Variable<String>(zoneId.value);
    }
    if (zoneName.present) {
      map['zone_name'] = Variable<String>(zoneName.value);
    }
    if (resourceType.present) {
      map['resource_type'] = Variable<String>(resourceType.value);
    }
    if (quantity.present) {
      map['quantity'] = Variable<int>(quantity.value);
    }
    if (priority.present) {
      map['priority'] = Variable<String>(priority.value);
    }
    if (priorityScore.present) {
      map['priority_score'] = Variable<double>(priorityScore.value);
    }
    if (travelTimeMin.present) {
      map['travel_time_min'] = Variable<double>(travelTimeMin.value);
    }
    if (destination.present) {
      map['destination'] = Variable<String>(destination.value);
    }
    if (latitude.present) {
      map['latitude'] = Variable<double>(latitude.value);
    }
    if (longitude.present) {
      map['longitude'] = Variable<double>(longitude.value);
    }
    if (routeNodesJson.present) {
      map['route_nodes_json'] = Variable<String>(routeNodesJson.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (acknowledgedByDevice.present) {
      map['acknowledged_by_device'] = Variable<String>(
        acknowledgedByDevice.value,
      );
    }
    if (serverConfirmed.present) {
      map['server_confirmed'] = Variable<bool>(serverConfirmed.value);
    }
    if (lastUpdated.present) {
      map['last_updated'] = Variable<DateTime>(lastUpdated.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalAssignmentsCompanion(')
          ..write('id: $id, ')
          ..write('planId: $planId, ')
          ..write('versionNumber: $versionNumber, ')
          ..write('depotId: $depotId, ')
          ..write('zoneId: $zoneId, ')
          ..write('zoneName: $zoneName, ')
          ..write('resourceType: $resourceType, ')
          ..write('quantity: $quantity, ')
          ..write('priority: $priority, ')
          ..write('priorityScore: $priorityScore, ')
          ..write('travelTimeMin: $travelTimeMin, ')
          ..write('destination: $destination, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('routeNodesJson: $routeNodesJson, ')
          ..write('status: $status, ')
          ..write('acknowledgedByDevice: $acknowledgedByDevice, ')
          ..write('serverConfirmed: $serverConfirmed, ')
          ..write('lastUpdated: $lastUpdated, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LocalRoadClosuresTable extends LocalRoadClosures
    with TableInfo<$LocalRoadClosuresTable, LocalRoadClosure> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalRoadClosuresTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _bridgeIdMeta = const VerificationMeta(
    'bridgeId',
  );
  @override
  late final GeneratedColumn<String> bridgeId = GeneratedColumn<String>(
    'bridge_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
    'status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('OPEN'),
  );
  static const VerificationMeta _closureReasonMeta = const VerificationMeta(
    'closureReason',
  );
  @override
  late final GeneratedColumn<String> closureReason = GeneratedColumn<String>(
    'closure_reason',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _latitudeMeta = const VerificationMeta(
    'latitude',
  );
  @override
  late final GeneratedColumn<double> latitude = GeneratedColumn<double>(
    'latitude',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _longitudeMeta = const VerificationMeta(
    'longitude',
  );
  @override
  late final GeneratedColumn<double> longitude = GeneratedColumn<double>(
    'longitude',
    aliasedName,
    false,
    type: DriftSqlType.double,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _lastUpdatedMeta = const VerificationMeta(
    'lastUpdated',
  );
  @override
  late final GeneratedColumn<DateTime> lastUpdated = GeneratedColumn<DateTime>(
    'last_updated',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    bridgeId,
    name,
    status,
    closureReason,
    latitude,
    longitude,
    lastUpdated,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_road_closures';
  @override
  VerificationContext validateIntegrity(
    Insertable<LocalRoadClosure> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('bridge_id')) {
      context.handle(
        _bridgeIdMeta,
        bridgeId.isAcceptableOrUnknown(data['bridge_id']!, _bridgeIdMeta),
      );
    } else if (isInserting) {
      context.missing(_bridgeIdMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    }
    if (data.containsKey('closure_reason')) {
      context.handle(
        _closureReasonMeta,
        closureReason.isAcceptableOrUnknown(
          data['closure_reason']!,
          _closureReasonMeta,
        ),
      );
    }
    if (data.containsKey('latitude')) {
      context.handle(
        _latitudeMeta,
        latitude.isAcceptableOrUnknown(data['latitude']!, _latitudeMeta),
      );
    } else if (isInserting) {
      context.missing(_latitudeMeta);
    }
    if (data.containsKey('longitude')) {
      context.handle(
        _longitudeMeta,
        longitude.isAcceptableOrUnknown(data['longitude']!, _longitudeMeta),
      );
    } else if (isInserting) {
      context.missing(_longitudeMeta);
    }
    if (data.containsKey('last_updated')) {
      context.handle(
        _lastUpdatedMeta,
        lastUpdated.isAcceptableOrUnknown(
          data['last_updated']!,
          _lastUpdatedMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_lastUpdatedMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {bridgeId};
  @override
  LocalRoadClosure map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LocalRoadClosure(
      bridgeId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}bridge_id'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
      closureReason: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}closure_reason'],
      ),
      latitude: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}latitude'],
      )!,
      longitude: attachedDatabase.typeMapping.read(
        DriftSqlType.double,
        data['${effectivePrefix}longitude'],
      )!,
      lastUpdated: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}last_updated'],
      )!,
    );
  }

  @override
  $LocalRoadClosuresTable createAlias(String alias) {
    return $LocalRoadClosuresTable(attachedDatabase, alias);
  }
}

class LocalRoadClosure extends DataClass
    implements Insertable<LocalRoadClosure> {
  final String bridgeId;
  final String name;
  final String status;
  final String? closureReason;
  final double latitude;
  final double longitude;
  final DateTime lastUpdated;
  const LocalRoadClosure({
    required this.bridgeId,
    required this.name,
    required this.status,
    this.closureReason,
    required this.latitude,
    required this.longitude,
    required this.lastUpdated,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['bridge_id'] = Variable<String>(bridgeId);
    map['name'] = Variable<String>(name);
    map['status'] = Variable<String>(status);
    if (!nullToAbsent || closureReason != null) {
      map['closure_reason'] = Variable<String>(closureReason);
    }
    map['latitude'] = Variable<double>(latitude);
    map['longitude'] = Variable<double>(longitude);
    map['last_updated'] = Variable<DateTime>(lastUpdated);
    return map;
  }

  LocalRoadClosuresCompanion toCompanion(bool nullToAbsent) {
    return LocalRoadClosuresCompanion(
      bridgeId: Value(bridgeId),
      name: Value(name),
      status: Value(status),
      closureReason: closureReason == null && nullToAbsent
          ? const Value.absent()
          : Value(closureReason),
      latitude: Value(latitude),
      longitude: Value(longitude),
      lastUpdated: Value(lastUpdated),
    );
  }

  factory LocalRoadClosure.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LocalRoadClosure(
      bridgeId: serializer.fromJson<String>(json['bridgeId']),
      name: serializer.fromJson<String>(json['name']),
      status: serializer.fromJson<String>(json['status']),
      closureReason: serializer.fromJson<String?>(json['closureReason']),
      latitude: serializer.fromJson<double>(json['latitude']),
      longitude: serializer.fromJson<double>(json['longitude']),
      lastUpdated: serializer.fromJson<DateTime>(json['lastUpdated']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'bridgeId': serializer.toJson<String>(bridgeId),
      'name': serializer.toJson<String>(name),
      'status': serializer.toJson<String>(status),
      'closureReason': serializer.toJson<String?>(closureReason),
      'latitude': serializer.toJson<double>(latitude),
      'longitude': serializer.toJson<double>(longitude),
      'lastUpdated': serializer.toJson<DateTime>(lastUpdated),
    };
  }

  LocalRoadClosure copyWith({
    String? bridgeId,
    String? name,
    String? status,
    Value<String?> closureReason = const Value.absent(),
    double? latitude,
    double? longitude,
    DateTime? lastUpdated,
  }) => LocalRoadClosure(
    bridgeId: bridgeId ?? this.bridgeId,
    name: name ?? this.name,
    status: status ?? this.status,
    closureReason: closureReason.present
        ? closureReason.value
        : this.closureReason,
    latitude: latitude ?? this.latitude,
    longitude: longitude ?? this.longitude,
    lastUpdated: lastUpdated ?? this.lastUpdated,
  );
  LocalRoadClosure copyWithCompanion(LocalRoadClosuresCompanion data) {
    return LocalRoadClosure(
      bridgeId: data.bridgeId.present ? data.bridgeId.value : this.bridgeId,
      name: data.name.present ? data.name.value : this.name,
      status: data.status.present ? data.status.value : this.status,
      closureReason: data.closureReason.present
          ? data.closureReason.value
          : this.closureReason,
      latitude: data.latitude.present ? data.latitude.value : this.latitude,
      longitude: data.longitude.present ? data.longitude.value : this.longitude,
      lastUpdated: data.lastUpdated.present
          ? data.lastUpdated.value
          : this.lastUpdated,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LocalRoadClosure(')
          ..write('bridgeId: $bridgeId, ')
          ..write('name: $name, ')
          ..write('status: $status, ')
          ..write('closureReason: $closureReason, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('lastUpdated: $lastUpdated')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    bridgeId,
    name,
    status,
    closureReason,
    latitude,
    longitude,
    lastUpdated,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LocalRoadClosure &&
          other.bridgeId == this.bridgeId &&
          other.name == this.name &&
          other.status == this.status &&
          other.closureReason == this.closureReason &&
          other.latitude == this.latitude &&
          other.longitude == this.longitude &&
          other.lastUpdated == this.lastUpdated);
}

class LocalRoadClosuresCompanion extends UpdateCompanion<LocalRoadClosure> {
  final Value<String> bridgeId;
  final Value<String> name;
  final Value<String> status;
  final Value<String?> closureReason;
  final Value<double> latitude;
  final Value<double> longitude;
  final Value<DateTime> lastUpdated;
  final Value<int> rowid;
  const LocalRoadClosuresCompanion({
    this.bridgeId = const Value.absent(),
    this.name = const Value.absent(),
    this.status = const Value.absent(),
    this.closureReason = const Value.absent(),
    this.latitude = const Value.absent(),
    this.longitude = const Value.absent(),
    this.lastUpdated = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LocalRoadClosuresCompanion.insert({
    required String bridgeId,
    required String name,
    this.status = const Value.absent(),
    this.closureReason = const Value.absent(),
    required double latitude,
    required double longitude,
    required DateTime lastUpdated,
    this.rowid = const Value.absent(),
  }) : bridgeId = Value(bridgeId),
       name = Value(name),
       latitude = Value(latitude),
       longitude = Value(longitude),
       lastUpdated = Value(lastUpdated);
  static Insertable<LocalRoadClosure> custom({
    Expression<String>? bridgeId,
    Expression<String>? name,
    Expression<String>? status,
    Expression<String>? closureReason,
    Expression<double>? latitude,
    Expression<double>? longitude,
    Expression<DateTime>? lastUpdated,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (bridgeId != null) 'bridge_id': bridgeId,
      if (name != null) 'name': name,
      if (status != null) 'status': status,
      if (closureReason != null) 'closure_reason': closureReason,
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
      if (lastUpdated != null) 'last_updated': lastUpdated,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalRoadClosuresCompanion copyWith({
    Value<String>? bridgeId,
    Value<String>? name,
    Value<String>? status,
    Value<String?>? closureReason,
    Value<double>? latitude,
    Value<double>? longitude,
    Value<DateTime>? lastUpdated,
    Value<int>? rowid,
  }) {
    return LocalRoadClosuresCompanion(
      bridgeId: bridgeId ?? this.bridgeId,
      name: name ?? this.name,
      status: status ?? this.status,
      closureReason: closureReason ?? this.closureReason,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (bridgeId.present) {
      map['bridge_id'] = Variable<String>(bridgeId.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (closureReason.present) {
      map['closure_reason'] = Variable<String>(closureReason.value);
    }
    if (latitude.present) {
      map['latitude'] = Variable<double>(latitude.value);
    }
    if (longitude.present) {
      map['longitude'] = Variable<double>(longitude.value);
    }
    if (lastUpdated.present) {
      map['last_updated'] = Variable<DateTime>(lastUpdated.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalRoadClosuresCompanion(')
          ..write('bridgeId: $bridgeId, ')
          ..write('name: $name, ')
          ..write('status: $status, ')
          ..write('closureReason: $closureReason, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('lastUpdated: $lastUpdated, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SyncMetadataTable extends SyncMetadata
    with TableInfo<$SyncMetadataTable, SyncMetadataData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SyncMetadataTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _keyMeta = const VerificationMeta('key');
  @override
  late final GeneratedColumn<String> key = GeneratedColumn<String>(
    'key',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _valueMeta = const VerificationMeta('value');
  @override
  late final GeneratedColumn<String> value = GeneratedColumn<String>(
    'value',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
    'updated_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [key, value, updatedAt];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'sync_metadata';
  @override
  VerificationContext validateIntegrity(
    Insertable<SyncMetadataData> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('key')) {
      context.handle(
        _keyMeta,
        key.isAcceptableOrUnknown(data['key']!, _keyMeta),
      );
    } else if (isInserting) {
      context.missing(_keyMeta);
    }
    if (data.containsKey('value')) {
      context.handle(
        _valueMeta,
        value.isAcceptableOrUnknown(data['value']!, _valueMeta),
      );
    } else if (isInserting) {
      context.missing(_valueMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {key};
  @override
  SyncMetadataData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SyncMetadataData(
      key: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}key'],
      )!,
      value: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}value'],
      )!,
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}updated_at'],
      )!,
    );
  }

  @override
  $SyncMetadataTable createAlias(String alias) {
    return $SyncMetadataTable(attachedDatabase, alias);
  }
}

class SyncMetadataData extends DataClass
    implements Insertable<SyncMetadataData> {
  final String key;
  final String value;
  final DateTime updatedAt;
  const SyncMetadataData({
    required this.key,
    required this.value,
    required this.updatedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['key'] = Variable<String>(key);
    map['value'] = Variable<String>(value);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    return map;
  }

  SyncMetadataCompanion toCompanion(bool nullToAbsent) {
    return SyncMetadataCompanion(
      key: Value(key),
      value: Value(value),
      updatedAt: Value(updatedAt),
    );
  }

  factory SyncMetadataData.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SyncMetadataData(
      key: serializer.fromJson<String>(json['key']),
      value: serializer.fromJson<String>(json['value']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'key': serializer.toJson<String>(key),
      'value': serializer.toJson<String>(value),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
    };
  }

  SyncMetadataData copyWith({
    String? key,
    String? value,
    DateTime? updatedAt,
  }) => SyncMetadataData(
    key: key ?? this.key,
    value: value ?? this.value,
    updatedAt: updatedAt ?? this.updatedAt,
  );
  SyncMetadataData copyWithCompanion(SyncMetadataCompanion data) {
    return SyncMetadataData(
      key: data.key.present ? data.key.value : this.key,
      value: data.value.present ? data.value.value : this.value,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SyncMetadataData(')
          ..write('key: $key, ')
          ..write('value: $value, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(key, value, updatedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SyncMetadataData &&
          other.key == this.key &&
          other.value == this.value &&
          other.updatedAt == this.updatedAt);
}

class SyncMetadataCompanion extends UpdateCompanion<SyncMetadataData> {
  final Value<String> key;
  final Value<String> value;
  final Value<DateTime> updatedAt;
  final Value<int> rowid;
  const SyncMetadataCompanion({
    this.key = const Value.absent(),
    this.value = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SyncMetadataCompanion.insert({
    required String key,
    required String value,
    required DateTime updatedAt,
    this.rowid = const Value.absent(),
  }) : key = Value(key),
       value = Value(value),
       updatedAt = Value(updatedAt);
  static Insertable<SyncMetadataData> custom({
    Expression<String>? key,
    Expression<String>? value,
    Expression<DateTime>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (key != null) 'key': key,
      if (value != null) 'value': value,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SyncMetadataCompanion copyWith({
    Value<String>? key,
    Value<String>? value,
    Value<DateTime>? updatedAt,
    Value<int>? rowid,
  }) {
    return SyncMetadataCompanion(
      key: key ?? this.key,
      value: value ?? this.value,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (key.present) {
      map['key'] = Variable<String>(key.value);
    }
    if (value.present) {
      map['value'] = Variable<String>(value.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SyncMetadataCompanion(')
          ..write('key: $key, ')
          ..write('value: $value, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $OutboxEntriesTable outboxEntries = $OutboxEntriesTable(this);
  late final $IncidentReportsTable incidentReports = $IncidentReportsTable(
    this,
  );
  late final $EvidenceRecordsTable evidenceRecords = $EvidenceRecordsTable(
    this,
  );
  late final $LocalAssignmentsTable localAssignments = $LocalAssignmentsTable(
    this,
  );
  late final $LocalRoadClosuresTable localRoadClosures =
      $LocalRoadClosuresTable(this);
  late final $SyncMetadataTable syncMetadata = $SyncMetadataTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
    outboxEntries,
    incidentReports,
    evidenceRecords,
    localAssignments,
    localRoadClosures,
    syncMetadata,
  ];
}

typedef $$OutboxEntriesTableCreateCompanionBuilder =
    OutboxEntriesCompanion Function({
      required String id,
      required String originId,
      required String deviceId,
      required String itemType,
      required String payloadJson,
      Value<String?> rawPayloadHex,
      Value<String> transportPreference,
      Value<String> status,
      Value<int> retryCount,
      Value<int> maxRetries,
      Value<DateTime?> nextRetryAt,
      Value<String?> lastError,
      Value<String?> serverAckId,
      required DateTime createdAt,
      required DateTime observedAt,
      Value<DateTime?> syncedAt,
      Value<int> rowid,
    });
typedef $$OutboxEntriesTableUpdateCompanionBuilder =
    OutboxEntriesCompanion Function({
      Value<String> id,
      Value<String> originId,
      Value<String> deviceId,
      Value<String> itemType,
      Value<String> payloadJson,
      Value<String?> rawPayloadHex,
      Value<String> transportPreference,
      Value<String> status,
      Value<int> retryCount,
      Value<int> maxRetries,
      Value<DateTime?> nextRetryAt,
      Value<String?> lastError,
      Value<String?> serverAckId,
      Value<DateTime> createdAt,
      Value<DateTime> observedAt,
      Value<DateTime?> syncedAt,
      Value<int> rowid,
    });

class $$OutboxEntriesTableFilterComposer
    extends Composer<_$AppDatabase, $OutboxEntriesTable> {
  $$OutboxEntriesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get originId => $composableBuilder(
    column: $table.originId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get deviceId => $composableBuilder(
    column: $table.deviceId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get itemType => $composableBuilder(
    column: $table.itemType,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get payloadJson => $composableBuilder(
    column: $table.payloadJson,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get rawPayloadHex => $composableBuilder(
    column: $table.rawPayloadHex,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get transportPreference => $composableBuilder(
    column: $table.transportPreference,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get retryCount => $composableBuilder(
    column: $table.retryCount,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get maxRetries => $composableBuilder(
    column: $table.maxRetries,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get nextRetryAt => $composableBuilder(
    column: $table.nextRetryAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get lastError => $composableBuilder(
    column: $table.lastError,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get serverAckId => $composableBuilder(
    column: $table.serverAckId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get observedAt => $composableBuilder(
    column: $table.observedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get syncedAt => $composableBuilder(
    column: $table.syncedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$OutboxEntriesTableOrderingComposer
    extends Composer<_$AppDatabase, $OutboxEntriesTable> {
  $$OutboxEntriesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get originId => $composableBuilder(
    column: $table.originId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get deviceId => $composableBuilder(
    column: $table.deviceId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get itemType => $composableBuilder(
    column: $table.itemType,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get payloadJson => $composableBuilder(
    column: $table.payloadJson,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get rawPayloadHex => $composableBuilder(
    column: $table.rawPayloadHex,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get transportPreference => $composableBuilder(
    column: $table.transportPreference,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get retryCount => $composableBuilder(
    column: $table.retryCount,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get maxRetries => $composableBuilder(
    column: $table.maxRetries,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get nextRetryAt => $composableBuilder(
    column: $table.nextRetryAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get lastError => $composableBuilder(
    column: $table.lastError,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get serverAckId => $composableBuilder(
    column: $table.serverAckId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get observedAt => $composableBuilder(
    column: $table.observedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get syncedAt => $composableBuilder(
    column: $table.syncedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$OutboxEntriesTableAnnotationComposer
    extends Composer<_$AppDatabase, $OutboxEntriesTable> {
  $$OutboxEntriesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get originId =>
      $composableBuilder(column: $table.originId, builder: (column) => column);

  GeneratedColumn<String> get deviceId =>
      $composableBuilder(column: $table.deviceId, builder: (column) => column);

  GeneratedColumn<String> get itemType =>
      $composableBuilder(column: $table.itemType, builder: (column) => column);

  GeneratedColumn<String> get payloadJson => $composableBuilder(
    column: $table.payloadJson,
    builder: (column) => column,
  );

  GeneratedColumn<String> get rawPayloadHex => $composableBuilder(
    column: $table.rawPayloadHex,
    builder: (column) => column,
  );

  GeneratedColumn<String> get transportPreference => $composableBuilder(
    column: $table.transportPreference,
    builder: (column) => column,
  );

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<int> get retryCount => $composableBuilder(
    column: $table.retryCount,
    builder: (column) => column,
  );

  GeneratedColumn<int> get maxRetries => $composableBuilder(
    column: $table.maxRetries,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get nextRetryAt => $composableBuilder(
    column: $table.nextRetryAt,
    builder: (column) => column,
  );

  GeneratedColumn<String> get lastError =>
      $composableBuilder(column: $table.lastError, builder: (column) => column);

  GeneratedColumn<String> get serverAckId => $composableBuilder(
    column: $table.serverAckId,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get observedAt => $composableBuilder(
    column: $table.observedAt,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get syncedAt =>
      $composableBuilder(column: $table.syncedAt, builder: (column) => column);
}

class $$OutboxEntriesTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $OutboxEntriesTable,
          OutboxEntry,
          $$OutboxEntriesTableFilterComposer,
          $$OutboxEntriesTableOrderingComposer,
          $$OutboxEntriesTableAnnotationComposer,
          $$OutboxEntriesTableCreateCompanionBuilder,
          $$OutboxEntriesTableUpdateCompanionBuilder,
          (
            OutboxEntry,
            BaseReferences<_$AppDatabase, $OutboxEntriesTable, OutboxEntry>,
          ),
          OutboxEntry,
          PrefetchHooks Function()
        > {
  $$OutboxEntriesTableTableManager(_$AppDatabase db, $OutboxEntriesTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$OutboxEntriesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$OutboxEntriesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$OutboxEntriesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> originId = const Value.absent(),
                Value<String> deviceId = const Value.absent(),
                Value<String> itemType = const Value.absent(),
                Value<String> payloadJson = const Value.absent(),
                Value<String?> rawPayloadHex = const Value.absent(),
                Value<String> transportPreference = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<int> retryCount = const Value.absent(),
                Value<int> maxRetries = const Value.absent(),
                Value<DateTime?> nextRetryAt = const Value.absent(),
                Value<String?> lastError = const Value.absent(),
                Value<String?> serverAckId = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<DateTime> observedAt = const Value.absent(),
                Value<DateTime?> syncedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => OutboxEntriesCompanion(
                id: id,
                originId: originId,
                deviceId: deviceId,
                itemType: itemType,
                payloadJson: payloadJson,
                rawPayloadHex: rawPayloadHex,
                transportPreference: transportPreference,
                status: status,
                retryCount: retryCount,
                maxRetries: maxRetries,
                nextRetryAt: nextRetryAt,
                lastError: lastError,
                serverAckId: serverAckId,
                createdAt: createdAt,
                observedAt: observedAt,
                syncedAt: syncedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String originId,
                required String deviceId,
                required String itemType,
                required String payloadJson,
                Value<String?> rawPayloadHex = const Value.absent(),
                Value<String> transportPreference = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<int> retryCount = const Value.absent(),
                Value<int> maxRetries = const Value.absent(),
                Value<DateTime?> nextRetryAt = const Value.absent(),
                Value<String?> lastError = const Value.absent(),
                Value<String?> serverAckId = const Value.absent(),
                required DateTime createdAt,
                required DateTime observedAt,
                Value<DateTime?> syncedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => OutboxEntriesCompanion.insert(
                id: id,
                originId: originId,
                deviceId: deviceId,
                itemType: itemType,
                payloadJson: payloadJson,
                rawPayloadHex: rawPayloadHex,
                transportPreference: transportPreference,
                status: status,
                retryCount: retryCount,
                maxRetries: maxRetries,
                nextRetryAt: nextRetryAt,
                lastError: lastError,
                serverAckId: serverAckId,
                createdAt: createdAt,
                observedAt: observedAt,
                syncedAt: syncedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$OutboxEntriesTable, OutboxEntry>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $OutboxEntriesTable,
                    OutboxEntry
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$OutboxEntriesTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $OutboxEntriesTable,
      OutboxEntry,
      $$OutboxEntriesTableFilterComposer,
      $$OutboxEntriesTableOrderingComposer,
      $$OutboxEntriesTableAnnotationComposer,
      $$OutboxEntriesTableCreateCompanionBuilder,
      $$OutboxEntriesTableUpdateCompanionBuilder,
      (
        OutboxEntry,
        BaseReferences<_$AppDatabase, $OutboxEntriesTable, OutboxEntry>,
      ),
      OutboxEntry,
      PrefetchHooks Function()
    >;
typedef $$IncidentReportsTableCreateCompanionBuilder =
    IncidentReportsCompanion Function({
      required String id,
      required String reportCode,
      required String category,
      required String title,
      required String description,
      Value<double?> latitude,
      Value<double?> longitude,
      Value<int> peopleAffected,
      Value<int> casualties,
      Value<String?> photoPath,
      Value<bool> photoPendingUpload,
      Value<String> syncStatus,
      Value<String?> syncError,
      required DateTime observedAt,
      required DateTime createdAt,
      Value<DateTime?> syncedAt,
      Value<bool> isDeleted,
      Value<int> rowid,
    });
typedef $$IncidentReportsTableUpdateCompanionBuilder =
    IncidentReportsCompanion Function({
      Value<String> id,
      Value<String> reportCode,
      Value<String> category,
      Value<String> title,
      Value<String> description,
      Value<double?> latitude,
      Value<double?> longitude,
      Value<int> peopleAffected,
      Value<int> casualties,
      Value<String?> photoPath,
      Value<bool> photoPendingUpload,
      Value<String> syncStatus,
      Value<String?> syncError,
      Value<DateTime> observedAt,
      Value<DateTime> createdAt,
      Value<DateTime?> syncedAt,
      Value<bool> isDeleted,
      Value<int> rowid,
    });

class $$IncidentReportsTableFilterComposer
    extends Composer<_$AppDatabase, $IncidentReportsTable> {
  $$IncidentReportsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get reportCode => $composableBuilder(
    column: $table.reportCode,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get category => $composableBuilder(
    column: $table.category,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get title => $composableBuilder(
    column: $table.title,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get latitude => $composableBuilder(
    column: $table.latitude,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get longitude => $composableBuilder(
    column: $table.longitude,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get peopleAffected => $composableBuilder(
    column: $table.peopleAffected,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get casualties => $composableBuilder(
    column: $table.casualties,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get photoPath => $composableBuilder(
    column: $table.photoPath,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get photoPendingUpload => $composableBuilder(
    column: $table.photoPendingUpload,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get syncStatus => $composableBuilder(
    column: $table.syncStatus,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get syncError => $composableBuilder(
    column: $table.syncError,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get observedAt => $composableBuilder(
    column: $table.observedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get syncedAt => $composableBuilder(
    column: $table.syncedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get isDeleted => $composableBuilder(
    column: $table.isDeleted,
    builder: (column) => ColumnFilters(column),
  );
}

class $$IncidentReportsTableOrderingComposer
    extends Composer<_$AppDatabase, $IncidentReportsTable> {
  $$IncidentReportsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get reportCode => $composableBuilder(
    column: $table.reportCode,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get category => $composableBuilder(
    column: $table.category,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get title => $composableBuilder(
    column: $table.title,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get latitude => $composableBuilder(
    column: $table.latitude,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get longitude => $composableBuilder(
    column: $table.longitude,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get peopleAffected => $composableBuilder(
    column: $table.peopleAffected,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get casualties => $composableBuilder(
    column: $table.casualties,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get photoPath => $composableBuilder(
    column: $table.photoPath,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get photoPendingUpload => $composableBuilder(
    column: $table.photoPendingUpload,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get syncStatus => $composableBuilder(
    column: $table.syncStatus,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get syncError => $composableBuilder(
    column: $table.syncError,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get observedAt => $composableBuilder(
    column: $table.observedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get syncedAt => $composableBuilder(
    column: $table.syncedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get isDeleted => $composableBuilder(
    column: $table.isDeleted,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$IncidentReportsTableAnnotationComposer
    extends Composer<_$AppDatabase, $IncidentReportsTable> {
  $$IncidentReportsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get reportCode => $composableBuilder(
    column: $table.reportCode,
    builder: (column) => column,
  );

  GeneratedColumn<String> get category =>
      $composableBuilder(column: $table.category, builder: (column) => column);

  GeneratedColumn<String> get title =>
      $composableBuilder(column: $table.title, builder: (column) => column);

  GeneratedColumn<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => column,
  );

  GeneratedColumn<double> get latitude =>
      $composableBuilder(column: $table.latitude, builder: (column) => column);

  GeneratedColumn<double> get longitude =>
      $composableBuilder(column: $table.longitude, builder: (column) => column);

  GeneratedColumn<int> get peopleAffected => $composableBuilder(
    column: $table.peopleAffected,
    builder: (column) => column,
  );

  GeneratedColumn<int> get casualties => $composableBuilder(
    column: $table.casualties,
    builder: (column) => column,
  );

  GeneratedColumn<String> get photoPath =>
      $composableBuilder(column: $table.photoPath, builder: (column) => column);

  GeneratedColumn<bool> get photoPendingUpload => $composableBuilder(
    column: $table.photoPendingUpload,
    builder: (column) => column,
  );

  GeneratedColumn<String> get syncStatus => $composableBuilder(
    column: $table.syncStatus,
    builder: (column) => column,
  );

  GeneratedColumn<String> get syncError =>
      $composableBuilder(column: $table.syncError, builder: (column) => column);

  GeneratedColumn<DateTime> get observedAt => $composableBuilder(
    column: $table.observedAt,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get syncedAt =>
      $composableBuilder(column: $table.syncedAt, builder: (column) => column);

  GeneratedColumn<bool> get isDeleted =>
      $composableBuilder(column: $table.isDeleted, builder: (column) => column);
}

class $$IncidentReportsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $IncidentReportsTable,
          IncidentReport,
          $$IncidentReportsTableFilterComposer,
          $$IncidentReportsTableOrderingComposer,
          $$IncidentReportsTableAnnotationComposer,
          $$IncidentReportsTableCreateCompanionBuilder,
          $$IncidentReportsTableUpdateCompanionBuilder,
          (
            IncidentReport,
            BaseReferences<
              _$AppDatabase,
              $IncidentReportsTable,
              IncidentReport
            >,
          ),
          IncidentReport,
          PrefetchHooks Function()
        > {
  $$IncidentReportsTableTableManager(
    _$AppDatabase db,
    $IncidentReportsTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$IncidentReportsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$IncidentReportsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$IncidentReportsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> reportCode = const Value.absent(),
                Value<String> category = const Value.absent(),
                Value<String> title = const Value.absent(),
                Value<String> description = const Value.absent(),
                Value<double?> latitude = const Value.absent(),
                Value<double?> longitude = const Value.absent(),
                Value<int> peopleAffected = const Value.absent(),
                Value<int> casualties = const Value.absent(),
                Value<String?> photoPath = const Value.absent(),
                Value<bool> photoPendingUpload = const Value.absent(),
                Value<String> syncStatus = const Value.absent(),
                Value<String?> syncError = const Value.absent(),
                Value<DateTime> observedAt = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<DateTime?> syncedAt = const Value.absent(),
                Value<bool> isDeleted = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => IncidentReportsCompanion(
                id: id,
                reportCode: reportCode,
                category: category,
                title: title,
                description: description,
                latitude: latitude,
                longitude: longitude,
                peopleAffected: peopleAffected,
                casualties: casualties,
                photoPath: photoPath,
                photoPendingUpload: photoPendingUpload,
                syncStatus: syncStatus,
                syncError: syncError,
                observedAt: observedAt,
                createdAt: createdAt,
                syncedAt: syncedAt,
                isDeleted: isDeleted,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String reportCode,
                required String category,
                required String title,
                required String description,
                Value<double?> latitude = const Value.absent(),
                Value<double?> longitude = const Value.absent(),
                Value<int> peopleAffected = const Value.absent(),
                Value<int> casualties = const Value.absent(),
                Value<String?> photoPath = const Value.absent(),
                Value<bool> photoPendingUpload = const Value.absent(),
                Value<String> syncStatus = const Value.absent(),
                Value<String?> syncError = const Value.absent(),
                required DateTime observedAt,
                required DateTime createdAt,
                Value<DateTime?> syncedAt = const Value.absent(),
                Value<bool> isDeleted = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => IncidentReportsCompanion.insert(
                id: id,
                reportCode: reportCode,
                category: category,
                title: title,
                description: description,
                latitude: latitude,
                longitude: longitude,
                peopleAffected: peopleAffected,
                casualties: casualties,
                photoPath: photoPath,
                photoPendingUpload: photoPendingUpload,
                syncStatus: syncStatus,
                syncError: syncError,
                observedAt: observedAt,
                createdAt: createdAt,
                syncedAt: syncedAt,
                isDeleted: isDeleted,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$IncidentReportsTable, IncidentReport>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $IncidentReportsTable,
                    IncidentReport
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$IncidentReportsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $IncidentReportsTable,
      IncidentReport,
      $$IncidentReportsTableFilterComposer,
      $$IncidentReportsTableOrderingComposer,
      $$IncidentReportsTableAnnotationComposer,
      $$IncidentReportsTableCreateCompanionBuilder,
      $$IncidentReportsTableUpdateCompanionBuilder,
      (
        IncidentReport,
        BaseReferences<_$AppDatabase, $IncidentReportsTable, IncidentReport>,
      ),
      IncidentReport,
      PrefetchHooks Function()
    >;
typedef $$EvidenceRecordsTableCreateCompanionBuilder =
    EvidenceRecordsCompanion Function({
      required String id,
      required String messageId,
      required String incidentType,
      required String description,
      Value<String?> photoPath,
      Value<double?> latitude,
      Value<double?> longitude,
      required String sourceTier,
      Value<double> confidence,
      Value<String> status,
      required DateTime observedAt,
      Value<DateTime?> uploadedAt,
      Value<int> rowid,
    });
typedef $$EvidenceRecordsTableUpdateCompanionBuilder =
    EvidenceRecordsCompanion Function({
      Value<String> id,
      Value<String> messageId,
      Value<String> incidentType,
      Value<String> description,
      Value<String?> photoPath,
      Value<double?> latitude,
      Value<double?> longitude,
      Value<String> sourceTier,
      Value<double> confidence,
      Value<String> status,
      Value<DateTime> observedAt,
      Value<DateTime?> uploadedAt,
      Value<int> rowid,
    });

class $$EvidenceRecordsTableFilterComposer
    extends Composer<_$AppDatabase, $EvidenceRecordsTable> {
  $$EvidenceRecordsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get messageId => $composableBuilder(
    column: $table.messageId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get incidentType => $composableBuilder(
    column: $table.incidentType,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get photoPath => $composableBuilder(
    column: $table.photoPath,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get latitude => $composableBuilder(
    column: $table.latitude,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get longitude => $composableBuilder(
    column: $table.longitude,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get sourceTier => $composableBuilder(
    column: $table.sourceTier,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get confidence => $composableBuilder(
    column: $table.confidence,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get observedAt => $composableBuilder(
    column: $table.observedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get uploadedAt => $composableBuilder(
    column: $table.uploadedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$EvidenceRecordsTableOrderingComposer
    extends Composer<_$AppDatabase, $EvidenceRecordsTable> {
  $$EvidenceRecordsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get messageId => $composableBuilder(
    column: $table.messageId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get incidentType => $composableBuilder(
    column: $table.incidentType,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get photoPath => $composableBuilder(
    column: $table.photoPath,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get latitude => $composableBuilder(
    column: $table.latitude,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get longitude => $composableBuilder(
    column: $table.longitude,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get sourceTier => $composableBuilder(
    column: $table.sourceTier,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get confidence => $composableBuilder(
    column: $table.confidence,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get observedAt => $composableBuilder(
    column: $table.observedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get uploadedAt => $composableBuilder(
    column: $table.uploadedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$EvidenceRecordsTableAnnotationComposer
    extends Composer<_$AppDatabase, $EvidenceRecordsTable> {
  $$EvidenceRecordsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get messageId =>
      $composableBuilder(column: $table.messageId, builder: (column) => column);

  GeneratedColumn<String> get incidentType => $composableBuilder(
    column: $table.incidentType,
    builder: (column) => column,
  );

  GeneratedColumn<String> get description => $composableBuilder(
    column: $table.description,
    builder: (column) => column,
  );

  GeneratedColumn<String> get photoPath =>
      $composableBuilder(column: $table.photoPath, builder: (column) => column);

  GeneratedColumn<double> get latitude =>
      $composableBuilder(column: $table.latitude, builder: (column) => column);

  GeneratedColumn<double> get longitude =>
      $composableBuilder(column: $table.longitude, builder: (column) => column);

  GeneratedColumn<String> get sourceTier => $composableBuilder(
    column: $table.sourceTier,
    builder: (column) => column,
  );

  GeneratedColumn<double> get confidence => $composableBuilder(
    column: $table.confidence,
    builder: (column) => column,
  );

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<DateTime> get observedAt => $composableBuilder(
    column: $table.observedAt,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get uploadedAt => $composableBuilder(
    column: $table.uploadedAt,
    builder: (column) => column,
  );
}

class $$EvidenceRecordsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $EvidenceRecordsTable,
          EvidenceRecord,
          $$EvidenceRecordsTableFilterComposer,
          $$EvidenceRecordsTableOrderingComposer,
          $$EvidenceRecordsTableAnnotationComposer,
          $$EvidenceRecordsTableCreateCompanionBuilder,
          $$EvidenceRecordsTableUpdateCompanionBuilder,
          (
            EvidenceRecord,
            BaseReferences<
              _$AppDatabase,
              $EvidenceRecordsTable,
              EvidenceRecord
            >,
          ),
          EvidenceRecord,
          PrefetchHooks Function()
        > {
  $$EvidenceRecordsTableTableManager(
    _$AppDatabase db,
    $EvidenceRecordsTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$EvidenceRecordsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$EvidenceRecordsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$EvidenceRecordsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> messageId = const Value.absent(),
                Value<String> incidentType = const Value.absent(),
                Value<String> description = const Value.absent(),
                Value<String?> photoPath = const Value.absent(),
                Value<double?> latitude = const Value.absent(),
                Value<double?> longitude = const Value.absent(),
                Value<String> sourceTier = const Value.absent(),
                Value<double> confidence = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<DateTime> observedAt = const Value.absent(),
                Value<DateTime?> uploadedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => EvidenceRecordsCompanion(
                id: id,
                messageId: messageId,
                incidentType: incidentType,
                description: description,
                photoPath: photoPath,
                latitude: latitude,
                longitude: longitude,
                sourceTier: sourceTier,
                confidence: confidence,
                status: status,
                observedAt: observedAt,
                uploadedAt: uploadedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String messageId,
                required String incidentType,
                required String description,
                Value<String?> photoPath = const Value.absent(),
                Value<double?> latitude = const Value.absent(),
                Value<double?> longitude = const Value.absent(),
                required String sourceTier,
                Value<double> confidence = const Value.absent(),
                Value<String> status = const Value.absent(),
                required DateTime observedAt,
                Value<DateTime?> uploadedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => EvidenceRecordsCompanion.insert(
                id: id,
                messageId: messageId,
                incidentType: incidentType,
                description: description,
                photoPath: photoPath,
                latitude: latitude,
                longitude: longitude,
                sourceTier: sourceTier,
                confidence: confidence,
                status: status,
                observedAt: observedAt,
                uploadedAt: uploadedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$EvidenceRecordsTable, EvidenceRecord>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $EvidenceRecordsTable,
                    EvidenceRecord
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$EvidenceRecordsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $EvidenceRecordsTable,
      EvidenceRecord,
      $$EvidenceRecordsTableFilterComposer,
      $$EvidenceRecordsTableOrderingComposer,
      $$EvidenceRecordsTableAnnotationComposer,
      $$EvidenceRecordsTableCreateCompanionBuilder,
      $$EvidenceRecordsTableUpdateCompanionBuilder,
      (
        EvidenceRecord,
        BaseReferences<_$AppDatabase, $EvidenceRecordsTable, EvidenceRecord>,
      ),
      EvidenceRecord,
      PrefetchHooks Function()
    >;
typedef $$LocalAssignmentsTableCreateCompanionBuilder =
    LocalAssignmentsCompanion Function({
      required String id,
      required String planId,
      required int versionNumber,
      required String depotId,
      required String zoneId,
      required String zoneName,
      required String resourceType,
      required int quantity,
      required String priority,
      required double priorityScore,
      required double travelTimeMin,
      required String destination,
      required double latitude,
      required double longitude,
      required String routeNodesJson,
      Value<String> status,
      Value<String?> acknowledgedByDevice,
      Value<bool> serverConfirmed,
      required DateTime lastUpdated,
      Value<int> rowid,
    });
typedef $$LocalAssignmentsTableUpdateCompanionBuilder =
    LocalAssignmentsCompanion Function({
      Value<String> id,
      Value<String> planId,
      Value<int> versionNumber,
      Value<String> depotId,
      Value<String> zoneId,
      Value<String> zoneName,
      Value<String> resourceType,
      Value<int> quantity,
      Value<String> priority,
      Value<double> priorityScore,
      Value<double> travelTimeMin,
      Value<String> destination,
      Value<double> latitude,
      Value<double> longitude,
      Value<String> routeNodesJson,
      Value<String> status,
      Value<String?> acknowledgedByDevice,
      Value<bool> serverConfirmed,
      Value<DateTime> lastUpdated,
      Value<int> rowid,
    });

class $$LocalAssignmentsTableFilterComposer
    extends Composer<_$AppDatabase, $LocalAssignmentsTable> {
  $$LocalAssignmentsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get planId => $composableBuilder(
    column: $table.planId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get versionNumber => $composableBuilder(
    column: $table.versionNumber,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get depotId => $composableBuilder(
    column: $table.depotId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get zoneId => $composableBuilder(
    column: $table.zoneId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get zoneName => $composableBuilder(
    column: $table.zoneName,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get resourceType => $composableBuilder(
    column: $table.resourceType,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get quantity => $composableBuilder(
    column: $table.quantity,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get priority => $composableBuilder(
    column: $table.priority,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get priorityScore => $composableBuilder(
    column: $table.priorityScore,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get travelTimeMin => $composableBuilder(
    column: $table.travelTimeMin,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get destination => $composableBuilder(
    column: $table.destination,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get latitude => $composableBuilder(
    column: $table.latitude,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get longitude => $composableBuilder(
    column: $table.longitude,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get routeNodesJson => $composableBuilder(
    column: $table.routeNodesJson,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get acknowledgedByDevice => $composableBuilder(
    column: $table.acknowledgedByDevice,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<bool> get serverConfirmed => $composableBuilder(
    column: $table.serverConfirmed,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get lastUpdated => $composableBuilder(
    column: $table.lastUpdated,
    builder: (column) => ColumnFilters(column),
  );
}

class $$LocalAssignmentsTableOrderingComposer
    extends Composer<_$AppDatabase, $LocalAssignmentsTable> {
  $$LocalAssignmentsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get planId => $composableBuilder(
    column: $table.planId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get versionNumber => $composableBuilder(
    column: $table.versionNumber,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get depotId => $composableBuilder(
    column: $table.depotId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get zoneId => $composableBuilder(
    column: $table.zoneId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get zoneName => $composableBuilder(
    column: $table.zoneName,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get resourceType => $composableBuilder(
    column: $table.resourceType,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get quantity => $composableBuilder(
    column: $table.quantity,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get priority => $composableBuilder(
    column: $table.priority,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get priorityScore => $composableBuilder(
    column: $table.priorityScore,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get travelTimeMin => $composableBuilder(
    column: $table.travelTimeMin,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get destination => $composableBuilder(
    column: $table.destination,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get latitude => $composableBuilder(
    column: $table.latitude,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get longitude => $composableBuilder(
    column: $table.longitude,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get routeNodesJson => $composableBuilder(
    column: $table.routeNodesJson,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get acknowledgedByDevice => $composableBuilder(
    column: $table.acknowledgedByDevice,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<bool> get serverConfirmed => $composableBuilder(
    column: $table.serverConfirmed,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get lastUpdated => $composableBuilder(
    column: $table.lastUpdated,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$LocalAssignmentsTableAnnotationComposer
    extends Composer<_$AppDatabase, $LocalAssignmentsTable> {
  $$LocalAssignmentsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get planId =>
      $composableBuilder(column: $table.planId, builder: (column) => column);

  GeneratedColumn<int> get versionNumber => $composableBuilder(
    column: $table.versionNumber,
    builder: (column) => column,
  );

  GeneratedColumn<String> get depotId =>
      $composableBuilder(column: $table.depotId, builder: (column) => column);

  GeneratedColumn<String> get zoneId =>
      $composableBuilder(column: $table.zoneId, builder: (column) => column);

  GeneratedColumn<String> get zoneName =>
      $composableBuilder(column: $table.zoneName, builder: (column) => column);

  GeneratedColumn<String> get resourceType => $composableBuilder(
    column: $table.resourceType,
    builder: (column) => column,
  );

  GeneratedColumn<int> get quantity =>
      $composableBuilder(column: $table.quantity, builder: (column) => column);

  GeneratedColumn<String> get priority =>
      $composableBuilder(column: $table.priority, builder: (column) => column);

  GeneratedColumn<double> get priorityScore => $composableBuilder(
    column: $table.priorityScore,
    builder: (column) => column,
  );

  GeneratedColumn<double> get travelTimeMin => $composableBuilder(
    column: $table.travelTimeMin,
    builder: (column) => column,
  );

  GeneratedColumn<String> get destination => $composableBuilder(
    column: $table.destination,
    builder: (column) => column,
  );

  GeneratedColumn<double> get latitude =>
      $composableBuilder(column: $table.latitude, builder: (column) => column);

  GeneratedColumn<double> get longitude =>
      $composableBuilder(column: $table.longitude, builder: (column) => column);

  GeneratedColumn<String> get routeNodesJson => $composableBuilder(
    column: $table.routeNodesJson,
    builder: (column) => column,
  );

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get acknowledgedByDevice => $composableBuilder(
    column: $table.acknowledgedByDevice,
    builder: (column) => column,
  );

  GeneratedColumn<bool> get serverConfirmed => $composableBuilder(
    column: $table.serverConfirmed,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get lastUpdated => $composableBuilder(
    column: $table.lastUpdated,
    builder: (column) => column,
  );
}

class $$LocalAssignmentsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $LocalAssignmentsTable,
          LocalAssignment,
          $$LocalAssignmentsTableFilterComposer,
          $$LocalAssignmentsTableOrderingComposer,
          $$LocalAssignmentsTableAnnotationComposer,
          $$LocalAssignmentsTableCreateCompanionBuilder,
          $$LocalAssignmentsTableUpdateCompanionBuilder,
          (
            LocalAssignment,
            BaseReferences<
              _$AppDatabase,
              $LocalAssignmentsTable,
              LocalAssignment
            >,
          ),
          LocalAssignment,
          PrefetchHooks Function()
        > {
  $$LocalAssignmentsTableTableManager(
    _$AppDatabase db,
    $LocalAssignmentsTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LocalAssignmentsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$LocalAssignmentsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$LocalAssignmentsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> planId = const Value.absent(),
                Value<int> versionNumber = const Value.absent(),
                Value<String> depotId = const Value.absent(),
                Value<String> zoneId = const Value.absent(),
                Value<String> zoneName = const Value.absent(),
                Value<String> resourceType = const Value.absent(),
                Value<int> quantity = const Value.absent(),
                Value<String> priority = const Value.absent(),
                Value<double> priorityScore = const Value.absent(),
                Value<double> travelTimeMin = const Value.absent(),
                Value<String> destination = const Value.absent(),
                Value<double> latitude = const Value.absent(),
                Value<double> longitude = const Value.absent(),
                Value<String> routeNodesJson = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<String?> acknowledgedByDevice = const Value.absent(),
                Value<bool> serverConfirmed = const Value.absent(),
                Value<DateTime> lastUpdated = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalAssignmentsCompanion(
                id: id,
                planId: planId,
                versionNumber: versionNumber,
                depotId: depotId,
                zoneId: zoneId,
                zoneName: zoneName,
                resourceType: resourceType,
                quantity: quantity,
                priority: priority,
                priorityScore: priorityScore,
                travelTimeMin: travelTimeMin,
                destination: destination,
                latitude: latitude,
                longitude: longitude,
                routeNodesJson: routeNodesJson,
                status: status,
                acknowledgedByDevice: acknowledgedByDevice,
                serverConfirmed: serverConfirmed,
                lastUpdated: lastUpdated,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String planId,
                required int versionNumber,
                required String depotId,
                required String zoneId,
                required String zoneName,
                required String resourceType,
                required int quantity,
                required String priority,
                required double priorityScore,
                required double travelTimeMin,
                required String destination,
                required double latitude,
                required double longitude,
                required String routeNodesJson,
                Value<String> status = const Value.absent(),
                Value<String?> acknowledgedByDevice = const Value.absent(),
                Value<bool> serverConfirmed = const Value.absent(),
                required DateTime lastUpdated,
                Value<int> rowid = const Value.absent(),
              }) => LocalAssignmentsCompanion.insert(
                id: id,
                planId: planId,
                versionNumber: versionNumber,
                depotId: depotId,
                zoneId: zoneId,
                zoneName: zoneName,
                resourceType: resourceType,
                quantity: quantity,
                priority: priority,
                priorityScore: priorityScore,
                travelTimeMin: travelTimeMin,
                destination: destination,
                latitude: latitude,
                longitude: longitude,
                routeNodesJson: routeNodesJson,
                status: status,
                acknowledgedByDevice: acknowledgedByDevice,
                serverConfirmed: serverConfirmed,
                lastUpdated: lastUpdated,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$LocalAssignmentsTable, LocalAssignment>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $LocalAssignmentsTable,
                    LocalAssignment
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$LocalAssignmentsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $LocalAssignmentsTable,
      LocalAssignment,
      $$LocalAssignmentsTableFilterComposer,
      $$LocalAssignmentsTableOrderingComposer,
      $$LocalAssignmentsTableAnnotationComposer,
      $$LocalAssignmentsTableCreateCompanionBuilder,
      $$LocalAssignmentsTableUpdateCompanionBuilder,
      (
        LocalAssignment,
        BaseReferences<_$AppDatabase, $LocalAssignmentsTable, LocalAssignment>,
      ),
      LocalAssignment,
      PrefetchHooks Function()
    >;
typedef $$LocalRoadClosuresTableCreateCompanionBuilder =
    LocalRoadClosuresCompanion Function({
      required String bridgeId,
      required String name,
      Value<String> status,
      Value<String?> closureReason,
      required double latitude,
      required double longitude,
      required DateTime lastUpdated,
      Value<int> rowid,
    });
typedef $$LocalRoadClosuresTableUpdateCompanionBuilder =
    LocalRoadClosuresCompanion Function({
      Value<String> bridgeId,
      Value<String> name,
      Value<String> status,
      Value<String?> closureReason,
      Value<double> latitude,
      Value<double> longitude,
      Value<DateTime> lastUpdated,
      Value<int> rowid,
    });

class $$LocalRoadClosuresTableFilterComposer
    extends Composer<_$AppDatabase, $LocalRoadClosuresTable> {
  $$LocalRoadClosuresTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get bridgeId => $composableBuilder(
    column: $table.bridgeId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get closureReason => $composableBuilder(
    column: $table.closureReason,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get latitude => $composableBuilder(
    column: $table.latitude,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<double> get longitude => $composableBuilder(
    column: $table.longitude,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get lastUpdated => $composableBuilder(
    column: $table.lastUpdated,
    builder: (column) => ColumnFilters(column),
  );
}

class $$LocalRoadClosuresTableOrderingComposer
    extends Composer<_$AppDatabase, $LocalRoadClosuresTable> {
  $$LocalRoadClosuresTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get bridgeId => $composableBuilder(
    column: $table.bridgeId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get closureReason => $composableBuilder(
    column: $table.closureReason,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get latitude => $composableBuilder(
    column: $table.latitude,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<double> get longitude => $composableBuilder(
    column: $table.longitude,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get lastUpdated => $composableBuilder(
    column: $table.lastUpdated,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$LocalRoadClosuresTableAnnotationComposer
    extends Composer<_$AppDatabase, $LocalRoadClosuresTable> {
  $$LocalRoadClosuresTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get bridgeId =>
      $composableBuilder(column: $table.bridgeId, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get closureReason => $composableBuilder(
    column: $table.closureReason,
    builder: (column) => column,
  );

  GeneratedColumn<double> get latitude =>
      $composableBuilder(column: $table.latitude, builder: (column) => column);

  GeneratedColumn<double> get longitude =>
      $composableBuilder(column: $table.longitude, builder: (column) => column);

  GeneratedColumn<DateTime> get lastUpdated => $composableBuilder(
    column: $table.lastUpdated,
    builder: (column) => column,
  );
}

class $$LocalRoadClosuresTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $LocalRoadClosuresTable,
          LocalRoadClosure,
          $$LocalRoadClosuresTableFilterComposer,
          $$LocalRoadClosuresTableOrderingComposer,
          $$LocalRoadClosuresTableAnnotationComposer,
          $$LocalRoadClosuresTableCreateCompanionBuilder,
          $$LocalRoadClosuresTableUpdateCompanionBuilder,
          (
            LocalRoadClosure,
            BaseReferences<
              _$AppDatabase,
              $LocalRoadClosuresTable,
              LocalRoadClosure
            >,
          ),
          LocalRoadClosure,
          PrefetchHooks Function()
        > {
  $$LocalRoadClosuresTableTableManager(
    _$AppDatabase db,
    $LocalRoadClosuresTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LocalRoadClosuresTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$LocalRoadClosuresTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$LocalRoadClosuresTableAnnotationComposer(
                $db: db,
                $table: table,
              ),
          updateCompanionCallback:
              ({
                Value<String> bridgeId = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<String?> closureReason = const Value.absent(),
                Value<double> latitude = const Value.absent(),
                Value<double> longitude = const Value.absent(),
                Value<DateTime> lastUpdated = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalRoadClosuresCompanion(
                bridgeId: bridgeId,
                name: name,
                status: status,
                closureReason: closureReason,
                latitude: latitude,
                longitude: longitude,
                lastUpdated: lastUpdated,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String bridgeId,
                required String name,
                Value<String> status = const Value.absent(),
                Value<String?> closureReason = const Value.absent(),
                required double latitude,
                required double longitude,
                required DateTime lastUpdated,
                Value<int> rowid = const Value.absent(),
              }) => LocalRoadClosuresCompanion.insert(
                bridgeId: bridgeId,
                name: name,
                status: status,
                closureReason: closureReason,
                latitude: latitude,
                longitude: longitude,
                lastUpdated: lastUpdated,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$LocalRoadClosuresTable, LocalRoadClosure>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $LocalRoadClosuresTable,
                    LocalRoadClosure
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$LocalRoadClosuresTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $LocalRoadClosuresTable,
      LocalRoadClosure,
      $$LocalRoadClosuresTableFilterComposer,
      $$LocalRoadClosuresTableOrderingComposer,
      $$LocalRoadClosuresTableAnnotationComposer,
      $$LocalRoadClosuresTableCreateCompanionBuilder,
      $$LocalRoadClosuresTableUpdateCompanionBuilder,
      (
        LocalRoadClosure,
        BaseReferences<
          _$AppDatabase,
          $LocalRoadClosuresTable,
          LocalRoadClosure
        >,
      ),
      LocalRoadClosure,
      PrefetchHooks Function()
    >;
typedef $$SyncMetadataTableCreateCompanionBuilder =
    SyncMetadataCompanion Function({
      required String key,
      required String value,
      required DateTime updatedAt,
      Value<int> rowid,
    });
typedef $$SyncMetadataTableUpdateCompanionBuilder =
    SyncMetadataCompanion Function({
      Value<String> key,
      Value<String> value,
      Value<DateTime> updatedAt,
      Value<int> rowid,
    });

class $$SyncMetadataTableFilterComposer
    extends Composer<_$AppDatabase, $SyncMetadataTable> {
  $$SyncMetadataTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get key => $composableBuilder(
    column: $table.key,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get value => $composableBuilder(
    column: $table.value,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$SyncMetadataTableOrderingComposer
    extends Composer<_$AppDatabase, $SyncMetadataTable> {
  $$SyncMetadataTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get key => $composableBuilder(
    column: $table.key,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get value => $composableBuilder(
    column: $table.value,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$SyncMetadataTableAnnotationComposer
    extends Composer<_$AppDatabase, $SyncMetadataTable> {
  $$SyncMetadataTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get key =>
      $composableBuilder(column: $table.key, builder: (column) => column);

  GeneratedColumn<String> get value =>
      $composableBuilder(column: $table.value, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$SyncMetadataTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $SyncMetadataTable,
          SyncMetadataData,
          $$SyncMetadataTableFilterComposer,
          $$SyncMetadataTableOrderingComposer,
          $$SyncMetadataTableAnnotationComposer,
          $$SyncMetadataTableCreateCompanionBuilder,
          $$SyncMetadataTableUpdateCompanionBuilder,
          (
            SyncMetadataData,
            BaseReferences<_$AppDatabase, $SyncMetadataTable, SyncMetadataData>,
          ),
          SyncMetadataData,
          PrefetchHooks Function()
        > {
  $$SyncMetadataTableTableManager(_$AppDatabase db, $SyncMetadataTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SyncMetadataTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SyncMetadataTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SyncMetadataTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> key = const Value.absent(),
                Value<String> value = const Value.absent(),
                Value<DateTime> updatedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => SyncMetadataCompanion(
                key: key,
                value: value,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String key,
                required String value,
                required DateTime updatedAt,
                Value<int> rowid = const Value.absent(),
              }) => SyncMetadataCompanion.insert(
                key: key,
                value: value,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map(
                (e) => (
                  e.readTable<$SyncMetadataTable, SyncMetadataData>(table),
                  BaseReferences<
                    _$AppDatabase,
                    $SyncMetadataTable,
                    SyncMetadataData
                  >(db, table, e),
                ),
              )
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$SyncMetadataTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $SyncMetadataTable,
      SyncMetadataData,
      $$SyncMetadataTableFilterComposer,
      $$SyncMetadataTableOrderingComposer,
      $$SyncMetadataTableAnnotationComposer,
      $$SyncMetadataTableCreateCompanionBuilder,
      $$SyncMetadataTableUpdateCompanionBuilder,
      (
        SyncMetadataData,
        BaseReferences<_$AppDatabase, $SyncMetadataTable, SyncMetadataData>,
      ),
      SyncMetadataData,
      PrefetchHooks Function()
    >;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$OutboxEntriesTableTableManager get outboxEntries =>
      $$OutboxEntriesTableTableManager(_db, _db.outboxEntries);
  $$IncidentReportsTableTableManager get incidentReports =>
      $$IncidentReportsTableTableManager(_db, _db.incidentReports);
  $$EvidenceRecordsTableTableManager get evidenceRecords =>
      $$EvidenceRecordsTableTableManager(_db, _db.evidenceRecords);
  $$LocalAssignmentsTableTableManager get localAssignments =>
      $$LocalAssignmentsTableTableManager(_db, _db.localAssignments);
  $$LocalRoadClosuresTableTableManager get localRoadClosures =>
      $$LocalRoadClosuresTableTableManager(_db, _db.localRoadClosures);
  $$SyncMetadataTableTableManager get syncMetadata =>
      $$SyncMetadataTableTableManager(_db, _db.syncMetadata);
}
