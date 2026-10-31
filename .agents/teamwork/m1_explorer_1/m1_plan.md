# M1 Execution Plan: Environment, Tooling & Scaffolding

**Document ID**: `POSEIDON-M1-PLAN-EXPLORER-1`  
**Author**: M1 Explorer 1 (`m1_explorer_1`)  
**Target Milestone**: M1 (Environment, Tooling & Scaffolding)  
**Project Name**: `poseidon` (formerly SAHAYA Field)  
**Target Directory**: `/home/saran/projects/the one/app`  
**Date**: October 31, 2026  
**Status**: APPROVED / READY FOR WORKER EXECUTION  

---

## 1. Executive Summary & Objective

Milestone M1 establishes the foundational development environment, tooling, and scaffolding for **Project Poseidon** (offline-first disaster response field companion). 

This plan prescribes the exact, deterministic runbook for the Worker agent to execute the following core tasks:
1. **Flutter SDK User-Space Provisioning**: Clone Flutter stable SDK into user-space (`/home/saran/flutter`) without `sudo` or elevated permissions.
2. **Triple-Redundant PATH Architecture**: Configure PATH via `~/.bashrc`, active environment, and permanent symlinks into `/home/saran/.local/bin` to guarantee immediate availability across all non-interactive tool subshells.
3. **Precache & Verification**: Pre-download engine artifacts (`flutter precache --no-ios`) and verify SDK health with `flutter doctor`, `flutter --version`, and `dart --version`.
4. **Project Initialization in Subdirectory (`./app`)**: Scaffolding the Flutter application inside `/home/saran/projects/the one/app` under the project name `poseidon` (`--project-name poseidon --org org.poseidon --platforms android,ios,linux,web --empty .`).
5. **Workspace Coexistence**: Guarantee zero namespace collision and clean separation between the Flutter mobile application (`app/`) and the existing React 18 web dashboard (`frontend/`).
6. **Unified `.gitignore` Architecture**: Deploy a production-grade, consolidated root `.gitignore` protecting Flutter, Dart, Android, iOS, React/Vite, secrets, and agent metadata.
7. **Verification & Quality Gate**: Validate clean baseline static analysis (`flutter analyze` with 0 errors, 0 warnings) and headless test harness readiness.

---

## 2. Host Environment & Current State Analysis

A comprehensive forensic inspection of the host machine reveals the following:

| Attribute | State / Finding | Impact on M1 Execution |
|---|---|---|
| **OS / Kernel** | Ubuntu 26.04.1 LTS (x86_64) | Fully compatible with Flutter Linux engine |
| **User Privileges** | Non-root (`saran`) | Requires user-space installation (`/home/saran/flutter`); no `sudo` |
| **JDK Runtime** | OpenJDK 25.0.4.1 (`/usr/bin/java`) | Java runtime ready for Android build tools |
| **Build Tools** | `gcc`, `make`, `curl`, `git`, `unzip` present | All prerequisites for Flutter engine unpack present |
| **Subshell PATH** | `/home/saran/.local/bin` is in `$PATH` | Creating symlinks in `/home/saran/.local/bin` ensures persistent access across agent sessions |
| **Workspace Path** | `/home/saran/projects/the one` | Path contains space (`the one`); requires rigorous path quoting |
| **Subdirectory** | `/home/saran/projects/the one/app` | Does not exist yet; must be created cleanly |
| **Git Repository** | Initialized (Branch `master`, 0 commits) | Strict rule: **STRICTLY NO autonomous git commits** without user instruction |
| **Web Dashboard** | `/home/saran/projects/the one/frontend` | React 18 / Vite / Tailwind app; must be preserved untouched |

---

## 3. Phase 1: Flutter SDK User-Space Installation Runbook

### 3.1 Installation Strategy Rationale
- **Zero Sudo / User Space**: Installing to `/home/saran/flutter` operates strictly within the user's home directory, complying 100% with `AGENTS.md` and `GEMINI.md` security guardrails.
- **Git Clone Stable Branch**: Provides the official production-stable channel along with bundled Dart SDK.
- **Headless Execution Guarantee**: Flutter analyzer and unit test engines execute inside the Dart VM without requiring Android SDK, physical devices, or hardware emulators.

### 3.2 Exact Execution Commands for Worker

```bash
# ==============================================================================
# Step 1.1: Clone Flutter SDK into User Space (if not already present)
# ==============================================================================
if [ ! -d "/home/saran/flutter/.git" ]; then
  echo "Cloning Flutter stable SDK into /home/saran/flutter..."
  git clone -b stable https://github.com/flutter/flutter.git /home/saran/flutter
else
  echo "Flutter SDK directory already exists at /home/saran/flutter. Verifying git integrity..."
  cd /home/saran/flutter && git status -s
fi

# ==============================================================================
# Step 1.2: Triple-Redundant PATH Configuration
# ==============================================================================
# Layer 1: Symlink binaries into /home/saran/.local/bin (already in subshell PATH)
mkdir -p /home/saran/.local/bin
ln -sf /home/saran/flutter/bin/flutter /home/saran/.local/bin/flutter
ln -sf /home/saran/flutter/bin/dart /home/saran/.local/bin/dart

# Layer 2: Append to ~/.bashrc for future interactive terminal sessions
if ! grep -q "flutter/bin" /home/saran/.bashrc 2>/dev/null; then
  echo 'export PATH="$HOME/flutter/bin:$PATH"' >> /home/saran/.bashrc
  echo "Appended flutter PATH to ~/.bashrc"
fi

# Layer 3: Export in current execution context
export PATH="/home/saran/flutter/bin:$PATH"

# ==============================================================================
# Step 1.3: Disable Analytics & Precache Engine Artifacts
# ==============================================================================
# Disable analytics to prevent interactive prompts or telemetry overhead
flutter config --no-analytics

# Pre-download development binaries (skipping iOS since host is Linux)
flutter precache --no-ios

# ==============================================================================
# Step 1.4: Verify Installation
# ==============================================================================
flutter --version
dart --version
flutter doctor -v || true
```

*Note on `flutter doctor` exit code*: On headless Linux environments without Android SDK installed, `flutter doctor` may report missing Android licenses or Android Studio. This is expected and non-blocking for Milestone M1, as all static analysis (`flutter analyze`) and unit/widget tests (`flutter test`) run headlessly in the pure Dart VM.

---

## 4. Phase 2: Poseidon Scaffolding in `./app` Runbook

### 4.1 Specification Requirements
- **Directory**: `/home/saran/projects/the one/app`
- **Project Name**: `poseidon` (mandatory rename per user follow-up)
- **Organization**: `org.poseidon` (producing package identifier `org.poseidon.poseidon`)
- **Target Platforms**: `android`, `ios`, `linux`, `web`
  - *Android*: Primary field deployment target (background location, SMS fallback, notification channels).
  - *iOS*: Sandboxed field companion target.
  - *Linux*: Native desktop binary execution for offline test harnesses.
  - *Web*: Rapid visual demonstration via local browser (Chromium/Brave) without emulators.
- **Template**: `--empty` (produces minimal, clean baseline without sample counter app bloat).

### 4.2 Exact Execution Commands for Worker

```bash
# ==============================================================================
# Step 2.1: Create Target Directory
# ==============================================================================
mkdir -p "/home/saran/projects/the one/app"
cd "/home/saran/projects/the one/app"

# ==============================================================================
# Step 2.2: Initialize Flutter Project
# ==============================================================================
# Note: Ensure PATH is exported in session
export PATH="/home/saran/flutter/bin:/home/saran/.local/bin:$PATH"

flutter create \
  --project-name poseidon \
  --org org.poseidon \
  --platforms android,ios,linux,web \
  --empty \
  .
```

### 4.3 Workspace Coexistence Architecture

The repository at `/home/saran/projects/the one` houses both the mobile application and the web dashboard:

```
/home/saran/projects/the one/
├── .agents/                    # Agent metadata & teamwork audit trails
├── .claude/                    # Claude CLI configuration
├── .git/                       # Single root Git repository
├── .gitignore                  # Unified multi-stack .gitignore (Root)
├── AGENTS.md                   # Operational rules & safety guardrails
├── CLAUDE.md                   # Style & commit guidelines
├── DECISIONS.md                # Architecture & design decisions log
├── GEMINI.md                   # Operational guidelines & safety rules
├── PROJECT.md                  # Scope & milestone master specification
├── design/                     # Design documentation & Apple tokens (tokens.md)
│
├── app/                        # [NEW] Flutter Project Root (Poseidon Mobile App)
│   ├── .dart_tool/             # Flutter build & tool cache (ignored)
│   ├── android/                # Android native project wrapper
│   ├── ios/                    # iOS native project wrapper
│   ├── linux/                  # Linux native desktop wrapper
│   ├── web/                    # Flutter web runner wrapper
│   ├── lib/                    # Clean Architecture Dart source code
│   │   ├── main.dart           # App entrypoint
│   │   ├── core/               # Cross-cutting primitives (scaffolded)
│   │   ├── domain/             # Business entities & repository contracts (scaffolded)
│   │   ├── data/               # Database, sync, mock backend (scaffolded)
│   │   └── presentation/       # UI screens, providers, widgets (scaffolded)
│   ├── test/                   # Headless unit & widget test harnesses
│   │   └── smoke_test.dart     # Baseline headless test
│   ├── assets/                 # Bundled offline assets (tiles, seed JSON, icons)
│   ├── analysis_options.yaml   # Zero-error / zero-warning linter rules
│   └── pubspec.yaml            # Manifest with drift, dio, flutter_map, sqlite3mc
│
└── frontend/                   # Pre-existing React 18 / Vite / Tailwind Web Dashboard
    ├── package.json            # Web dashboard dependencies
    ├── src/                    # React UI components
    └── vite.config.ts          # Vite build config
```

**Coexistence Guarantees**:
1. **Zero Path Clashes**: All Flutter commands run in `app/`. All React commands run in `frontend/`.
2. **Build Isolation**: Flutter builds to `app/build/`; React builds to `frontend/dist/`.
3. **Independent Dependency Locks**: `app/pubspec.lock` (Dart) and `frontend/package-lock.json` (Node) remain completely segregated.

---

## 5. Phase 3: Unified `.gitignore` Architecture

The root `.gitignore` (`/home/saran/projects/the one/.gitignore`) must be updated to cleanly handle all stacks while preserving design tokens and agent teamwork audit trails.

### 5.1 Verbatim Replacement Content for `/home/saran/projects/the one/.gitignore`

```gitignore
# ==============================================================================
# Unified .gitignore — Project Poseidon Workspace
# Multi-stack: Flutter / Dart (app/), React / Vite (frontend/), Host OS & Agents
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Flutter & Dart Artifacts (app/)
# ------------------------------------------------------------------------------
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.packages
build/
app/build/
*.lock.bak

# ------------------------------------------------------------------------------
# 2. Android Native Build & Keystores (app/android/)
# ------------------------------------------------------------------------------
android/.gradle/
**/android/.gradle/
**/android/captures/
**/android/gradlew
**/android/gradlew.bat
**/android/local.properties
**/android/app/build/
**/android/app/*.keystore
**/android/app/*.jks
*.apk
*.aab

# ------------------------------------------------------------------------------
# 3. iOS Native Build Artifacts (app/ios/)
# ------------------------------------------------------------------------------
**/ios/.generated/
**/ios/Flutter/App.framework
**/ios/Flutter/Flutter.framework
**/ios/Flutter/Generated.xcconfig
**/ios/Flutter/app.flx
**/ios/Pods/
**/ios/.symlinks/
*.mode1v3
*.mode2v3
*.moved-aside
*.pbxuser
*.perspectivev3

# ------------------------------------------------------------------------------
# 4. Linux Desktop Build Artifacts (app/linux/)
# ------------------------------------------------------------------------------
**/linux/flutter/ephemeral/

# ------------------------------------------------------------------------------
# 5. Node.js & React Frontend (frontend/)
# ------------------------------------------------------------------------------
node_modules/
frontend/node_modules/
dist/
frontend/dist/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# ------------------------------------------------------------------------------
# 6. Environment Variables, Secrets & Private Keys
# ------------------------------------------------------------------------------
.env
.env.local
.env.*.local
*.key
*.pem
credentials*.json

# ------------------------------------------------------------------------------
# 7. Operating System & IDE Configurations
# ------------------------------------------------------------------------------
.DS_Store
.idea/
.vscode/
*.swp
*.bak
*~

# ------------------------------------------------------------------------------
# 8. Claude & Teamwork Agents
# ------------------------------------------------------------------------------
.claude/
# Allow tracking of agent teamwork audit metadata
!.agents/teamwork/
```

---

## 6. Phase 4: Integration with Peer Explorer Blueprints

The Worker must synthesize the deliverables from all three M1 Explorers in sequence:

1. **Explorer 1 Deliverables (This Document)**:
   - Provision Flutter SDK in `/home/saran/flutter`
   - Symlink to `/home/saran/.local/bin/` and update `~/.bashrc`
   - Precache and verify `flutter --version`
   - Initialize `app/` via `flutter create --project-name poseidon --org org.poseidon --platforms android,ios,linux,web --empty .`
   - Overwrite root `.gitignore` with the unified manifest above.

2. **Explorer 2 Deliverables (`m1_explorer_2/m1_plan.md`)**:
   - Write `/home/saran/projects/the one/app/pubspec.yaml` with the complete dependency matrix (Drift, Dio, flutter_map, sqlite3mc build hooks, mocktail, etc.).
   - Write `/home/saran/projects/the one/app/l10n.yaml` for ARB localization.
   - Run `cd "/home/saran/projects/the one/app" && flutter pub get`.

3. **Explorer 3 Deliverables (`m1_explorer_3/m1_plan.md`)**:
   - Create Clean Architecture directory tree under `app/lib/`:
     `core/`, `domain/`, `data/`, `presentation/`
   - Create asset hierarchy:
     `app/assets/tiles/`, `app/assets/seeds/`, `app/assets/icons/`
   - Write `/home/saran/projects/the one/app/analysis_options.yaml` (strict cast flags, code generation ignores, zero-warning lint rules).
   - Write `/home/saran/projects/the one/app/lib/main.dart` with `PoseidonApp` foundation.
   - Write `/home/saran/projects/the one/app/test/smoke_test.dart`.

---

## 7. Phase 5: Verification & Quality Gate Protocol

After completing Phases 1–4, the Worker must execute and log the following verification suite:

```bash
# Set environment
export PATH="/home/saran/flutter/bin:/home/saran/.local/bin:$PATH"
cd "/home/saran/projects/the one/app"

# 1. Dependency Resolution Check
flutter pub get

# 2. Static Analysis Quality Gate (MANDATORY: 0 errors, 0 warnings)
flutter analyze

# 3. Headless Test Suite Execution (MANDATORY: 100% pass)
flutter test --reporter expanded

# 4. Git Status Inspection (Verify no unwanted untracked artifacts)
cd "/home/saran/projects/the one"
git status
```

---

## 8. Safety Checks, Guardrails & Edge-Case Fallbacks

| Risk / Failure Mode | Root Cause | Automated Fallback / Guardrail |
|---|---|---|
| **Interrupted SDK Clone** | Network disconnect leaving partial `/home/saran/flutter` | Test for `/home/saran/flutter/bin/flutter`. If invalid, purge `rm -rf /home/saran/flutter` and re-clone cleanly. |
| **Subshell PATH Loss** | `run_command` executes in fresh shell without `~/.bashrc` | Symlink `flutter` and `dart` into `/home/saran/.local/bin` (already in subshell PATH), and prepend `export PATH="/home/saran/flutter/bin:$PATH"` in commands. |
| **Space in Workspace Path** | `/home/saran/projects/the one` has spaces | Always wrap all shell paths in double quotes: `"/home/saran/projects/the one/app"`. |
| **Incorrect Project Name** | Flutter infers name `the_one` or `app` from directory | Pass `--project-name poseidon` explicitly in `flutter create`. |
| **Non-Empty Target Dir** | Pre-existing files block `flutter create` | Create `app/` freshly: `mkdir -p "/home/saran/projects/the one/app"`. Verify it contains no files before running create. |
| **Unauthorized Git Commits** | Autonomous `git commit` violating user rule | **STRICTLY PROHIBITED**: The Worker must NEVER run `git commit`. Stage changes or check `git status`, but wait for explicit user prompt. |
| **Sudo Invocations** | Running `sudo apt ...` or elevated commands | Forbidden by user rules. The entire installation is 100% user-space git clone. |
| **Missing Android Licenses** | `flutter doctor` warning about Android SDK | Non-blocking. Headless Dart VM runs `flutter analyze` and `flutter test` without Android SDK. Document as benign. |

---

## 9. Step-by-Step Worker Execution Checklist

```markdown
- [ ] 1. Check if `/home/saran/flutter/bin/flutter` exists; if not, clone `git clone -b stable https://github.com/flutter/flutter.git /home/saran/flutter`.
- [ ] 2. Create symlinks in `/home/saran/.local/bin/` for `flutter` and `dart`.
- [ ] 3. Append `export PATH="$HOME/flutter/bin:$PATH"` to `~/.bashrc` (if not present).
- [ ] 4. Run `flutter config --no-analytics` and `flutter precache --no-ios`.
- [ ] 5. Run `flutter --version` and `dart --version` to verify SDK health.
- [ ] 6. Create `/home/saran/projects/the one/app` directory.
- [ ] 7. Run `flutter create --project-name poseidon --org org.poseidon --platforms android,ios,linux,web --empty .` inside `app/`.
- [ ] 8. Overwrite `/home/saran/projects/the one/.gitignore` with the unified multi-stack `.gitignore`.
- [ ] 9. Apply `pubspec.yaml` and `l10n.yaml` from `m1_explorer_2/m1_plan.md`.
- [ ] 10. Apply Clean Architecture scaffolding, `analysis_options.yaml`, `main.dart`, and `test/smoke_test.dart` from `m1_explorer_3/m1_plan.md`.
- [ ] 11. Run `flutter pub get` in `app/`.
- [ ] 12. Run `flutter analyze` in `app/` and verify ZERO errors and ZERO warnings.
- [ ] 13. Run `flutter test --reporter expanded` in `app/` and verify all tests pass.
- [ ] 14. Check `git status` at workspace root. Do NOT run `git commit`.
```
