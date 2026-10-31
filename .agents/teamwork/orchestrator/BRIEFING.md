# BRIEFING — 2026-10-31T05:32:00Z

## Mission
Orchestrate end-to-end development of "Poseidon" (formerly SAHAYA Field), an offline-first Flutter application for disaster response in `/home/saran/projects/the one/app/`.

## 🔒 My Identity
- Archetype: teamwork_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: /home/saran/projects/the one/.agents/teamwork/orchestrator
- Original parent: sentinel (parent)
- Original parent conversation ID: 2060816e-3d7b-458c-8b90-c3f8ca2c17a2

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: /home/saran/projects/the one/PROJECT.md
1. **Decompose**: Survey requirements & environment via 3 parallel Explorers -> define Feature Inventory, Architecture, Milestones, Interface Contracts -> Record in PROJECT.md.
2. **Dispatch & Execute**:
   - Milestone M1: Environment, Tooling & Scaffolding (app/ directory).
   - Milestones M2-M5: Data Layer, Mock Backend, Maps/Routing, Role Screens.
   - Dual Track: E2E Testing Track with Test Writer.
   - Milestone M6: Final Milestone E2E Test Suite Pass (Tiers 1-4) & Adversarial Hardening (Tier 5).
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: Project Orchestrator cannot escalate — must redesign
4. **Succession**: at 16 spawns, write handoff.md, spawn successor
- **Work items**:
  1. Survey & Environment Mapping [done]
  2. Project Decomposition & PROJECT.md [done]
  3. Milestone M1: Environment, Tooling & Scaffolding [in-progress]
  4. Milestone M2: Data Layer & Sync Engine [pending]
  5. Milestone M3: API & MockBackend Simulation [pending]
  6. Milestone M4: Offline Maps & Dijkstra Routing [pending]
  7. Milestone M5: Role Screens & Emergency Utilities [pending]
  8. Milestone M6: 100% E2E Pass & Adversarial Hardening [pending]
- **Current phase**: 2 (Iteration Loop - Milestone M1)
- **Current focus**: Milestone M1 Worker execution (`4f57e2f3-5340-4302-9f3f-50114266ee5b`)

## 🔒 Key Constraints
- Dispatch-only orchestrator: NEVER write source code directly, NEVER run build/test commands directly.
- STRICTLY NO git commits without explicit instruction from the user (AGENTS.md / GEMINI.md).
- Project renamed to "poseidon"; codebase target directory: `/home/saran/projects/the one/app/`.
- Binary veto on integrity violations from teamwork_auditor.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh.
- Always include ORIGINAL_REQUEST.md path in every dispatch.

## Current Parent
- Conversation ID: 2060816e-3d7b-458c-8b90-c3f8ca2c17a2
- Updated: 2026-10-31T05:24:02Z

## Key Decisions Made
- Project renamed to "poseidon".
- Target Flutter directory set to `/home/saran/projects/the one/app/`.
- M1 Explorers delivered complete execution plans for SDK install, dependencies, and clean architecture.
- M1 Worker dispatched to provision Flutter SDK, initialize app, configure dependencies, and verify analysis & tests.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| explorer_survey_1 | teamwork_explorer | Environment & Tooling Survey | completed | c918a433-3f59-4020-b0bc-c22375c97772 |
| explorer_survey_2 | teamwork_spec_miner | Data Layer & Sync Engine Spec | completed | bd86eedf-8dc6-475f-a2e7-d22f0b572023 |
| explorer_survey_3 | teamwork_spec_miner | Role Screens, Maps & Routing Spec | completed | b91ed4f2-4d72-4373-83e1-c00c63c0d667 |
| m1_explorer_1 | teamwork_explorer | M1 Flutter SDK & App Init Plan | completed | 7d780613-7af1-4227-8b00-05c84689e042 |
| m1_explorer_2 | teamwork_explorer | M1 pubspec.yaml & Dependencies Plan | completed | de5ca406-cb91-42bc-8634-65fbd6449b65 |
| m1_explorer_3 | teamwork_explorer | M1 Scaffolding & Analysis Plan | completed | d9eca8ce-fc98-49fc-a135-50235fc08188 |
| m1_worker_1 | teamwork_worker | M1 SDK Provisioning, Scaffolding & Verif | in-progress | 4f57e2f3-5340-4302-9f3f-50114266ee5b |

## Succession Status
- Succession required: no
- Spawn count: 7 / 16
- Pending subagents: 4f57e2f3-5340-4302-9f3f-50114266ee5b
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: fa43b5d3-da89-446b-aee5-e61a8b1c7057/task-42
- Safety timer: fa43b5d3-da89-446b-aee5-e61a8b1c7057/task-203

## Artifact Index
- /home/saran/projects/the one/.agents/teamwork/ORIGINAL_REQUEST.md — Authoritative User Request
- /home/saran/projects/the one/.agents/teamwork/orchestrator/DISPATCH.md — Incoming Dispatch Record
- /home/saran/projects/the one/.agents/teamwork/orchestrator/progress.md — Progress and Liveness Heartbeat
- /home/saran/projects/the one/PROJECT.md — Global Project Specification & Feature Inventory
