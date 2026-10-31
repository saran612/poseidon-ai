## 2026-10-31T05:31:57Z
You are M1 Worker 1 (teamwork_worker) for Milestone M1 (Environment, Tooling & Scaffolding) of project Poseidon.
Working directory: /home/saran/projects/the one/.agents/teamwork/m1_worker_1
Original request path: /home/saran/projects/the one/.agents/teamwork/ORIGINAL_REQUEST.md
Scope document: /home/saran/projects/the one/PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

CRITICAL USER RULES (AGENTS.md & GEMINI.md):
- STRICTLY NO git commits without explicit instruction from the user. Do NOT run `git commit`.
- Do NOT use sudo. All installations must be user-space.

You MUST read /home/saran/projects/the one/.agents/teamwork/ORIGINAL_REQUEST.md before starting work.

Read the concrete plans prepared by the 3 Explorers:
- /home/saran/projects/the one/.agents/teamwork/m1_explorer_1/m1_plan.md (SDK install, symlinks, flutter create in app/)
- /home/saran/projects/the one/.agents/teamwork/m1_explorer_2/m1_plan.md (pubspec.yaml, sqlite3mc build hook, dependencies)
- /home/saran/projects/the one/.agents/teamwork/m1_explorer_3/m1_plan.md (Clean architecture scaffolding, analysis_options.yaml, smoke_test.dart)

Your Tasks:
1. Flutter SDK Setup:
   - Check if /home/saran/flutter exists. If not, clone stable Flutter: `git clone -b stable https://github.com/flutter/flutter.git /home/saran/flutter`.
   - Symlink binaries: `mkdir -p /home/saran/.local/bin && ln -sf /home/saran/flutter/bin/flutter /home/saran/.local/bin/flutter && ln -sf /home/saran/flutter/bin/dart /home/saran/.local/bin/dart`.
   - Append to ~/.bashrc if not already present.
   - Run `flutter precache --no-ios` and verify `flutter --version`.
2. App Project Initialization:
   - Create directory `/home/saran/projects/the one/app` if it doesn't exist.
   - Run `flutter create --project-name poseidon --org org.poseidon --platforms android,ios,linux,web --empty .` inside `app/`.
3. Dependencies & Build Configuration:
   - Configure `app/pubspec.yaml` with the complete dependency matrix from m1_plan.md: Drift SQLite, sqlite3mc build hook (`hooks: user_defines: sqlite3: source: sqlite3mc`), dio, flutter_map, latlong2, flutter_secure_storage, path_provider, uuid, intl, flutter_local_notifications, connectivity_plus, geolocator, web_socket_channel, shared_preferences, provider, mocktail, build_runner, drift_dev, flutter_lints.
   - Run `flutter pub get` in `app/`.
4. Clean Architecture Scaffolding & Initial Code:
   - Author `app/analysis_options.yaml` enforcing zero errors and zero warnings.
   - Create clean architecture directories under `app/lib/`: `core/`, `domain/`, `data/`, `presentation/`.
   - Implement `app/lib/main.dart` with Poseidon app entry point, high-contrast theme, emergency disclaimer banner, and initial navigation shell.
   - Create asset directory structure `app/assets/tiles/`, `app/assets/seeds/`, `app/assets/icons/`.
   - Implement initial headless test `app/test/smoke_test.dart` verifying app initialization and architecture primitives.
5. Project Governance:
   - Update root `.gitignore` to unified specification.
   - Update `/home/saran/projects/the one/DECISIONS.md` documenting M1 architectural decisions (renaming to Poseidon, app/ directory isolation, sqlite3mc native encryption, mocktail testing).
6. Verification:
   - Run `flutter analyze` inside `app/` — verify 0 errors, 0 warnings.
   - Run `flutter test` inside `app/` — verify all tests pass.
7. Document your work in `/home/saran/projects/the one/.agents/teamwork/m1_worker_1/report.md` and `/home/saran/projects/the one/.agents/teamwork/m1_worker_1/handoff.md`.
8. Send a message to caller when done.
