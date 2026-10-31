# SAHAYA – AI Disaster Intelligence & Autonomous Relief Coordinator
## Complete Cyclone Arnab (October 2026) & Historical Disaster Dataset Package

### Overview
This repository contains the complete, consolidated, verified, and engineered disaster intelligence dataset package for **Cyclone Arnab (October 2026)**, along with historical cyclone, flood, and damage datasets for machine learning training.

### Folder Structure
- **`raw_data/`**: Original, unmodified downloads and feeds organized by source agency:
  - `IMD/`: Official RSMC Tropical Cyclone Advisories (PDFs and extracted texts).
  - `GDACS/`: 19 official GTS alert messages (JTWC Warnings 001-011 and IMD GMDSS bulletins).
  - `NOAA_IBTRACS/`: Complete official NOAA IBTrACS North Indian Ocean (NI) dataset (26.7 MB, 60,677 best-track records).
  - `APSDMA/`: Cyclone Watch web portal interface and data definitions.
  - `CWC/`: Hydrological flood forecasting portal archives.
  - `NDEM/` & `BHUVAN/`: National geoportal and space-based disaster mapping services.
  - `NDMA/`: SACHET national Common Alerting Protocol emergency warnings.
- **`processed_data/`**: 22 consolidated, validated, schema-compliant CSV files containing real-world extracted records.
- **`simulated_data/`**: Isolated synthetic test records for simulator demonstrations.
- **`reports/`**: Analytical quality assurance, collection statistics, and ML readiness reports.
- **`scripts/`**: Fully repeatable Python data collection, processing, and validation scripts.
- **`documentation/`**: Technical data dictionaries, source lineages, and engineering specifications.

### Data Authenticity & Lineage Standards
All records strictly preserve the following audit trail:
- `REAL`: Sourced directly from official meteorological observations and government publications.
- `PROVISIONAL`: Administrative departmental returns subject to post-disaster reconciliation.
- `DERIVED`: Algorithmic fusions and numerical hydrodynamic surge models.
- `SIMULATED`: Synthetic demonstration scenarios stored exclusively in `simulated_data/`.
