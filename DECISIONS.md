# Architecture & Development Decisions

## Skills Integration

- **`frontend-design`** (from `anthropics/skills`): Added to prevent generic AI templates and enforce deliberate visual hierarchy, purposeful typography, and responsive quality floors.
  - *Summary:* Guides deliberate visual identity, typography pairing, and anti-template layouts tailored to the subject matter.
- **`web-design-guidelines`** (from `vercel-labs/agent-skills`): Added to ensure interface compliance with accessibility standards and modern UX interaction patterns.
  - *Summary:* Audits UI components against 100+ web interface guidelines and reports findings in `file:line` format.
- **`shadcn`** (from `shadcn-ui/ui`): Added to standardize UI component architecture on shadcn/ui primitives and CLI workflows.
  - *Summary:* Automates component installation and enforces semantic token styling with Radix UI and Tailwind CSS.
- **`design-taste-frontend`** (from `Leonxlnx/taste-skill`): Added to enforce anti-slop art direction, typography variance, and browser-verified layout quality gates.
  - *Summary:* Provides 247-site art direction blueprints, anti-slop house rules, and an automated multi-viewport browser inspector.

## Dashboard Component Library Decisions

### 1. Libraries Chosen
- **`recharts`**: Selected for the primary charting suite (Line, Area, StackedArea, Bar, Donut, Scatter, Histogram, Radar) due to native React SVG composability and CSS variable color theme extraction.
- **`@tanstack/react-table`**: Chosen for `DataTable` to power sorting, filtering, row selection, column toggling, pagination, and row expansion with zero UI bloat.
- **`lucide-react`**: System icons for subtle Apple-like visual indicators and control buttons.

### 2. Design Token Choices
- **Aesthetic Direction**: Apple Human Interface Guidelines—restrained, calm, precise, and understated.
- **Palette**: Neutral background and card surfaces (`#ffffff`/`#f5f5f7` in light, `#000000`/`#1c1c1e` in dark) with a single System Blue accent (`#0071e3` light / `#0a84ff` dark). Semantic green, orange, and red reserved strictly for informative status badges.
- **Typography & Tabular Numerals**: SF Pro font stack with `tabular-nums` (`font-feature-settings: "tnum" 1, "cv02" 1`) applied to all data values, tables, and metric readouts.
- **Elevation & Surfaces**: Hairline borders (`border-border/80`) paired with subtle low-opacity shadows (`0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)`) and translucent backdrop blur (`backdrop-blur-md`) on headers and overlays.
- **Chart Palette**: Dynamically read from CSS variables (`--chart-1` through `--chart-6`), ensuring colorblind-safe, harmonious presentation across light and dark modes.

### 3. Skipped Components
- **Treemap, Sankey, Map, NetworkGraph**: Skipped from the charts suite. Recharts lacks native first-class support for hierarchical treemaps and sankey/network graphs without bundling heavy external D3 modules or specialized mapping engines (e.g. `d3-sankey`, `mapbox-gl`), which would violate the conservative dependency constraint.

## Milestone M1: Environment, Tooling & Architecture Decisions

### 1. Project Identity & Renaming to Poseidon
- **Decision**: In accordance with user guidance, the project is officially named **Poseidon** (formerly SAHAYA Field), with bundle ID `org.poseidon.poseidon` and package name `poseidon`.
- **Rationale**: Unifies the disaster response field companion branding across all mobile manifests, ARB localizations, and documentation.

### 2. Subdirectory Isolation (`app/`)
- **Decision**: The entire Flutter application codebase resides strictly in `/home/saran/projects/the one/app/`.
- **Rationale**: Isolates the mobile application from the pre-existing React 18 / Vite web dashboard located in `frontend/`. Guarantees zero namespace collisions, independent package dependency lockfiles (`pubspec.lock` vs `package-lock.json`), and clean build output segregation (`app/build/` vs `frontend/dist/`).

### 3. Native Database Encryption Architecture (`sqlite3mc`)
- **Decision**: Encryption is provided via Dart native build hooks utilizing `sqlite3mc` (SQLite3 Multiple Ciphers) configured in `pubspec.yaml` (`hooks: user_defines: sqlite3: source: sqlite3mc`), rejecting the legacy `sqlcipher_flutter_libs` package.
- **Rationale**: `sqlcipher_flutter_libs` is end-of-life and suffers from binary symbol conflicts and NDK build breaks on modern Flutter engines. `sqlite3mc` provides native SQLCipher 3 & 4 compatibility (AES-256 with HMAC-SHA512) directly through Dart build hooks. For headless unit testing (`flutter test`), in-memory SQLite executes cleanly without hardware keystore dependencies.

### 4. Headless Testing Framework (`mocktail`)
- **Decision**: Adopted `mocktail` for mock generation in headless test suites instead of `mockito`.
- **Rationale**: `mocktail` eliminates the need for `build_runner` code generation for mock classes, allowing instant, test-driven feedback and deterministic headless execution in CI and terminal environments.

### 5. 4-Tier Clean Architecture Boundary Enforcement
- **Decision**: Code is organized strictly into `core/`, `domain/`, `data/`, and `presentation/`.
- **Rationale**: `domain/` contains pure Dart business entities and repository contracts with zero framework dependencies. `data/` implements persistence, synchronization, and mock endpoints. `presentation/` manages UI state and role screens. `core/` contains cross-cutting primitives (theme, reachability, compact SMS encoders).

