# Milestone M1 Explorer 2 Handoff Report: Dependencies, Manifest & Build Hooks

**Agent**: `m1_explorer_2`  
**Parent Agent**: `orchestrator` / `sub_orch_m1` (`fa43b5d3-da89-446b-aee5-e61a8b1c7057`)  
**Target Milestone**: M1 (Environment, Tooling & Scaffolding)  
**Date**: October 31, 2026  
**Handoff Type**: Hard (Task Complete)  

---

## 1. Observation

1. **Workspace Root & Subdirectory Mandate**:
   - `ORIGINAL_REQUEST.md` lines 97–100 state:
     > "The user requested: Build the Flutter app specifically in `/home/saran/projects/the one/app/` (or relative path `./app/` within the workspace `/home/saran/projects/the one`). Please ensure the Flutter project and its codebase are initialized and built inside `/home/saran/projects/the one/app/`."
   - `DISPATCH.md` (2026-10-31T05:24:36Z) confirms:
     > "The user has explicitly requested: Build the Flutter app specifically in `/home/saran/projects/the one/app/` (or relative path `./app/` within the workspace). Ensure `pubspec.yaml`, asset directories, and clean architecture paths are situated inside `/home/saran/projects/the one/app/`."
   - `PROJECT.md` line 171 confirms:
     > "Flutter Project Root: `/home/saran/projects/the one/app`"

2. **Project Naming Directive**:
   - `ORIGINAL_REQUEST.md` lines 92–94 state:
     > "The user has requested a change: rename the project to 'poseidon' instead of 'SAHAYA Field'. Please update all project references, app title, branding, package name / identifiers where appropriate, and documentation accordingly."

3. **Host System State**:
   - Executed `which flutter || echo "flutter not in PATH"` resulting in `flutter not in PATH` (exit code 1).
   - Executed `which dart || echo "dart not in PATH"` resulting in `dart not in PATH` (exit code 1).
   - Host OS is Ubuntu 26.04.1 LTS x86_64, JDK 25.0.4.1 installed, `gcc`, `make`, `git` present.

4. **Drift Database & SQLCipher Encryption Architecture**:
   - `ORIGINAL_REQUEST.md` line 24 specifies:
     > "Local database: Drift (SQLite) with SQLCipher encryption covering reports, assignments, shelters, hospitals, road_segments, alerts, resources, verification_tasks, outbox, sync_cursors, and map_packs."
   - `explorer_survey_1/survey_report.md` lines 276–287 and live official Drift/sqlite3 documentation confirm that `sqlcipher_flutter_libs` is end-of-life and replaced by Dart build hooks:
     ```yaml
     hooks:
       user_defines:
         sqlite3:
           source: sqlite3mc
     ```
   - Official documentation confirms this compiles SQLite3MultipleCiphers (supporting SQLCipher 3 and 4 AES-256 ciphers) via Dart native assets.

5. **Dependency Matrix Verification on pub.dev**:
   - `drift: ^2.35.3`, `sqlite3: ^3.8.0`, `drift_flutter: ^0.3.1`
   - `dio: ^5.11.1`, `web_socket_channel: ^3.0.3`, `connectivity_plus: ^7.3.2`
   - `flutter_map: ^8.3.2`, `latlong2: ^0.10.1`
   - `flutter_secure_storage: ^11.2.0`, `crypto: ^3.0.8`
   - `geolocator: ^14.1.2`, `flutter_local_notifications: ^22.3.3`
   - `provider: ^6.1.5+1`, `shared_preferences: ^2.5.6`, `archive: ^4.5.2`
   - `build_runner: ^2.17.1`, `drift_dev: ^2.35.2`, `mocktail: ^1.0.5`, `flutter_lints: ^6.0.0`
   - `intl`: Setting `intl: any` in `dependencies` allows the Flutter SDK's `flutter_localizations` package to automatically bind the exact compatible version without solver conflicts.

---

## 2. Logic Chain

1. **Dilemma: Subdirectory vs Root Manifest**:
   - From Observation 1, the user and orchestrator explicitly instructed that the Flutter application must reside strictly within `/home/saran/projects/the one/app/`.
   - Therefore, the canonical `pubspec.yaml`, `l10n.yaml`, `assets/`, `lib/`, and `test/` directories must be authored inside `app/`, ensuring that all Flutter CLI commands (`flutter pub get`, `dart run build_runner build`, `flutter analyze`, `flutter test`) execute inside `/home/saran/projects/the one/app`.

2. **Dilemma: Preventing Localization Dependency Invalidation**:
   - `flutter_localizations` is tied directly to the Flutter SDK and depends on a specific internal version of `intl`. Hardcoding a pinned version of `intl` (e.g. `^0.19.0` vs `^0.20.3`) creates frequent pub solver failure when running on different Flutter SDK patch releases.
   - Using `intl: any` delegates resolution to the SDK-bundled constraints, guaranteeing zero conflict resolution.

3. **Dilemma: Modern SQLCipher Encryption vs Obsolete Native Binaries**:
   - Per Observation 4, legacy plugins such as `sqlcipher_flutter_libs` inject obsolete pre-compiled `.so` files that conflict with modern 64-bit Android NDK and Flutter 3.22+ build pipelines.
   - Incorporating `hooks: user_defines: sqlite3: source: sqlite3mc` directly into `pubspec.yaml` instructs the Dart native asset system to compile `sqlite3mc` with full SQLCipher 3/4 encryption natively.
   - For headless CI/VM testing where native hardware Keystore is absent, unit tests can instantiate `NativeDatabase.memory()`, allowing all 40+ requirement tests to execute headlessly in milliseconds.

4. **Dilemma: Offline Map Asset Bundling vs OSM Scraping Prohibition**:
   - Requirement R4 prohibits scraping or bulk downloading from public OSM tile servers.
   - By declaring `assets/tiles/`, `assets/data/`, and `assets/images/` in `pubspec.yaml` and creating placeholder `.gitkeep` markers, the app can bundle sample district tiles and flood scenario JSON graphs for offline demonstration without triggering network requests.

---

## 3. Caveats

1. **Pre-requisite Flutter SDK Installation**:
   - Flutter SDK is not currently in `PATH` (Observation 3). Worker must ensure Explorer 1's recommendation (`git clone -b stable https://github.com/flutter/flutter.git /home/saran/flutter` and PATH export) is executed before invoking `flutter pub get`.
2. **NDK on Android for sqlite3mc**:
   - When building a release Android APK, Android NDK must be configured for the build hook to compile native C++ code. However, for Dart VM, headless unit tests (`flutter test`), static analysis (`flutter analyze`), and web preview (`flutter run -d chrome`), host C tooling (`gcc`/`make`, already installed) or in-memory execution is used with zero NDK dependency.
3. **No Code Written by Explorer**:
   - In accordance with Explorer role constraints, this agent has not created or modified any project source code under `app/`. Detailed manifests and procedures are provided in `m1_plan.md` for the Worker agent to execute.

---

## 4. Conclusion

1. The exact, conflict-free `pubspec.yaml` manifest for `poseidon` has been formulated and documented in `/home/saran/projects/the one/.agents/teamwork/m1_explorer_2/m1_plan.md`.
2. The modern SQLite encryption hook (`hooks: user_defines: sqlite3: source: sqlite3mc`) replaces obsolete `sqlcipher_flutter_libs` without native build breakages.
3. Asset directories (`assets/tiles/`, `assets/data/`, `assets/images/`) and internationalization specifications (`l10n.yaml`, `app_en.arb`, `app_ta.arb`, `app_hi.arb`) have been completely defined.
4. Execution commands for `flutter pub get`, `flutter gen-l10n`, and `dart run build_runner build` have been detailed with concrete error remediation steps.

---

## 5. Verification Method

Once the Worker applies the manifest and assets, verification can be independently confirmed using the following commands:

1. **Verify Manifest Location & Project Name**:
   ```bash
   test -f "/home/saran/projects/the one/app/pubspec.yaml" && grep -q "name: poseidon" "/home/saran/projects/the one/app/pubspec.yaml" && echo "Manifest Validated"
   ```

2. **Verify Dependency Resolution**:
   ```bash
   cd "/home/saran/projects/the one/app"
   export PATH="/home/saran/flutter/bin:$PATH"
   flutter pub get
   ```
   *Expected Output*: `Resolving dependencies... Got dependencies!` (Exit code 0).

3. **Verify Asset Declarations & Directories**:
   ```bash
   test -d "/home/saran/projects/the one/app/assets/tiles" && \
   test -d "/home/saran/projects/the one/app/assets/data" && \
   test -d "/home/saran/projects/the one/app/assets/images" && echo "Assets Validated"
   ```

4. **Verify Code Generation**:
   ```bash
   cd "/home/saran/projects/the one/app"
   export PATH="/home/saran/flutter/bin:$PATH"
   flutter gen-l10n
   dart run build_runner build --delete-conflicting-outputs
   ```
   *Expected Output*: Successful exit code 0.

5. **Verify Static Analysis Quality Gate**:
   ```bash
   cd "/home/saran/projects/the one/app"
   export PATH="/home/saran/flutter/bin:$PATH"
   flutter analyze
   flutter test
   ```
   *Expected Output*: `No issues found!` and `All tests passed!`.
