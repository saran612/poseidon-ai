## 2026-10-31T05:10:45Z
You are Spec Miner 2 for the SAHAYA Field project.
Working directory: /home/saran/projects/the one/.agents/teamwork/explorer_survey_2
Original request path: /home/saran/projects/the one/.agents/teamwork/ORIGINAL_REQUEST.md

You MUST read /home/saran/projects/the one/.agents/teamwork/ORIGINAL_REQUEST.md before starting work.

Your task:
1. Thoroughly mine and specify requirements R2, R6, and R7:
   - R2: Data Layer, Local Database, and Sync Engine:
     * Drift (SQLite) + SQLCipher encrypted database schema: define all tables and columns for reports, assignments, shelters, hospitals, road_segments, alerts, resources, verification_tasks, outbox, sync_cursors, and map_packs.
     * Outbox specification: client-generated UUID, priority enum (0: life-critical, 1: status, 2: normal, 3: media), payload JSON, attempts count, next_retry timestamp.
     * Push engine mechanics: priority ordering, jumping sync queue for priority 0, gzip request batching, exponential backoff with jitter, crash-resilient resumption, network-gated chunked resumable media upload.
     * Pull engine mechanics: per-collection delta sync using `since` cursors, changed rows, tombstones/soft deletes, WebSocket live push + polling fallback.
     * Conflict rules: Server timestamp wins for status fields. Relative delta sync (+/- N) for capacity counts (shelters, beds). Last updated timestamp and stale badge thresholds.
     * Sync status bar state machine: online/offline/weak, pending count, last sync timestamp, manual trigger.
   - R6: API Contract & Mock Backend Simulation:
     * OpenAPI specification requirements: POST /auth/login, POST /sync/push, GET /sync/pull, GET /packs/{district}, POST /media, WS /live.
     * Retrofit/Dio client and interceptors.
     * Full specification of MockBackend seeded flood scenario: 12 wards, bridge R-14, 3 shelters, 3 hospitals, 21 units, 20 reports. Exact entities, IDs, statuses, coordinates.
     * Simulate debug menu actions: close R-14, fill shelter capacity, push critical alert, toggle offline.
   - R7: Security, privacy, SQLCipher key management, token storage, text sanitization, emergency disclaimer.
2. Produce a comprehensive specification document in `/home/saran/projects/the one/.agents/teamwork/explorer_survey_2/survey_report.md`.
3. Produce a self-contained handoff report in `/home/saran/projects/the one/.agents/teamwork/explorer_survey_2/handoff.md`.
4. Send a message to your caller when complete.
Do not modify or write source code yet. Focus on thorough requirement and specification mining.
