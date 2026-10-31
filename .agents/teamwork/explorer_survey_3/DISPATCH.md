## 2026-10-31T05:10:53Z
You are Spec Miner 3 for the SAHAYA Field project.
Working directory: /home/saran/projects/the one/.agents/teamwork/explorer_survey_3
Original request path: /home/saran/projects/the one/.agents/teamwork/ORIGINAL_REQUEST.md

You MUST read /home/saran/projects/the one/.agents/teamwork/ORIGINAL_REQUEST.md before starting work.

Your task:
1. Thoroughly mine and specify requirements R1, R3, R4, and R5:
   - R1: Role-Based Screens and Shared Features:
     * Citizen role screens & flows: One-tap SOS (people count, need type), Incident report (type, text, photo, location), Shelters & safe routes, Alerts, "My reports" (honest status).
     * Rescue team role screens & flows: Assigned tasks (Proposed/Approved/En route/Done), route + ETA, status updates, field reports with photo, GPS auto-tracking, verification tasks.
     * Hospital role screens: Bed status updates (free beds, ICU, trauma, diversion), incoming patient list.
     * Police & Fire role screens: Road closures/reopenings, incident notes, tasks, unit status.
     * NGO / Shelter manager role screens: Occupancy tracking (arrivals/departures), inventory stocks (food, water, medicine), resource requests & lists.
     * Shared features: Interactive map, alerts inbox, sync status bar, language switch (English, Tamil, Hindi via ARB), large-button low-literacy mode, settings (data saver, battery saver).
     * UI Honesty contracts: Saved on phone vs Sent to server vs Received by control room; Proposed vs Approved; never claim help is coming; server-assigned reliability tiers.
   - R3: Connectivity Modes & Fallback:
     * Active reachability probe (Normal, Data Saver, Offline).
     * SOS fallback chain (HTTPS -> queued retry -> Android SMS compact encoding -> D2D stretch).
     * Prepare mode: one-button download of district pack, road graph, shelters, hospitals, alerts with size indicator and Wi-Fi toggle.
   - R4: Maps, GPS Tracking, Offline Routing:
     * flutter_map offline configuration (local vector/raster tiles, bundled sample pack).
     * Map layer architecture (incidents, units, shelters, hospitals, roads with reliability dashes, location, hazard polygons).
     * GPS foreground/background tracking logic, battery saver adaptive interval.
     * Offline Dijkstra routing in a Dart isolate: graph representation, penalty weights, closed road avoidance (bridge R-14), dynamic recomputation, stale data warning.
   - R5: Alerts & Notifications:
     * Notification channels (Critical with lock screen & ack sync, Warning, Info).
     * Offline geofencing: hazard polygon intersection detection.
     * Route & flow dispatch notifications.
2. Produce a comprehensive specification document in `/home/saran/projects/the one/.agents/teamwork/explorer_survey_3/survey_report.md`.
3. Produce a self-contained handoff report in `/home/saran/projects/the one/.agents/teamwork/explorer_survey_3/handoff.md`.
4. Send a message to your caller when complete.
Do not modify or write source code yet. Focus on thorough requirement and specification mining.
