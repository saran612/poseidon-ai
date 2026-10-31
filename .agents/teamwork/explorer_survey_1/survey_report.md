# SAHAYA Field — Environment, Tooling & Architecture Survey Report

**Agent**: `explorer_survey_1` (Environment & Architecture Survey)  
**Parent Agent**: `orchestrator` (`fa43b5d3-da89-446b-aee5-e61a8b1c7057`)  
**Working Directory**: `/home/saran/projects/the one/.agents/teamwork/explorer_survey_1`  
**Date**: October 31, 2026  
**Status**: COMPLETE  

---

## 1. Executive Summary & Host Environment Assessment

### 1.1 Host Environment Baseline
A comprehensive forensic inspection of the host machine (`/home/saran/projects/the one`) was conducted using terminal tools and environment introspection. The host environment baseline is as follows:

| Component | Status / Path | Version / Details |
|---|---|---|
| **Operating System** | Installed | Ubuntu 26.04.1 LTS (Resolute Raccoon), Linux Kernel x86_64 |
| **Java Development Kit** | Installed (`/usr/bin/java`) | OpenJDK 25.0.4.1 (build 25.0.4.1+1-1-26.04.4-Ubuntu) |
| **Version Control** | Installed (`/usr/bin/git`) | Git version 2.43+ |
| **Build Essentials** | Installed (`/usr/bin/`) | `gcc`, `g++`, `make`, `curl`, `wget`, `tar`, `gzip`, `xz`, `unzip` |
| **Node.js Environment** | Installed (`/home/saran/.local/bin/node`) | Node.js v22.x LTS (with npm) |
| **Container Engine** | Installed (`/usr/bin/docker`) | Docker CLI present |
| **Web Browsers** | Installed (Snap) | Chromium 156.0.8078.47, Brave 1.98.62 |
| **Android SDK / NDK** | Not Installed | No `adb`, `sdkmanager`, or `ANDROID_HOME` configured |
| **Flutter SDK** | **Not Installed / Missing from PATH** | Command `which flutter` returned exit code 1 |
| **Dart SDK** | **Not Installed / Missing from PATH** | Command `which dart` returned exit code 1 |

### 1.2 Flutter & Dart SDK Diagnostic Findings
Verbatim tool execution outputs:
- `which flutter && flutter --version`: Exit code `1` (`flutter: command not found`)
- `which dart && dart --version`: Exit code `1` (`dart: command not found`)
- `flutter doctor`: Exit code `127` (`flutter doctor: command not found`)
- Filesystem search across `/home/saran`, `/usr/local`, `/opt`, `/snap`, and standard path hierarchies revealed no pre-cloned Flutter or Dart SDK binaries.

### 1.3 Recommended Flutter SDK Installation Strategy
Because the operational rules (`AGENTS.md`) permit dependency installations and development lifecycle execution in the workspace while prohibiting unauthorized `sudo` commands, the optimal and standard Flutter SDK installation method is a **user-space Git clone**. This method requires zero elevated permissions, avoids Snap confinement limitations, and provides direct access to the latest stable channel (`3.47.9` with Dart `3.13.7`):

```bash
# 1. Clone Flutter stable branch into user home directory
git clone -b stable https://github.com/flutter/flutter.git /home/saran/flutter

# 2. Add Flutter to user PATH in ~/.bashrc and active session
export PATH="/home/saran/flutter/bin:$PATH"
echo 'export PATH="$HOME/flutter/bin:$PATH"' >> ~/.bashrc

# 3. Pre-download development binaries and engines
flutter precache --no-ios

# 4. Verify installation
flutter doctor
flutter --version
dart --version
```

*Headless Execution Guarantee*: Flutter's static analyzer (`flutter analyze`) and unit test engine (`flutter test`) execute purely in Dart VM without requiring Android SDK, physical devices, or running emulators. This guarantees that all automated test gates, Drift schema migrations, Dijkstra routing benchmarks, and sync engine verifications can run headlessly and deterministically in CI and local terminal environments.

---

## 2. Workspace Directory Analysis & Layout Decisions

### 2.1 Current Directory Structure
Inspection of `/home/saran/projects/the one` reveals a hybrid project environment:
```
/home/saran/projects/the one/
├── .agents/                    # Agent metadata, teamwork directories, and custom skills
│   ├── skills/                 # design-taste-frontend
│   └── teamwork/               # orchestrator, explorers, interviewer, sentinel
├── .claude/                    # Claude CLI configuration
├── .git/                       # Git repository (Branch master, 0 commits)
├── .gitignore                  # Initial gitignore (ignores node_modules, dist, design/)
├── AGENTS.md                   # Autonomous development permissions & operational rules
├── CLAUDE.md                   # Project guidelines (tokens, shadcn, git commit guard)
├── DECISIONS.md                # Architecture & design decisions log
├── GEMINI.md                   # Operational guidelines & safety rules
├── design/                     # Design documentation
│   └── tokens.md               # Apple Human Interface System design tokens
├── frontend/                   # Pre-existing React 18 / Vite / Tailwind Web Dashboard
│   ├── package.json            # React, recharts, @tanstack/react-table, lucide-react
│   ├── src/                    # ComponentShowcase, ScratchDashboard, etc.
│   └── tailwind.config.js
└── skills-lock.json
```

### 2.2 Project Layout Dilemma & Trade-Off Analysis

| Layout Strategy | Description | Advantages | Disadvantages | Recommendation |
|---|---|---|---|---|
| **Option A: Root-Level Flutter App** | Initializing Flutter directly at `/home/saran/projects/the one` (`lib/`, `android/`, `ios/`, `pubspec.yaml` in root) | 1. Direct compatibility with `flutter analyze` and `flutter test` at root as mandated in `ORIGINAL_REQUEST.md`.<br>2. Seamless CI test execution. | 1. Mixes Flutter mobile code with React web `frontend/`.<br>2. Current folder name has spaces (`the one`), requiring explicit `--project-name sahaya_field`.<br>3. Root `.gitignore` must manage both stacks. | **Recommended with Clean Encapsulation** |
| **Option B: Subdirectory Flutter App** | Initializing Flutter in `/home/saran/projects/the one/sahaya_field/` or `mobile/` | 1. Strict isolation between mobile app and web frontend.<br>2. Zero name or configuration collisions. | 1. Every tool and build command requires subshell or `cd sahaya_field`.<br>2. Conflicts with root-level `flutter analyze` references unless root forwarding scripts are written. | Viable Alternative |

### 2.3 Concrete Initialization Command
To establish the Flutter project at the workspace root while respecting the directory name with spaces and preserving the existing React `frontend/` directory, the initialization command is:

```bash
cd "/home/saran/projects/the one"
flutter create \
  --project-name sahaya_field \
  --org org.sahaya \
  --platforms android,ios,web,linux \
  --empty \
  .
```

*Note on `--platforms`*:
- **Android**: Primary field deployment target (supporting background location, SMS fallback, notification full-screen intents).
- **iOS**: Compatible target with sandboxed constraints documented.
- **Web**: Enables instantaneous preview and UI demonstration via local browser (`Chromium`/`Brave`) without requiring Android emulators.
- **Linux**: Enables running native desktop binary for offline testing.

### 2.4 Unified `.gitignore` Strategy
The root `.gitignore` must be augmented to manage Flutter, Android, iOS, Dart, Node/Vite, and Agent Teamwork files cleanly:

```gitignore
# ==============================================================================
# SAHAYA Field & Workspace Unified .gitignore
# ==============================================================================

# Flutter / Dart Build Artifacts
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.packages
build/
*.lock.bak

# Android Build & Secret Artifacts
android/.gradle/
android/captures/
android/gradlew
android/gradlew.bat
android/local.properties
android/app/build/
android/app/*.keystore
android/app/*.jks
*.apk
*.aab

# iOS Build Artifacts
ios/.generated/
ios/Flutter/App.framework
ios/Flutter/Flutter.framework
ios/Flutter/Generated.xcconfig
ios/Flutter/app.flx
ios/Pods/
ios/.symlinks/
*.mode1v3
*.mode2v3
*.moved-aside
*.pbxuser
*.perspectivev3

# Node / Web Frontend
node_modules/
frontend/node_modules/
dist/
frontend/dist/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment & Credentials
.env
.env.local
.env.*.local
*.key
*.pem
credentials*.json

# OS & Editor
.DS_Store
.idea/
.vscode/
*.swp
*.bak

# Agent Workspaces (Keep metadata, ignore large ephemeral build caches)
# Keep .agents/teamwork trackable for audit trails
!.agents/teamwork/
```

---

## 3. External Dependency Architecture & Compatibility Matrix

All external package versions have been retrieved directly from the live `pub.dev` package repository and evaluated for compatibility against Flutter 3.x / Dart 3.x.

### 3.1 Recommended `pubspec.yaml` Specification

```yaml
name: sahaya_field
description: "SAHAYA Field — Offline-First Disaster Response Field Companion"
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
  uuid: ^4.6.0

  # --------------------------------------------------------------------------
  # 2. Networking, REST Client & WebSockets (R2, R6)
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
  # 6. Presentation, State Management & Utilities (R1)
  # --------------------------------------------------------------------------
  provider: ^6.1.5+1
  shared_preferences: ^2.5.6
  intl: ^0.20.3
  archive: ^4.5.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^6.0.0
  build_runner: ^2.17.1
  drift_dev: ^2.35.2
  mocktail: ^1.0.5

# ----------------------------------------------------------------------------
# Build Hooks & Native Ciphers Configuration (Modern SQLCipher encryption)
# ----------------------------------------------------------------------------
hooks:
  user_defines:
    sqlite3:
      source: sqlite3mc

flutter:
  uses-material-design: true
  generate: true

  assets:
    - assets/tiles/
    - assets/sample_data/
    - assets/icons/
```

### 3.2 Deep-Dive Architectural Compatibility Analysis

#### A. Drift Database & SQLCipher Encryption Mechanism
- **The Modern Standard**: In modern Drift (`>=2.30.0`) and `sqlite3` (`>=3.0.0`), the legacy third-party binary wrapper `sqlcipher_flutter_libs` is officially **deprecated and end-of-life (EOL)**.
- **The Solution**: Native encrypted SQLite is achieved via Dart build hooks using **`sqlite3mc`** (SQLite3 Multiple Ciphers). `sqlite3mc` natively supports the SQLCipher 3 and 4 encryption algorithms (AES-256 with HMAC-SHA512/SHA1).
- **Configuration**:
  Adding the hook declaration in `pubspec.yaml`:
  ```yaml
  hooks:
    user_defines:
      sqlite3:
        source: sqlite3mc
  ```
- **Connection Code (`app_database.dart`)**:
  ```dart
  import 'dart:io';
  import 'package:drift/drift.dart';
  import 'package:drift/native.dart';
  import 'package:path_provider/path_provider.dart';
  import 'package:path/path.dart' as p;

  LazyDatabase openEncryptedConnection(String encryptionPassphrase) {
    return LazyDatabase(() async {
      final dbFolder = await getApplicationDocumentsDirectory();
      final file = File(p.join(dbFolder.path, 'sahaya_field.sqlite'));

      return NativeDatabase.createInBackground(
        file,
        setup: (rawDb) {
          // Pass the encryption key securely before any query executes
          rawDb.execute("PRAGMA key = '$encryptionPassphrase';");
          rawDb.execute("PRAGMA cipher_compatibility = 4;");
          rawDb.execute("PRAGMA journal_mode = WAL;");
          rawDb.execute("PRAGMA synchronous = NORMAL;");
        },
      );
    });
  }
  ```
- **Testing Advantage**: For automated unit tests (`flutter test`), the connection switches seamlessly to `NativeDatabase.memory()`, which runs instantaneously in headless environments without platform binary dependencies.

#### B. `flutter_map` (v8.3.2) & Offline Tile Providers
- `flutter_map` is 100% pure Dart, meaning it requires zero native Android or iOS view rendering hooks and compiles without platform friction across Android, iOS, Linux desktop, and Web.
- **Tile Providers**:
  1. **`AssetTileProvider`**: Used for bundled development sample tiles located in `assets/tiles/{z}/{x}/{y}.png`. Enables out-of-the-box map rendering without network calls.
  2. **`FileTileProvider`**: Used for dynamic district map packs downloaded in "Prepare Mode". Tiles are extracted into the local application documents directory (`/data/user/0/.../app_flutter/map_packs/chennai/{z}/{x}/{y}.png`) and loaded directly from disk.
- **Anti-Scraping Compliance**: Per requirement R4, bulk downloads from `tile.openstreetmap.org` are prohibited in code. The app strictly resolves tiles through local storage or a configurable self-hosted tile server endpoint.

#### C. Testing Stack: `mocktail` vs `mockito`
- **Choice**: `mocktail` (`^1.0.5`) is selected over `mockito`.
- **Rationale**:
  - `mockito` requires code generation (`@GenerateMocks([HttpClient, Database])`) and running `build_runner` prior to executing tests, causing significant build friction and potential build-runner invalidation bugs.
  - `mocktail` utilizes Dart's null-safety features without requiring any code generation. Mocks are declared cleanly as `class MockApiClient extends Mock implements ApiClient {}`, enabling instantaneous execution with `flutter test`.

---

## 4. Static Analysis, Quality Gates & Testing Toolchain

### 4.1 Strict Static Analysis Configuration (`analysis_options.yaml`)
To enforce zero errors and zero warnings (`flutter analyze`), the following `analysis_options.yaml` is specified:

```yaml
include: package:flutter_lints/flutter.yaml

analyzer:
  language:
    strict-casts: true
    strict-inference: true
    strict-raw-types: true
  errors:
    missing_required_param: error
    missing_return: error
    todo: ignore
    invalid_annotation_target: ignore

linter:
  rules:
    - always_declare_return_types
    - avoid_empty_else
    - avoid_relative_lib_imports
    - avoid_shadowing_type_parameters
    - avoid_types_as_parameter_names
    - avoid_unused_constructor_parameters
    - await_only_futures
    - camel_case_extensions
    - camel_case_types
    - cancel_subscriptions
    - close_sinks
    - curly_braces_in_flow_control_structures
    - empty_catches
    - file_names
    - hash_and_equals
    - no_duplicate_case_values
    - prefer_conditional_assignment
    - prefer_const_constructors
    - prefer_const_declarations
    - prefer_is_empty
    - prefer_is_not_empty
    - prefer_iterable_whereType
    - prefer_single_quotes
    - unawaited_futures
    - unnecessary_const
    - unnecessary_new
    - unnecessary_null_aware_assignments
    - unnecessary_nullable_for_final_variable_declarations
    - unnecessary_string_interpolations
    - use_build_context_synchronously
    - valid_regexps
```

### 4.2 Test Automation Architecture
The test suite is structured to independently verify every safety-critical algorithm and offline persistence mechanism:

```
test/
├── unit/
│   ├── sync/
│   │   ├── outbox_priority_queue_test.dart    # Tests priority jumping (0 vs 1,2,3)
│   │   ├── idempotency_uuid_test.dart         # Tests duplicate UUID handling
│   │   ├── delta_pull_cursor_test.dart        # Tests since-cursor & tombstones
│   │   └── exponential_backoff_test.dart      # Tests retry formula with jitter
│   ├── conflict/
│   │   ├── relative_delta_sync_test.dart      # Tests +/- N occupancy & bed math
│   │   └── server_timestamp_wins_test.dart    # Tests status conflict resolution
│   ├── routing/
│   │   ├── dijkstra_pathfinding_test.dart     # Tests route calculation & weights
│   │   ├── bridge_r14_closure_test.dart       # Tests dynamic rerouting around closed road
│   │   └── isolate_execution_test.dart        # Tests compute/isolate performance
│   ├── geofencing/
│   │   └── ray_casting_polygon_test.dart      # Tests Point-in-Polygon hazard detection
│   └── security/
│       ├── sqlcipher_encryption_test.dart     # Verifies encrypted PRAGMA key behavior
│       ├── token_storage_test.dart            # Tests secure storage read/write/wipe
│       └── text_sanitizer_test.dart           # Tests prevention of HTML injection
├── mocks/
│   ├── mock_repositories.dart
│   ├── mock_database.dart
│   └── mock_network_adapter.dart
└── widget/
    ├── sync_status_bar_test.dart              # Tests online/offline/weak indicators
    ├── ui_honesty_states_test.dart            # Tests "Saved on phone" -> "Sent" -> "Received"
    └── low_literacy_mode_test.dart            # Tests accessibility high-contrast UI
```

---

## 5. Clean Architecture Code Layout

The source code tree under `lib/` strictly separates domain rules from persistence and framework mechanics:

```
lib/
├── core/
│   ├── constants/
│   │   ├── api_endpoints.dart
│   │   ├── app_constants.dart
│   │   └── notification_channels.dart
│   ├── error/
│   │   ├── exceptions.dart
│   │   └── failures.dart
│   ├── network/
│   │   ├── api_client.dart                    # Dio HTTP client with retry interceptor
│   │   ├── reachability_probe.dart            # Normal, Data Saver, Offline detector
│   │   └── websocket_client.dart              # WS /live client with reconnect loop
│   ├── security/
│   │   ├── secure_key_storage.dart            # flutter_secure_storage wrapper
│   │   └── text_sanitizer.dart                # HTML/script injection sanitizer
│   ├── theme/
│   │   ├── app_colors.dart                    # Mapped from design/tokens.md
│   │   ├── app_typography.dart                # SF Pro / Tabular numbers
│   │   └── app_theme.dart                     # Material 3 light & dark themes
│   └── utils/
│       ├── geo_utils.dart                     # Distance & Ray-Casting Point-in-Polygon
│       └── logger.dart
├── data/
│   ├── local/
│   │   ├── app_database.dart                  # Drift SQLite database definition
│   │   ├── connection/
│   │   │   ├── native_connection.dart         # Encrypted SQLite connection
│   │   │   └── memory_connection.dart         # In-memory test connection
│   │   ├── daos/
│   │   │   ├── outbox_dao.dart                # Priority outbox CRUD & jumping
│   │   │   ├── reports_dao.dart
│   │   │   ├── assignments_dao.dart
│   │   │   ├── shelters_dao.dart
│   │   │   ├── hospitals_dao.dart
│   │   │   ├── road_segments_dao.dart
│   │   │   ├── alerts_dao.dart
│   │   │   └── sync_cursors_dao.dart
│   │   └── tables/
│   │       └── schema.dart                    # Drift table definitions (11 tables)
│   ├── models/
│   │   ├── outbox_item_model.dart
│   │   ├── report_model.dart
│   │   └── sync_payload_model.dart
│   ├── remote/
│   │   ├── mock_backend.dart                  # Chennai Flood seeded simulation engine
│   │   ├── mock_seed_data.dart                # 12 wards, bridge R-14, 3 shelters, etc.
│   │   └── sync_api_service.dart              # REST endpoints client
│   └── repositories/
│       ├── auth_repository_impl.dart
│       ├── report_repository_impl.dart
│       ├── routing_repository_impl.dart
│       └── sync_repository_impl.dart
├── domain/
│   ├── entities/
│   │   ├── alert_entity.dart
│   │   ├── assignment_entity.dart
│   │   ├── hospital_entity.dart
│   │   ├── outbox_item_entity.dart
│   │   ├── report_entity.dart
│   │   ├── road_segment_entity.dart
│   │   ├── shelter_entity.dart
│   │   └── user_role.dart                     # Citizen, Rescue, Hospital, Police, NGO
│   ├── repositories/
│   │   ├── i_auth_repository.dart
│   │   ├── i_report_repository.dart
│   │   ├── i_routing_repository.dart
│   │   └── i_sync_repository.dart
│   └── usecases/
│       ├── routing/
│       │   └── calculate_offline_route_usecase.dart  # Spawns Dart Isolate for Dijkstra
│       ├── sync/
│       │   ├── push_outbox_usecase.dart       # Priority ordering & gzip batching
│       │   ├── pull_delta_sync_usecase.dart   # Since cursors & tombstones
│       │   └── apply_relative_delta_usecase.dart # Commutative +/- N capacity updates
│       └── reports/
│           ├── submit_sos_usecase.dart        # Life-critical (Priority 0) queueing
│           └── submit_report_usecase.dart
├── presentation/
│   ├── common/
│   │   ├── emergency_disclaimer_banner.dart   # Persistent emergency banner
│   │   ├── honest_status_badge.dart           # Saved -> Sent -> Received badge
│   │   ├── map_view.dart                      # flutter_map local tile renderer
│   │   └── sync_status_bar.dart               # Connection state & pending outbox count
│   ├── providers/
│   │   ├── auth_provider.dart
│   │   ├── connectivity_provider.dart
│   │   ├── map_provider.dart
│   │   ├── routing_provider.dart
│   │   └── sync_provider.dart
│   ├── routes/
│   │   └── app_router.dart
│   └── screens/
│       ├── auth/
│       │   └── role_selection_login_screen.dart
│       ├── citizen/
│       │   ├── citizen_home_screen.dart
│       │   ├── one_tap_sos_dialog.dart
│       │   ├── incident_report_screen.dart
│       │   └── my_reports_screen.dart
│       ├── rescue/
│       │   ├── rescue_home_screen.dart
│       │   ├── task_detail_screen.dart
│       │   └── route_navigation_screen.dart
│       ├── hospital/
│       │   ├── hospital_home_screen.dart
│       │   └── bed_capacity_screen.dart       # Relative delta (+/- beds) interface
│       ├── police/
│       │   ├── police_home_screen.dart
│       │   └── road_closure_screen.dart       # Bridge R-14 closure trigger
│       ├── ngo/
│       │   ├── ngo_home_screen.dart
│       │   └── shelter_inventory_screen.dart  # Relative delta (+/- arrivals) interface
│       ├── shared/
│       │   ├── alerts_inbox_screen.dart
│       │   ├── prepare_mode_screen.dart       # District pack downloader
│       │   └── settings_screen.dart           # Low-literacy, data/battery saver
│       └── debug/
│           └── simulate_menu_screen.dart      # Close R-14, fill shelter, push alert
├── l10n/
│   ├── app_en.arb                             # English localization
│   ├── app_hi.arb                             # Hindi localization
│   └── app_ta.arb                             # Tamil localization
└── main.dart
```

---

## 6. Execution Runbook & Command Cheat-Sheet

### 6.1 SDK Installation (Pre-Build Setup)
Run these commands to provision the local Flutter environment:
```bash
git clone -b stable https://github.com/flutter/flutter.git /home/saran/flutter
export PATH="/home/saran/flutter/bin:$PATH"
echo 'export PATH="$HOME/flutter/bin:$PATH"' >> ~/.bashrc
flutter config --no-analytics
flutter doctor
```

### 6.2 Project Bootstrapping
```bash
cd "/home/saran/projects/the one"

# Initialize empty Flutter project at current directory
flutter create --project-name sahaya_field --org org.sahaya --platforms android,ios,web,linux --empty .

# Fetch all packages defined in pubspec.yaml
flutter pub get

# Execute Drift and model code generation
dart run build_runner build --delete-conflicting-outputs
```

### 6.3 Static Analysis & Quality Gate
```bash
# Check code formatting
dart format --output=none --set-exit-if-changed lib/ test/

# Run static analysis (zero warnings / zero errors requirement)
flutter analyze
```

### 6.4 Automated Test Suite Execution
```bash
# Execute full unit and widget test suite
flutter test --reporter expanded

# Run specific test subsets
flutter test test/unit/sync/
flutter test test/unit/routing/
flutter test test/unit/conflict/
flutter test test/unit/security/
```

### 6.5 Local Run & Demonstration
```bash
# Run web build preview on local Chromium browser
flutter run -d chrome --web-port 8080

# Or run on Linux desktop (if GTK headers are available)
flutter run -d linux
```

---

## 7. Synthesis & Architectural Alignment

By cross-referencing this Environment and Tooling Survey with **Spec Miner 2** (`explorer_survey_2/survey_report.md` - R2, R6, R7) and **Spec Miner 3** (`explorer_survey_3/survey_report.md` - R1, R3, R4, R5):

1. **Drift Schema Alignment**: The 11 database tables specified by Explorer 2 are directly accommodated in `lib/data/local/tables/schema.dart` using modern `sqlite3mc` build hooks.
2. **Offline Dijkstra Routing**: The Dart Isolate pathfinding over JSON road graphs specified by Explorer 3 avoids Bridge R-14 dynamically when a closure event is processed, running isolated from the UI thread inside `lib/domain/usecases/routing/calculate_offline_route_usecase.dart`.
3. **UI Honesty Contracts**: The three honest state badges ("Saved on phone", "Sent to server", "Received by control room") are cleanly standardized as a presentation component in `lib/presentation/common/honest_status_badge.dart`.
4. **Commutative Delta Sync**: Relative adjustments (+/- N arrivals/beds) are mapped directly to Drift outbox mutations and Commutative arithmetic operations, eliminating concurrency overwrites.
5. **Zero External Server Flight Mode**: The full Chennai Flood Scenario seed data specified in OpenAPI and MockBackend runs entirely within `lib/data/remote/mock_backend.dart`, enabling 100% offline flight mode testing across all 5 roles.
