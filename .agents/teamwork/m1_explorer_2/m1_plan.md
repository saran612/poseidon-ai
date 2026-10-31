# M1 Plan: Dependencies, Manifest & Build Hooks Architecture

**Document ID**: `POSEIDON-M1-PLAN-EXPLORER-2`  
**Author**: M1 Explorer 2 (`m1_explorer_2`)  
**Target Milestone**: M1 (Environment, Tooling & Scaffolding)  
**Project Name**: `poseidon` (formerly SAHAYA Field)  
**Target Directory**: `/home/saran/projects/the one/app`  
**Date**: October 31, 2026  
**Status**: COMPLETE / READY FOR WORKER EXECUTION  

---

## 1. Executive Summary

Milestone M1 establishes the foundational developer tooling, dependency manifests, build hooks, and asset declarations for Project Poseidon. This document prescribes the exact, production-ready `pubspec.yaml` manifest, modern `sqlite3mc` native encryption hook architecture, internationalization (`l10n.yaml`), asset hierarchies, and CLI code generation triggers.

Per the latest architectural directives:
1. **Target Subdirectory**: The Flutter application is located strictly within `/home/saran/projects/the one/app/`. All manifests (`pubspec.yaml`, `l10n.yaml`, `build.yaml`), asset directories (`assets/tiles/`, `assets/data/`, `assets/images/`), and test harnesses reside within `app/`.
2. **Project Identity**: The project name is `poseidon` (Package identifier: `org.poseidon.poseidon` or `poseidon`).
3. **Database Encryption**: Legacy, end-of-life wrappers (such as `sqlcipher_flutter_libs`) are strictly prohibited. Encryption is provided via Dart native build hooks utilizing `sqlite3mc` (SQLite3 Multiple Ciphers) supporting SQLCipher 3 and 4 (AES-256 with HMAC-SHA512/SHA1).
4. **Clean Resolution Guarantee**: All dependency versions have been verified against pub.dev and cross-checked against Flutter 3.x / Dart 3.x constraints to guarantee deterministic, zero-conflict resolution during `flutter pub get`.

---

## 2. Exhaustive Dependency Architecture & Requirement Traceability

Every package included in `pubspec.yaml` directly maps to a functional requirement specified in `PROJECT.md` and `ORIGINAL_REQUEST.md`:

| Category | Package | Version | Requirement Mapping | Architectural Role & Justification |
|---|---|---|---|---|
| **Core Flutter** | `flutter` | `sdk: flutter` | System | Core Flutter framework runtime. |
| **Localization** | `flutter_localizations` | `sdk: flutter` | R1 (Languages) | Core SDK i18n support for English, Tamil, and Hindi. |
| **Localization** | `intl` | `any` | R1 (Languages) | Date/number formatting and message translation. Set to `any` to eliminate version conflicts with `flutter_localizations`. |
| **Local Persistence** | `drift` | `^2.35.3` | R2 (Persistence) | Reactive, strongly-typed SQLite persistence engine across 11 relational tables. |
| **SQLite Bindings** | `sqlite3` | `^3.8.0` | R2 (Encryption) | Low-level C FFI bindings. Automatically bundles SQLite and integrates with Dart build hooks. |
| **Drift Utilities** | `drift_flutter` | `^0.3.1` | R2 (Persistence) | Modern Drift connection helper and isolate abstractions for Flutter. |
| **Filesystem** | `path_provider` | `^2.1.6` | R2, R3, R4 | Resolves local app sandboxes, database directories, and map pack storage. |
| **Path Utilities** | `path` | `^1.9.1` | R2, R3, R4 | Cross-platform filesystem path concatenation and normalization. |
| **Identity** | `uuid` | `^4.6.0` | R2 (Outbox) | RFC 4122 v4 UUID generator for client-side offline idempotency keys. |
| **HTTP Client** | `dio` | `^5.11.1` | R2, R3, R6 | Robust HTTP client supporting retry interceptors, gzip compression, and bearer tokens. |
| **Realtime Sync** | `web_socket_channel` | `^3.0.3` | R2, R6 (Live Sync) | Two-way WebSocket connection for `/live` delta sync when online. |
| **Network Reachability**| `connectivity_plus` | `^7.3.2` | R2, R3 | Hardware network state listener (Wi-Fi, Cellular, None) driving reachability probe. |
| **Interactive Map** | `flutter_map` | `^8.3.2` | R4 (Offline Maps) | 100% pure-Dart mapping engine. Renders bundled offline raster/vector tiles without OSM scraping. |
| **Geospatial Math** | `latlong2` | `^0.10.1` | R4 (Routing/Geo) | Lightweight WGS84 coordinate math, distance calculations, and polygon representation. |
| **Secure Key Store** | `flutter_secure_storage`| `^11.2.0` | R7 (Security) | Stores database encryption passphrases and auth tokens in Android Keystore / iOS Keychain. |
| **Hashing & Crypto** | `crypto` | `^3.0.8` | R7 (Security) | SHA-256 and HMAC utilities for payload integrity, sanitization, and key derivation. |
| **Hardware GPS** | `geolocator` | `^14.1.2` | R4 (GPS Tracking) | High-accuracy foreground and background location tracking with accuracy estimates. |
| **Local Notifications**| `flutter_local_notifications`| `^22.3.3` | R5 (Alerts) | Native notification channels (Critical, Warning, Info) with full-screen lock intents. |
| **State Management** | `provider` | `^6.1.5+1` | R1 (Presentation) | Lightweight, predictable state management across role screens and sync status bar. |
| **Local Settings** | `shared_preferences` | `^2.5.6` | R1, R3 | Key-value store for user preferences (selected language, low-literacy mode, data saver). |
| **Archive Utilities** | `archive` | `^4.5.2` | R2, R3 | Gzip compression for priority outbox batches and unzipping "Prepare Mode" map packs. |
| **Test Engine** (Dev) | `flutter_test` | `sdk: flutter` | Testing Gate | Headless Dart test runner for unit and widget testing. |
| **Static Lints** (Dev) | `flutter_lints` | `^6.0.0` | Static Analysis | Strict static analysis rules enforcing zero errors and zero warnings. |
| **Code Runner** (Dev) | `build_runner` | `^2.17.1` | Code Generation | CLI orchestration tool executing code generation for Drift and models. |
| **Drift Compiler** (Dev)| `drift_dev` | `^2.35.2` | Code Generation | Drift code generator producing strongly-typed database queries and table DAOs. |
| **Mocking Engine** (Dev)| `mocktail` | `^1.0.5` | Headless Tests | Code-gen-free mocking library for instantaneous headless test execution. |

---

## 3. The Exact `pubspec.yaml` Manifest

The Worker must create `/home/saran/projects/the one/app/pubspec.yaml` with the exact verbatim content below:

```yaml
name: poseidon
description: "Poseidon — Offline-First Disaster Response Field Companion"
publish_to: "none"
version: 1.0.0+1

environment:
  sdk: ">=3.4.0 <4.0.0"
  flutter: ">=3.22.0"

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter

  # --------------------------------------------------------------------------
  # 1. Data Layer, Local Persistence & Commutative Sync (R2)
  # --------------------------------------------------------------------------
  drift: ^2.35.3
  sqlite3: ^3.8.0
  drift_flutter: ^0.3.1
  path_provider: ^2.1.6
  path: ^1.9.1
  uuid: ^4.6.0

  # --------------------------------------------------------------------------
  # 2. Networking, REST Client & WebSockets (R2, R3, R6)
  # --------------------------------------------------------------------------
  dio: ^5.11.1
  web_socket_channel: ^3.0.3
  connectivity_plus: ^7.3.2

  # --------------------------------------------------------------------------
  # 3. Offline Maps, Geospatial Calculations & Routing (R4)
  # --------------------------------------------------------------------------
  flutter_map: ^8.3.2
  latlong2: ^0.10.1

  # --------------------------------------------------------------------------
  # 4. Security, Key Management & Secure Wipe (R7)
  # --------------------------------------------------------------------------
  flutter_secure_storage: ^11.2.0
  crypto: ^3.0.8

  # --------------------------------------------------------------------------
  # 5. Device Hardware, Location & Geofencing (R3, R4, R5)
  # --------------------------------------------------------------------------
  geolocator: ^14.1.2
  flutter_local_notifications: ^22.3.3

  # --------------------------------------------------------------------------
  # 6. Presentation, State Management & Utilities (R1, R3, R5)
  # --------------------------------------------------------------------------
  provider: ^6.1.5+1
  shared_preferences: ^2.5.6
  intl: any
  archive: ^4.5.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^6.0.0
  build_runner: ^2.17.1
  drift_dev: ^2.35.2
  mocktail: ^1.0.5

# ----------------------------------------------------------------------------
# Native Build Hooks: SQLite3 Multiple Ciphers (SQLCipher 3/4 Native AES-256)
# ----------------------------------------------------------------------------
hooks:
  user_defines:
    sqlite3:
      source: sqlite3mc

# ----------------------------------------------------------------------------
# Flutter Configuration, Localization & Asset Registration
# ----------------------------------------------------------------------------
flutter:
  uses-material-design: true
  generate: true

  assets:
    - assets/tiles/
    - assets/data/
    - assets/images/
```

---

## 4. SQLCipher / SQLite3 Multiple Ciphers (`sqlite3mc`) Architecture

### 4.1 Native Build Hooks Mechanism
Modern Dart/Flutter package architectures handle native C extensions via **Dart build hooks**. 
In `pubspec.yaml`, the declaration:
```yaml
hooks:
  user_defines:
    sqlite3:
      source: sqlite3mc
```
instructs the build system that when compiling `package:sqlite3`, it must pull and compile **SQLite3MultipleCiphers** rather than standard SQLite.

### 4.2 Critical Architectural Rules
1. **Never include `sqlcipher_flutter_libs`**: The legacy `sqlcipher_flutter_libs` package is deprecated. Including it will cause duplicate symbol collisions, linker failures, and Android NDK build breaks.
2. **Standard SQLite C-API Compatibility**: `sqlite3mc` implements the exact SQLite3 C-API while adding multiple encryption backends (SQLCipher 3 & 4, ChaCha20, wxSQLite3).
3. **Database Setup Configuration (`openEncryptedConnection`)**:
   When opening the database on a physical or virtual device, the encryption key is passed dynamically via SQLite PRAGMA commands inside the Drift `setup` callback before any table access:
   ```dart
   NativeDatabase.createInBackground(
     dbFile,
     setup: (rawDb) {
       // Apply AES-256 encryption key securely retrieved from FlutterSecureStorage
       rawDb.execute("PRAGMA key = '$encryptionPassphrase';");
       rawDb.execute("PRAGMA cipher_compatibility = 4;");
       rawDb.execute("PRAGMA journal_mode = WAL;");
       rawDb.execute("PRAGMA synchronous = NORMAL;");
     },
   );
   ```
4. **Headless Testing Strategy**:
   For headless unit tests (`flutter test`) running on Linux or CI environments without hardware keystore access:
   - Automated tests instantiate `NativeDatabase.memory()`.
   - In-memory databases execute instantly without disk overhead and without requiring platform-specific secure hardware.
   - Dedicated encryption unit tests verify the `PRAGMA key` execution against ephemeral temporary files.

---

## 5. Asset Hierarchy Specification

The Worker must create three designated asset directories under `/home/saran/projects/the one/app/assets/`:

```
app/assets/
├── tiles/                      # Bundled offline raster/vector map tiles
│   └── .gitkeep                # Placeholder for sample district tiles
├── data/                       # Seed scenarios and graph manifests
│   └── .gitkeep                # Placeholder for chennai_flood_scenario.json & road_graph.json
└── images/                     # Role icons, emergency badges, UI illustrations
    └── .gitkeep                # Placeholder for high-contrast icons
```

### Detailed Purpose per Asset Directory:
- **`assets/tiles/`**: Stores sample bundled map tiles (`{z}/{x}/{y}.png` or sample vector PMTiles) for Chennai District (Ward 1 to Ward 12). This enables the app to launch and render interactive maps completely offline without violating the prohibition against bulk downloading from public OSM tile servers.
- **`assets/data/`**: Stores the static Chennai Flood Scenario seed data (12 wards, bridge R-14, 3 shelters, 3 hospitals, 21 units, 20 reports) and the road network adjacency graph (nodes and edges with penalty weights) used by the Dijkstra pathfinding isolate.
- **`assets/images/`**: Stores role-specific emblems (Citizen, Rescue, Hospital, Police/Fire, NGO), emergency marker pins, and high-contrast accessibility glyphs.

---

## 6. Internationalization (`l10n.yaml`) & Typography Configuration

Per Requirement R1 and R5, Poseidon supports multi-language operation across English (`en`), Tamil (`ta`), and Hindi (`hi`).

### 6.1 Manifest: `/home/saran/projects/the one/app/l10n.yaml`
The Worker must generate `app/l10n.yaml`:

```yaml
arb-dir: lib/l10n
template-arb-file: app_en.arb
output-localization-file: app_localizations.dart
untranslated-messages-file: lib/l10n/untranslated.json
synthetic-package: true
```

### 6.2 ARB Template Directory: `app/lib/l10n/`
The Worker must create the directory `app/lib/l10n/` and initialize three baseline ARB files:

#### 1. `app/lib/l10n/app_en.arb` (English - Template)
```json
{
  "@@locale": "en",
  "appTitle": "Poseidon",
  "@appTitle": {
    "description": "Application title"
  },
  "emergencyDisclaimer": "This app supports emergency services; call your local emergency number for immediate danger.",
  "@emergencyDisclaimer": {
    "description": "Mandatory safety disclaimer"
  },
  "statusSavedOnPhone": "Saved on phone",
  "@statusSavedOnPhone": {
    "description": "Honest UI: report saved locally"
  },
  "statusSentToServer": "Sent to server",
  "@statusSentToServer": {
    "description": "Honest UI: report delivered to server"
  },
  "statusReceivedByControl": "Received by control room",
  "@statusReceivedByControl": {
    "description": "Honest UI: report acknowledged by operators"
  },
  "roleCitizen": "Citizen",
  "roleRescue": "Rescue Team",
  "roleHospital": "Hospital",
  "rolePoliceFire": "Police & Fire",
  "roleNgo": "NGO / Shelter"
}
```

#### 2. `app/lib/l10n/app_ta.arb` (Tamil)
```json
{
  "@@locale": "ta",
  "appTitle": "போஸிடான்",
  "emergencyDisclaimer": "இந்த செயலி அவசர சேவைகளுக்கு உதவுகிறது; உடனடி ஆபத்திற்கு அவசர எண்ணை அழைக்கவும்.",
  "statusSavedOnPhone": "தொலைபேசியில் சேமிக்கப்பட்டது",
  "statusSentToServer": "சேவையகத்திற்கு அனுப்பப்பட்டது",
  "statusReceivedByControl": "கட்டுப்பாட்டு அறையால் பெறப்பட்டது",
  "roleCitizen": "பொதுமக்கள்",
  "roleRescue": "மீட்புக் குழு",
  "roleHospital": "மருத்துவமனை",
  "rolePoliceFire": "காவல் & தீயணைப்பு",
  "roleNgo": "தன்னார்வ அமைப்பு"
}
```

#### 3. `app/lib/l10n/app_hi.arb` (Hindi)
```json
{
  "@@locale": "hi",
  "appTitle": "पोसाइडन",
  "emergencyDisclaimer": "यह ऐप आपातकालीन सेवाओं का समर्थन करता है; तत्काल खतरे के लिए अपने स्थानीय आपातकालीन नंबर पर कॉल करें।",
  "statusSavedOnPhone": "फ़ोन पर सहेजा गया",
  "statusSentToServer": "सर्वर को भेजा गया",
  "statusReceivedByControl": "नियंत्रण कक्ष द्वारा प्राप्त",
  "roleCitizen": "नागरिक",
  "roleRescue": "बचाव दल",
  "roleHospital": "अस्पताल",
  "rolePoliceFire": "पुलिस और अग्निशमन",
  "roleNgo": "गैर सरकारी संगठन"
}
```

---

## 7. Step-by-Step Worker Execution Guide

The Worker should execute the following deterministic procedure to complete the manifest, asset, and dependency bootstrapping phase:

### Step 1: Pre-Condition Check
Verify that the Flutter SDK is installed and reachable in the environment:
```bash
export PATH="/home/saran/flutter/bin:$PATH"
which flutter
flutter --version
dart --version
```

### Step 2: Establish Asset & Localization Directory Structure
Create the required directory hierarchy inside `/home/saran/projects/the one/app`:
```bash
cd "/home/saran/projects/the one/app"

mkdir -p assets/tiles
mkdir -p assets/data
mkdir -p assets/images
mkdir -p lib/l10n

touch assets/tiles/.gitkeep
touch assets/data/.gitkeep
touch assets/images/.gitkeep
```

### Step 3: Author Configuration Files
Write:
1. `app/pubspec.yaml` (from Section 3)
2. `app/l10n.yaml` (from Section 6.1)
3. `app/lib/l10n/app_en.arb`, `app/lib/l10n/app_ta.arb`, `app/lib/l10n/app_hi.arb` (from Section 6.2)

### Step 4: Resolve Dependencies
Fetch packages and resolve transitive constraints:
```bash
cd "/home/saran/projects/the one/app"
flutter pub get
```
*Expected Outcome*: `Resolving dependencies... Got dependencies!` with exit code 0.

### Step 5: Execute Code Generation & Build Runner
Trigger Flutter l10n compilation and Drift/Dart code generation:
```bash
cd "/home/saran/projects/the one/app"

# Generate localization classes (AppLocalizations)
flutter gen-l10n

# Execute Drift and model builders (clean run)
dart run build_runner build --delete-conflicting-outputs
```
*Expected Outcome*: Successful build runner completion.

### Step 6: Verification & Quality Gate
Verify that static analysis passes and tests run cleanly:
```bash
cd "/home/saran/projects/the one/app"
flutter analyze
flutter test
```

---

## 8. Risk Mitigation & Troubleshooting Playbook

| Risk / Symptom | Root Cause | Remediation Command / Solution |
|---|---|---|
| `version solving failed: Because flutter_localizations from sdk depends on intl X.Y.Z and poseidon depends on intl A.B.C` | Version mismatch between pinned `intl` and the bundled Flutter SDK `intl`. | In `pubspec.yaml`, maintain `intl: any`. This allows `flutter_localizations` from the active SDK to choose the exact compatible version. |
| `hooks: user_defines: sqlite3` warning on older Flutter versions | Flutter SDK version earlier than Dart 3.4 / Flutter 3.22. | Ensure Flutter SDK is cloned from the latest `stable` branch (`git clone -b stable https://github.com/flutter/flutter.git`). |
| `build_runner` throws conflicting output error | Stale code generation artifacts in `.dart_tool/build`. | Run `dart run build_runner clean && dart run build_runner build --delete-conflicting-outputs`. |
| `Missing assets/tiles/ directory` during `flutter run` or `flutter test` | Asset directory listed in `pubspec.yaml` but missing on filesystem. | Create placeholder directories with `.gitkeep` as documented in Section 5. |
| Permission denied when running `flutter` commands | Executable bit not set or non-user path used. | All commands must execute within `/home/saran/flutter` and `/home/saran/projects/the one/app` without `sudo`. |
