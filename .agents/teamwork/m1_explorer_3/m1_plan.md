# M1 Explorer 3: Clean Architecture, Static Analysis & Asset Infrastructure Plan

**Project**: Poseidon (formerly SAHAYA Field)  
**Milestone**: M1 (Environment, Tooling & Scaffolding)  
**Author**: M1 Explorer 3 (`m1_explorer_3`)  
**Workspace Directory**: `/home/saran/projects/the one`  
**Flutter Application Root**: `/home/saran/projects/the one/app`  
**Date**: October 31, 2026  
**Status**: COMPLETE / READY FOR WORKER IMPLEMENTATION  

---

## 1. Executive Summary & Architectural Scope

This specification defines the architectural scaffolding, static analysis enforcement, headless test harness, and offline asset hierarchy for the **Poseidon** Flutter mobile application, specifically situated in `/home/saran/projects/the one/app`.

As mandated by `ORIGINAL_REQUEST.md` and `PROJECT.md`:
1. **Target Subdirectory**: The entire Flutter project resides strictly in `/home/saran/projects/the one/app/`.
2. **Architecture**: 4-tier Clean Architecture (`core/`, `domain/`, `data/`, `presentation/`) enforcing the inward-pointing Dependency Rule.
3. **Static Quality Gate**: Zero-error and zero-warning `flutter analyze` compliance enforced through strict static type rules and Flutter lints.
4. **Autonomous Test Gate**: Headless automated testing via `flutter test` running purely within the Dart VM without requiring an Android SDK, emulator, or running device.
5. **Offline-First Asset Architecture**: Self-contained asset structure supporting local tile rendering, Chennai flood scenario seeds, road graph topology for Isolate Dijkstra routing, and vector/raster icons.

---

## 2. Clean Architecture Scaffolding Blueprint (`app/lib/`)

Dependencies strictly point inward: `presentation` and `data` depend on `domain`; `core` contains cross-cutting primitives; `domain` is pure Dart with zero external framework dependencies.

```
app/lib/
├── app.dart                                # MaterialApp configuration, theme, localization, root router
├── main.dart                               # Entry point, dependency injection initialization, runRootApp
├── core/                                   # Cross-cutting primitives & infrastructure
│   ├── constants/
│   │   ├── api_endpoints.dart              # REST & WS endpoint strings (/sync/push, /sync/pull, /live, etc.)
│   │   ├── app_constants.dart              # App name ("Poseidon"), default district ID, timeout durations
│   │   ├── notification_constants.dart     # Android notification channels (Critical, Warning, Info)
│   │   ├── priority_levels.dart            # P0 (Life-Critical), P1 (Status), P2 (Normal), P3 (Media)
│   │   └── storage_keys.dart               # FlutterSecureStorage & SharedPreferences key constants
│   ├── network/
│   │   ├── network_info.dart               # Network connectivity interface
│   │   └── reachability_probe.dart         # Tri-state reachability (Normal, DataSaver, Offline)
│   ├── security/
│   │   ├── secure_key_manager.dart         # SQLCipher AES-256 key generation & retrieval from secure storage
│   │   └── text_sanitizer.dart             # Untrusted text sanitizer (prevents script/HTML injection)
│   ├── theme/
│   │   ├── app_colors.dart                 # High-contrast disaster palette, emergency red, amber, green
│   │   ├── app_theme.dart                  # Material 3 light/dark ThemeData, low-literacy button styles
│   │   └── app_typography.dart             # System font stack with tabular numerals (tnum)
│   └── utils/
│       ├── distance_calculator.dart        # Haversine coordinate distance & bounding box math
│       ├── gsm_sms_encoder.dart            # 58-character compact GSM-7 encoder for Android SMS fallback
│       ├── logger.dart                     # Structured console logging wrapper
│       └── timestamp_formatter.dart        # UI timestamp formatting & staleness badge calculations
├── domain/                                 # Pure business logic (Enterprise Rules)
│   ├── entities/
│   │   ├── alert_entity.dart               # Emergency alert with severity, hazard polygon, ack status
│   │   ├── assignment_entity.dart          # Field unit task (Proposed/Approved/En route/Done, ETA)
│   │   ├── hospital_entity.dart            # Hospital facility (total beds, free beds, ICU, trauma, diversion)
│   │   ├── outbox_item_entity.dart         # Priority outbox item (UUID idempotency key, priority 0-3, payload)
│   │   ├── report_entity.dart              # Incident report (people count, need type, honest status)
│   │   ├── road_segment_entity.dart        # Road edge (passable, flooded passable, closed, reliability)
│   │   ├── shelter_entity.dart             # Shelter facility (capacity, occupancy, food/water stocks)
│   │   └── user_role.dart                  # Role enum: citizen, rescue, hospital, policeFire, ngo
│   ├── repositories/                       # Abstract contracts (Dependency Inversion Interfaces)
│   │   ├── i_alert_repository.dart
│   │   ├── i_auth_repository.dart
│   │   ├── i_capacity_repository.dart      # Commutative (+/- N) relative delta updates
│   │   ├── i_report_repository.dart
│   │   ├── i_routing_repository.dart       # Dijkstra route calculation contract
│   │   └── i_sync_repository.dart          # Priority outbox push and cursor delta pull contract
│   └── usecases/
│       ├── calculate_offline_route.dart    # Spawns Dijkstra in Dart Isolate, dynamic obstacle avoidance
│       ├── push_outbox_batch.dart          # Priority ordering (P0 jumps queue), gzip batching
│       ├── submit_incident_report.dart     # Citizen/rescue report creation into outbox
│       ├── submit_sos_alert.dart           # Life-critical P0 SOS enqueueing
│       └── update_capacity_delta.dart      # Commutative shelter/bed count adjustments
├── data/                                   # Concrete data access & implementation mechanisms
│   ├── api/
│   │   ├── api_service.dart                # Retrofit-style REST API interface
│   │   └── dio_client.dart                 # Dio setup with retry interceptor, auth header, gzip support
│   ├── database/
│   │   ├── app_database.dart               # Drift SQLite database definition with sqlite3mc encryption
│   │   └── tables/                         # Drift table schema definitions (11 required tables)
│   │       ├── alerts_table.dart
│   │       ├── assignments_table.dart
│   │       ├── hospitals_table.dart
│   │       ├── map_packs_table.dart
│   │       ├── outbox_table.dart
│   │       ├── reports_table.dart
│   │       ├── resources_table.dart
│   │       ├── road_segments_table.dart
│   │       ├── shelters_table.dart
│   │       ├── sync_cursors_table.dart
│   │       └── verification_tasks_table.dart
│   ├── mock/
│   │   ├── chennai_flood_seed.dart         # 12 wards, bridge R-14, 3 shelters, 3 hospitals, 21 units, 20 reports
│   │   └── mock_backend.dart               # Standalone simulated backend serving OpenAPI contract offline
│   ├── repositories/                       # Concrete repository implementations
│   │   ├── alert_repository_impl.dart
│   │   ├── auth_repository_impl.dart
│   │   ├── capacity_repository_impl.dart
│   │   ├── report_repository_impl.dart
│   │   ├── routing_repository_impl.dart
│   │   └── sync_repository_impl.dart
│   ├── routing/
│   │   ├── dijkstra_graph.dart             # In-memory graph nodes, edges, penalties, closed edge sets
│   │   ├── dijkstra_router.dart            # Shortest path algorithm implementation
│   │   └── isolate_routing_service.dart    # Isolate entry point executing Dijkstra off main UI thread
│   └── sync/
│       ├── conflict_resolver.dart          # Server timestamp wins for status; commutative deltas for capacity
│       ├── outbox_engine.dart              # Priority queue manager (P0 life-critical jump queue)
│       ├── pull_engine.dart                # Delta sync using `since` cursors and tombstones
│       └── push_engine.dart                # Gzip batching, exponential backoff with jitter
└── presentation/                           # User Interface, State Management & Screens
    ├── debug/
    │   └── simulation_debug_menu.dart      # Debug triggers: Close R-14, fill shelter, push alert, toggle offline
    ├── providers/                          # ChangeNotifier / State providers
    │   ├── auth_provider.dart              # Current active user role, login session, token
    │   ├── map_provider.dart               # Layer visibility, active routes, tile source
    │   ├── simulation_provider.dart        # Debug scenario triggers & offline mode mock state
    │   └── sync_provider.dart              # Connectivity state, pending outbox count, last sync time
    ├── roles/                              # Role-specific operational interfaces
    │   ├── citizen/
    │   │   ├── citizen_dashboard.dart      # One-tap SOS, incident report button, nearby shelters
    │   │   ├── incident_report_screen.dart # Report form (type, text, photo, GPS accuracy)
    │   │   ├── my_reports_screen.dart      # Honest status tracking ("Saved on phone", "Sent", "Received")
    │   │   └── one_tap_sos_dialog.dart     # Life-critical SOS modal with people count & need type
    │   ├── hospital/
    │   │   ├── bed_capacity_screen.dart    # Live relative delta (+/- beds) controls, ICU/trauma/diversion
    │   │   ├── hospital_dashboard.dart
    │   │   └── incoming_patients_screen.dart
    │   ├── ngo/
    │   │   ├── inventory_stocks_screen.dart # Food, water, medicine status tracking
    │   │   ├── ngo_dashboard.dart
    │   │   └── shelter_occupancy_screen.dart # Relative delta (+/- arrivals/departures)
    │   ├── police_fire/
    │   │   ├── incident_notes_screen.dart
    │   │   ├── police_fire_dashboard.dart
    │   │   ├── road_closures_screen.dart   # Bridge R-14 official closure trigger
    │   │   └── unit_status_screen.dart
    │   └── rescue/
    │       ├── assigned_tasks_screen.dart  # Task progression: Proposed -> Approved -> En route -> Done
    │       ├── rescue_dashboard.dart
    │       ├── route_navigation_screen.dart # Turn-by-turn route preview with stale data warning
    │       └── verification_task_screen.dart # "Check this bridge" field verification
    └── shared/                             # Common widgets shared across all roles
        ├── emergency_disclaimer_banner.dart # Persistent legal disclaimer banner
        ├── honest_status_badge.dart        # 3-state UI honesty badge ("Saved on phone" / "Sent" / "Received")
        ├── interactive_map_view.dart       # flutter_map widget with local tile layer & 8 visual overlay tiers
        ├── language_selector.dart          # English, Tamil (தமிழ்), Hindi (हिन्दी) switcher
        ├── low_literacy_button.dart        # High-contrast large touch targets with distinct icons
        └── sync_status_bar.dart            # Tri-state connectivity badge, pending outbox count, "Sync now"
```

### 2.1 Concrete M1 Skeleton Recommendations for Clean Architecture Files

To ensure that the initial project compile cleanly, passes `flutter analyze` with 0 warnings, and satisfies the clean architecture contracts:

1. **`lib/domain/entities/user_role.dart`**:
```dart
/// System roles supported in Poseidon field operations.
enum UserRole {
  citizen('Citizen'),
  rescue('Rescue Team'),
  hospital('Hospital Manager'),
  policeFire('Police & Fire Service'),
  ngo('NGO / Shelter Manager');

  const UserRole(this.displayName);
  final String displayName;
}
```

2. **`lib/core/constants/priority_levels.dart`**:
```dart
/// Outbox priority levels as specified in R2 requirements.
abstract final class PriorityLevels {
  /// Priority 0: Life-critical (SOS, official road closure, hospital diversion).
  /// Jumps the outbox queue immediately.
  static const int lifeCritical = 0;

  /// Priority 1: Operational status updates.
  static const int statusUpdate = 1;

  /// Priority 2: Normal incident reports & general traffic.
  static const int normal = 2;

  /// Priority 3: Media uploads (photos, attachments) - deferred on weak networks.
  static const int media = 3;
}
```

3. **`lib/core/constants/app_constants.dart`**:
```dart
/// Application-wide constants for Poseidon.
abstract final class AppConstants {
  static const String appName = 'Poseidon';
  static const String appTagline = 'Offline-First Disaster Response Field Companion';
  static const String defaultDistrict = 'chennai_adyar';
  static const String emergencyDisclaimer =
      'This app supports emergency services; call your local emergency number for immediate danger.';
  static const String demoObstacleBridgeId = 'bridge_r14';
}
```

4. **`lib/core/theme/app_colors.dart`**:
```dart
import 'package:flutter/material.dart';

/// High-contrast disaster response color palette.
abstract final class AppColors {
  // Brand & Background
  static const Color darkBackground = Color(0xFF121212);
  static const Color darkSurface = Color(0xFF1E1E1E);
  static const Color lightBackground = Color(0xFFF8F9FA);
  static const Color lightSurface = Color(0xFFFFFFFF);

  // Status & Severity
  static const Color emergencyRed = Color(0xFFFF3B30);
  static const Color warningAmber = Color(0xFFFF9500);
  static const Color safeGreen = Color(0xFF34C759);
  static const Color infoBlue = Color(0xFF007AFF);

  // Connectivity
  static const Color online = Color(0xFF34C759);
  static const Color dataSaver = Color(0xFFFF9500);
  static const Color offline = Color(0xFF8E8E93);
}
```

5. **`lib/presentation/shared/emergency_disclaimer_banner.dart`**:
```dart
import 'package:flutter/material.dart';
import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';

/// Persistent visible emergency disclaimer banner required by R7.
class EmergencyDisclaimerBanner extends StatelessWidget {
  const EmergencyDisclaimerBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: AppColors.emergencyRed,
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 6.0),
      child: const Text(
        AppConstants.emergencyDisclaimer,
        textAlign: TextAlign.center,
        style: TextStyle(
          color: Colors.white,
          fontSize: 11.0,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.2,
        ),
      ),
    );
  }
}
```

6. **`lib/app.dart` & `lib/main.dart`**:
```dart
// lib/app.dart
import 'package:flutter/material.dart';
import 'core/constants/app_constants.dart';
import 'core/theme/app_colors.dart';
import 'presentation/shared/emergency_disclaimer_banner.dart';

class PoseidonApp extends StatelessWidget {
  const PoseidonApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.infoBlue,
          brightness: Brightness.light,
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.infoBlue,
          brightness: Brightness.dark,
        ),
      ),
      themeMode: ThemeMode.system,
      home: const Scaffold(
        body: SafeArea(
          child: Column(
            children: [
              EmergencyDisclaimerBanner(),
              Expanded(
                child: Center(
                  child: Text(
                    '${AppConstants.appName} Field Ready',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## 3. Static Analysis Configuration (`app/analysis_options.yaml`)

To satisfy the Acceptance Criterion:
> "`flutter analyze` passes with zero errors and zero warnings."

The configuration combines `flutter_lints`, strict compiler analysis checks, and generated code exclusions.

### 3.1 Key Architectural Considerations for Static Analysis
- **Strict Casts & Inference**: Eliminates runtime type casting crashes by failing static analysis whenever implicit dynamic conversions occur.
- **Generated File Exclusion**: Drift (`build_runner`) generates `*.g.dart` files containing complex SQLite table companion mappings. Excluding `**/*.g.dart` and `**/*.freezed.dart` from the analyzer prevents external code generation patterns from failing `flutter analyze`.
- **Async Hygiene**: Requiring `unawaited_futures`, `await_only_futures`, and `cancel_subscriptions` prevents unhandled outbox stream leaks and unhandled async exceptions in the sync engine.

### 3.2 Exact Verbatim Content for `app/analysis_options.yaml`

```yaml
# Static analysis rules for Project Poseidon
# Located at: /home/saran/projects/the one/app/analysis_options.yaml

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

  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"
    - "build/**"
    - ".dart_tool/**"

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

---

## 4. Testing Configuration & Initial Headless Tests

### 4.1 Test Hierarchy Structure

```
app/test/
├── smoke_test.dart                         # Initial headless verification test (M1 gate)
├── unit/                                   # Domain & Data Layer isolated unit tests
│   ├── core/
│   │   ├── constants_test.dart             # Priority levels & constants validation
│   │   └── gsm_sms_encoder_test.dart       # 58-character GSM encoding validation
│   ├── sync/                               # M2 Sync engine tests
│   │   ├── outbox_priority_test.dart       # P0 jumping priority queue
│   │   └── conflict_resolver_test.dart     # Relative delta (+/- N) commutative math
│   └── routing/                            # M4 Dijkstra Isolate routing tests
│       └── dijkstra_test.dart              # Obstacle avoidance around bridge R-14
└── widget/                                 # UI & Presentation widget tests
    └── emergency_disclaimer_test.dart      # R7 Persistent disclaimer rendering test
```

### 4.2 Verbatim Content for `app/test/smoke_test.dart`

```dart
// app/test/smoke_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:poseidon/app.dart';
import 'package:poseidon/core/constants/app_constants.dart';
import 'package:poseidon/core/constants/priority_levels.dart';
import 'package:poseidon/domain/entities/user_role.dart';
import 'package:poseidon/presentation/shared/emergency_disclaimer_banner.dart';

void main() {
  group('M1 Baseline Smoke & Architecture Tests', () {
    testWidgets('PoseidonApp renders emergency disclaimer and title headlessly',
        (WidgetTester tester) async {
      // Build the app scaffold headlessly
      await tester.pumpWidget(const PoseidonApp());

      // Verify the persistent emergency disclaimer is rendered
      expect(find.byType(EmergencyDisclaimerBanner), findsOneWidget);
      expect(find.text(AppConstants.emergencyDisclaimer), findsOneWidget);

      // Verify the app title and status are rendered
      expect(find.text('${AppConstants.appName} Field Ready'), findsOneWidget);
    });

    test('Core Priority Levels are strictly ordered', () {
      expect(PriorityLevels.lifeCritical, equals(0));
      expect(PriorityLevels.statusUpdate, equals(1));
      expect(PriorityLevels.normal, equals(2));
      expect(PriorityLevels.media, equals(3));
      expect(PriorityLevels.lifeCritical < PriorityLevels.statusUpdate, isTrue);
    });

    test('All 5 Disaster Response Roles are defined with valid display names', () {
      expect(UserRole.values.length, equals(5));
      expect(UserRole.citizen.displayName, equals('Citizen'));
      expect(UserRole.rescue.displayName, equals('Rescue Team'));
      expect(UserRole.hospital.displayName, equals('Hospital Manager'));
      expect(UserRole.policeFire.displayName, equals('Police & Fire Service'));
      expect(UserRole.ngo.displayName, equals('NGO / Shelter Manager'));
    });
  });
}
```

### 4.3 Automated Verification Commands

To verify that the code passes all quality gates without requiring devices or emulators:

```bash
# 1. Navigate to Flutter app directory
cd "/home/saran/projects/the one/app"

# 2. Check formatting
dart format --output=none --set-exit-if-changed lib/ test/

# 3. Execute static analysis (Enforces 0 errors, 0 warnings)
flutter analyze

# 4. Execute automated headless test suite
flutter test --reporter expanded
```

---

## 5. Asset Structure Architecture (`app/assets/`)

### 5.1 Directory Layout Overview

```
app/assets/
├── tiles/                                  # Offline raster/vector map tile packs
│   ├── sample_pack/                        # Bundled minimal development tiles (Z11-Z14)
│   │   ├── 11/
│   │   ├── 12/
│   │   ├── 13/
│   │   └── 14/
│   └── README.md                           # Documentation on tile schema & offline storage
├── seeds/                                  # Seed datasets for MockBackend & simulation
│   ├── chennai_flood_scenario.json         # 12 wards, bridge R-14, 3 shelters, 3 hospitals, 21 units, 20 reports
│   ├── chennai_road_graph.json             # Road network topology (nodes, edges, weights, coordinates)
│   └── hazard_polygons.json                # GeoJSON flood inundation boundaries for geofencing
└── icons/                                  # Role markers, priority pins & status badges
    ├── roles/                              # citizen.png, rescue.png, hospital.png, police.png, ngo.png
    ├── pins/                               # pin_p0_sos.png, pin_p1_status.png, pin_p2_normal.png
    └── hazards/                            # flooded_road.png, bridge_closed.png, safe_shelter.png
```

### 5.2 Critical Flutter Pubspec Asset Declaration Rule

⚠️ **Important Flutter Gotcha**:
In Flutter, declaring a folder in `pubspec.yaml` (e.g. `- assets/tiles/`) does **NOT** recursively include nested subdirectories. If tiles are organized in `{z}/{x}/{y}.png` hierarchies, each subdirectory must be explicitly declared, OR the tiles must be stored as flat archives / PMTiles files.

To avoid asset resolution bugs:
1. **Development Sample Tiles**:
   Use a flat bundle archive or explicitly register zoom level folders in `pubspec.yaml`:
   ```yaml
   flutter:
     assets:
       - assets/tiles/
       - assets/tiles/sample_pack/
       - assets/seeds/
       - assets/icons/
       - assets/icons/roles/
       - assets/icons/pins/
       - assets/icons/hazards/
   ```
2. **Runtime Tile Storage (Prepare Mode)**:
   In production, downloaded district tile packs (R3, R4) are saved directly to the device's application document directory (`getApplicationDocumentsDirectory()`), where `flutter_map` loads them via `FileTileProvider` without requiring `pubspec.yaml` declarations.

### 5.3 Mock Seed Datasets Specification

#### A. `chennai_flood_scenario.json`
Contains the complete scenario seed defined in R6:
- **12 Wards**: Saidapet, Velachery, Kotturpuram, Adyar, Guindy, Mylapore, T. Nagar, Jafferkhanpet, Alandur, Madipakkam, Thoraipakkam, Perungudi.
- **Critical Obstacle**: Bridge R-14 (`edge_bridge_r14` - Maraimalai Adigal Bridge / Saidapet Bridge across Adyar River).
- **3 Shelters**:
  1. *Velachery Community Relief Center* (Capacity: 500, Occupants: 320)
  2. *Saidapet Government High School* (Capacity: 350, Occupants: 280)
  3. *Kotturpuram Community Hall* (Capacity: 400, Occupants: 150)
- **3 Hospitals**:
  1. *Adyar Cancer Institute* (Total Beds: 120, Free: 18, ICU: 4, Trauma: true, Diversion: false)
  2. *Saidapet Taluk Hospital* (Total Beds: 80, Free: 5, ICU: 0, Trauma: false, Diversion: false)
  3. *Apollo Speciality Hospital OMR* (Total Beds: 200, Free: 42, ICU: 12, Trauma: true, Diversion: false)
- **21 Units**: 8 Rescue Boats (RB-1 to RB-8), 5 Police Patrol Units, 4 Ambulances, 4 NDRF Disaster Teams.
- **20 Reports**: P0 life-critical SOS requests, elderly trapped on roofs, rising water reports, bridge damage.

#### B. `chennai_road_graph.json`
Structured for Dijkstra pathfinding in Dart Isolate:
```json
{
  "district": "chennai_adyar",
  "version": 1,
  "nodes": [
    { "id": "node_saidapet_junction", "lat": 13.0150, "lon": 80.2210, "name": "Saidapet Junction" },
    { "id": "node_adyar_gate", "lat": 13.0130, "lon": 80.2290, "name": "Maraimalai Adigal Bridge North" },
    { "id": "node_saidapet_south", "lat": 13.0080, "lon": 80.2280, "name": "Maraimalai Adigal Bridge South" },
    { "id": "node_guindy_bypass", "lat": 13.0070, "lon": 80.2130, "name": "Guindy Kathipara Bypass" },
    { "id": "node_kotturpuram_bridge", "lat": 13.0230, "lon": 80.2390, "name": "Kotturpuram Bridge" }
  ],
  "edges": [
    {
      "id": "edge_bridge_r14",
      "source": "node_adyar_gate",
      "target": "node_saidapet_south",
      "distance_meters": 450.0,
      "base_weight": 450.0,
      "status": "passable",
      "reliability_tier": "verified"
    },
    {
      "id": "edge_guindy_detour",
      "source": "node_saidapet_junction",
      "target": "node_guindy_bypass",
      "distance_meters": 1200.0,
      "base_weight": 1200.0,
      "status": "passable",
      "reliability_tier": "verified"
    }
  ]
}
```

#### C. `hazard_polygons.json`
GeoJSON polygon features defining flood zones along the Adyar river basin used by the Point-in-Polygon ray-casting geofencing algorithm.

---

## 6. Worker Action Plan & Step-by-Step Execution Sequence

When the Worker executes Milestone M1, they should follow this disciplined sequence:

```
[Step 1: Directory Tree Creation]
└── Create app/lib subdirectories:
    core/{constants,network,security,theme,utils}
    domain/{entities,repositories,usecases}
    data/{api,database/tables,mock,repositories,routing,sync}
    presentation/{debug,providers,roles/{citizen,hospital,ngo,police_fire,rescue},shared}
    test/{unit/core,widget}
    assets/{tiles/sample_pack,seeds,icons/{roles,pins,hazards}}

[Step 2: Scaffolding Skeleton Files]
└── Place valid Dart skeleton files for core entities, enums, constants, theme, and shared widgets.
    Ensure zero syntax errors, explicit type annotations, and const constructors.

[Step 3: Root App & Entry Point Setup]
└── Author app/lib/app.dart and app/lib/main.dart with PoseidonApp and EmergencyDisclaimerBanner.

[Step 4: Static Analysis Configuration]
└── Author app/analysis_options.yaml with strict flags, generated code exclusions, and lint rules.

[Step 5: Automated Smoke Test Setup]
└── Author app/test/smoke_test.dart verifying PoseidonApp, EmergencyDisclaimerBanner, and PriorityLevels.

[Step 6: Asset Setup]
└── Author seed JSON files in app/assets/seeds/ and declare asset folders in pubspec.yaml.

[Step 7: Verification Gate Execution]
└── Execute:
    cd "/home/saran/projects/the one/app"
    flutter analyze
    flutter test
    Verify: 0 errors, 0 warnings, all tests passed.
```

---

## 7. Synthesis & Alignment with Peer Explorers

- **Explorer 1 Alignment**: Explorer 1 configures the user-space Flutter SDK and executes `flutter create --project-name poseidon --org org.poseidon --platforms android,ios,linux,web --empty .` inside `/home/saran/projects/the one/app`. Our Clean Architecture scaffolding directly populates this created `app/lib/` tree.
- **Explorer 2 Alignment**: Explorer 2 crafts `app/pubspec.yaml` containing the required dependencies (Drift, Dio, flutter_map, provider, sqlite3mc build hooks). The asset paths declared in our Section 5 (`assets/tiles/`, `assets/seeds/`, `assets/icons/`) seamlessly integrate into Explorer 2's asset manifest.
- **Future Milestones Support**:
  - **M2**: 11 Drift tables map directly into `app/lib/data/database/tables/`.
  - **M3**: MockBackend and Chennai Flood Scenario map directly into `app/lib/data/mock/` and `app/assets/seeds/`.
  - **M4**: Dijkstra isolate pathfinding maps directly into `app/lib/data/routing/` using `chennai_road_graph.json`.
  - **M5**: The 5 role screens map directly into `app/lib/presentation/roles/`.
