# POSEIDON Command Dashboard — Architectural & Design Decisions

This document records key decisions made during the autonomous build of the POSEIDON Command Dashboard in accordance with specifications.

## 1. Stack & Framework Choices
- **Build Tool**: Vite 8 with `@vitejs/plugin-react` and TypeScript strict mode.
- **Styling**: Tailwind CSS v4 with custom CSS custom properties for enterprise light/dark palette, high-contrast WCAG AA indicators, status borders, and tokenized animations.
- **State Architecture**:
  - *Server State*: TanStack Query v5 with optimistic updates and direct WebSocket cache patching (`queryClient.setQueryData`) to avoid unnecessary network refetches.
  - *Live & UI State*: Zustand store (`useRealtimeStore`, `useAuthStore`, `useUiStore`) managing WebSocket connection lifecycle, replay timeline scrubber, sound/notification preferences, dispatch queue drawer open/close, and command palette.
- **Component Primitives**: Lightweight, robust headless/accessible components conforming to the shadcn/ui API pattern (Button, Card, Dialog, Sheet, Tabs, Table, Badge, Tooltip, Dropdown, Slider, Switch, Skeleton, Command palette) styled with Tailwind and `lucide-react` icons.
- **Maps**: `react-leaflet` with standard Leaflet CSS and fallback OpenStreetMap / CartoDB raster tiles configurable via `VITE_MAP_TILE_URL`.

## 2. Human-in-the-Loop Philosophy ("Humans Decide")
- No automated resource allocation or rerouting is executed without explicit Operator / Supervisor confirmation.
- Every proposed assignment is flagged as `Proposed` and lands in the persistent **Dispatch Queue Drawer** with a confirmation modal showing full attribution, risks, and alternatives.
- Re-plan diffs stemming from road closures or sensor updates highlight affected units only, preserving untouched assignments intact.

## 3. Reliability & Verifiability
- Every datum displays its 4-tier provenance badge:
  - **T1**: Official Government / Ground Field Teams (Reliability ~0.85 - 1.0)
  - **T2**: Automated IoT & River/Rain Sensors (Reliability ~0.70 - 0.90)
  - **T3**: Verified Public Crowdsourced Reports (Reliability ~0.40 - 0.70)
  - **T4**: Unverified Public / Social Media (Reliability < 0.40)
- Visual reliability bar (0.00 – 1.00) accompanies all cards and tables.
- Stale detection: records older than configured threshold (default 15 minutes) render an amber `Stale` indicator with one-click "Request Field Verification".
- Explainability: `<DecisionCard>` modal/drawer exposes the exact mathematical weights ($S, V, U, E, N$), counterfactual scenario ("What would change this"), alternatives considered, and safety/fairness constraints.

## 4. Real-time & Mock Simulation Engine
- Single WebSocket client with exponential backoff, jitter, heartbeat, and cursor resume (`since`).
- In `mock` mode (`VITE_API_MODE=mock`), a deterministic simulated event loop streams scenario updates (flood surge, river gauge threshold crossings, duplicate rumors, conflicting road reports, bridge closure on Adyar / Cooum River corridor) with playback speed controls (1x, 2x, 5x, Pause).
- Bridge closure event triggers an automated re-planning draft requiring operator review before dispatch.

## 5. Security & Internationalization
- Token storage strictly in-memory; mock auth supports predefined personas (Operator, Supervisor, Viewer).
- English, Tamil (தமிழ்), and Hindi (हिन्दी) localization dictionaries for critical UI strings and incident statuses.

## 6. Fix 1: i18n Resolution & Resource Completeness
- **Problem**: Raw translation keys (`nav.overview`, `nav.map`, etc.) were displayed in the sidebar because `i18n.ts` imported `initReactI18next` through a relative path that created a mismatched instance, causing `useTranslation` to fail finding the initialized i18next instance.
- **Resolution**:
  - Fixed `react-i18next` import to standard package resolution.
  - Added full navigation dictionary keys for English, Tamil (தமிழ்), and Hindi (हिन्दी) including `nav.dispatchQueue`.
  - Added dev-only `missingKeyHandler` to log any missing keys in the console.
  - Created unit test `src/tests/i18n.test.ts` verifying key resolution across en, ta, and hi.
