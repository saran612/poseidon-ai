# BRIEFING — 2026-10-31T05:19:00Z

## Mission
Thoroughly mine and document specification requirements for R2 (Data Layer, Local Database, Sync Engine), R6 (API Contract & Mock Backend Simulation), and R7 (Security, Privacy, Key Management) for the SAHAYA Field project.

## 🔒 My Identity
- Archetype: Specification Miner
- Roles: Teamwork specialist, Specification Miner
- Working directory: /home/saran/projects/the one/.agents/teamwork/explorer_survey_2
- Original parent: fa43b5d3-da89-446b-aee5-e61a8b1c7057
- Milestone: M1 - Requirements Mining & Architecture Specification

## 🔒 Key Constraints
- Do NOT modify or write source code yet (read-only investigation and specification).
- Adhere strictly to authoritative sources (ORIGINAL_REQUEST.md, project files, standards).
- Output tables: Features Discovered, Edge Cases.
- Produce comprehensive survey report: `/home/saran/projects/the one/.agents/teamwork/explorer_survey_2/survey_report.md`.
- Produce self-contained handoff report: `/home/saran/projects/the one/.agents/teamwork/explorer_survey_2/handoff.md`.
- Send message to caller upon completion.

## Current Parent
- Conversation ID: fa43b5d3-da89-446b-aee5-e61a8b1c7057
- Updated: 2026-10-31T05:19:00Z

## Task Summary
- **What to build**: Specification document covering R2 (Drift+SQLCipher schema, Outbox, Push/Pull sync engines, Conflict resolution, Sync status bar), R6 (OpenAPI spec, Retrofit/Dio client/interceptors, seeded flood scenario mock backend, debug simulation actions), and R7 (Security, privacy, key management, token storage, sanitization, disclaimer).
- **Success criteria**: Comprehensive, fully detailed survey report and handoff report with concrete schema definitions, API routes/schemas, mock scenario dataset details, security mechanisms, edge cases, and verification steps.
- **Interface contracts**: ORIGINAL_REQUEST.md
- **Code layout**: Metadata only in .agents/teamwork/explorer_survey_2/.

## Key Decisions Made
- Fully defined Drift (SQLite) + SQLCipher schema across 11 tables with explicit primary keys, foreign keys, and indexes.
- Specified 4-tier Outbox priority queue (0: life-critical, 1: status, 2: normal, 3: media) with queue-jumping event for priority 0.
- Established RFC 4122 v4 UUID client-side generation for idempotency and duplicate elimination.
- Defined commutative relative delta sync (+/- N) for capacity counts to prevent lost concurrent offline updates.
- Designed OpenAPI 3.1 contract and Retrofit/Dio interceptors (Auth, Gzip, Retry, MockBackend).
- Seeded Chennai Flood Zone scenario with exact geographical coordinates, statuses, and identifiers for 12 wards, bridge R-14, 3 shelters, 3 hospitals, 21 units, and 20 reports.
- Detailed 4 debug simulation actions (Close R-14, Fill shelter capacity, Push critical alert, Toggle offline state).
- Formalized security protocols: 256-bit AES SQLCipher hardware keystore storage, token lifecycle, RBAC, zero third-party telemetry, secure wipe on logout, untrusted text sanitization, and persistent 112 emergency disclaimer.

## Artifact Index
- /home/saran/projects/the one/.agents/teamwork/explorer_survey_2/DISPATCH.md
- /home/saran/projects/the one/.agents/teamwork/explorer_survey_2/BRIEFING.md
- /home/saran/projects/the one/.agents/teamwork/explorer_survey_2/progress.md
- /home/saran/projects/the one/.agents/teamwork/explorer_survey_2/survey_report.md
- /home/saran/projects/the one/.agents/teamwork/explorer_survey_2/handoff.md
