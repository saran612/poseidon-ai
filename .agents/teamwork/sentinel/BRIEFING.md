# BRIEFING — 2026-10-31T05:08:00Z

## Mission
Coordinate and oversee SAHAYA Field project execution via Project Orchestrator (teamwork_orchestrator).

## 🔒 My Identity
- Archetype: sentinel
- Working directory: /home/saran/projects/the one/.agents/teamwork/sentinel/
- Orchestrator: fa43b5d3-da89-446b-aee5-e61a8b1c7057
- Victory Auditor: [to be spawned on victory claim]

## 🔒 Key Constraints
- No technical decisions — relay only
- Victory Audit is MANDATORY before reporting completion
- Route: General -> teamwork_orchestrator
- Work autonomously: plan first, build phase by phase, commit after each phase
- flutter analyze and flutter test before every commit
- Offline-first: every screen works offline with local data
- UI honesty: distinct states for SOS/reports, no false arrival promises
- Source trust: server decides reliability tier
- Life-critical items jump sync queue
- Local DB: Drift (SQLite) with SQLCipher
- Dijkstra offline routing in Dart isolate
- MockBackend seeded with flood scenario
- Decisions recorded in DECISIONS.md

## User Context
- **Last user request**: Build Flutter app specifically in `/home/saran/projects/the one/app/` (relative `./app/`), renaming project to "poseidon".
- **Pending clarifications**: none
- **Delivered results**: [none]

## Project Status
- **Phase**: Milestone M1 (Environment, Tooling & Scaffolding)
- **Active Swarm**: M1 Worker 1 (SDK provisioning, app creation in ./app/, pubspec, architecture scaffolding)
- **Scope Doc**: /home/saran/projects/the one/PROJECT.md (40 features, M1-M6)

## Victory Audit Status
- **Triggered**: no
- **Verdict**: pending
- **Retry count**: 0

## Artifact Index
- /home/saran/projects/the one/.agents/teamwork/ORIGINAL_REQUEST.md — Approved task prompt
