from datetime import datetime, timezone
from typing import Dict, List, Optional

from poseidon.geospatial.corridor import COIMBATORE_ZONES, CANDIDATE_BRIDGES, CoimbatoreRoadNetwork
from poseidon.ingestion.envelope import SourceTier
from poseidon.ingestion.message_router import MessageRouter
from poseidon.ingestion.transports.wifi_simulator import WiFiSimulatorTransport
from poseidon.ingestion.transports.sms_simulator import SMSSimulatorTransport
from poseidon.ingestion.transports.lora_simulator import LoRaSimulatorTransport
from poseidon.optimization.allocator import DepotSupply, ReliefResourceOptimizer, ZoneDemand
from poseidon.replanning.replanner import CascadingReplanningEngine
from poseidon.situation.prioritization import DisasterPrioritizationEngine
from poseidon.trust.engine import EvidenceTrustEngine, EvaluatedEvidence, ClusterSummary, EvidenceStatus


class SystemState:
    """In-memory coordinator connecting ingestion transports, trust engine, geospatial road network, optimizer, and replanner."""

    def __init__(self):
        # Transports
        self.wifi_transport = WiFiSimulatorTransport()
        self.sms_transport = SMSSimulatorTransport()
        self.lora_transport = LoRaSimulatorTransport()

        # Ingestion Router
        self.router = MessageRouter()

        # Evidence Trust Engine
        self.trust_engine = EvidenceTrustEngine()
        self.evaluated_evidence: List[EvaluatedEvidence] = []
        self.active_clusters: List[ClusterSummary] = []

        # Geospatial & Prioritization
        self.road_network = CoimbatoreRoadNetwork()
        self.prioritization_engine = DisasterPrioritizationEngine(COIMBATORE_ZONES)
        self.road_closures: Dict[str, str] = {}  # segment_id -> reason

        # Optimization & Replanning
        self.optimizer = ReliefResourceOptimizer(fairness_theta=0.5, deadline_min=45.0)
        self.replanner = CascadingReplanningEngine(self.road_network, self.optimizer)

        # Baseline Depots & Resources
        self.depots: List[DepotSupply] = [
            DepotSupply("DEPOT_RS_PURAM", "RS Puram Emergency Depot", "BOAT", 10),
            DepotSupply("DEPOT_RS_PURAM", "RS Puram Emergency Depot", "MEDICAL_KIT", 150),
            DepotSupply("DEPOT_PEELAMEDU", "Peelamedu Central Depot", "BOAT", 8),
            DepotSupply("DEPOT_PEELAMEDU", "Peelamedu Central Depot", "MEDICAL_KIT", 200),
        ]

        # Seed pre-registered devices
        self._seed_registered_devices()

        # Seed baseline evidence and initial operational plan
        self._seed_initial_evidence()
        self._seed_initial_plan()

    def _seed_registered_devices(self):
        # Device 101: T1 Field Officer (Perur Command Unit)
        self.router.register_device(
            numeric_id=101,
            device_code="DEV-OFFICER-PERUR",
            role="T1",
            secret_key=b"poseidon-field-officer-key-32b!",
            owner_name="Inspector S. Murugan (NDRF/SDMA)",
        )
        self.trust_engine.set_reputation("DEV-OFFICER-PERUR", 1.15)

        # Device 202: T2 Noyyal Water Level Telemetry Sensor
        self.router.register_device(
            numeric_id=202,
            device_code="DEV-SENSOR-NOYYAL-01",
            role="T2",
            secret_key=b"poseidon-telemetry-sensor-key32b",
            owner_name="PWD River Hydrology Station",
        )
        self.trust_engine.set_reputation("DEV-SENSOR-NOYYAL-01", 1.05)

        # Device 303: T3 Authenticated Citizen Volunteer
        self.router.register_device(
            numeric_id=303,
            device_code="DEV-CITIZEN-UKKADAM",
            role="T3",
            secret_key=b"poseidon-citizen-volunteer-key32",
            owner_name="K. Arumugam (Resident Volunteer)",
        )
        self.trust_engine.set_reputation("DEV-CITIZEN-UKKADAM", 0.95)

    def _seed_initial_evidence(self):
        now = datetime.now(timezone.utc)
        ev1 = EvaluatedEvidence(
            evidence_id="ev-sdma-001",
            message_id="msg-perur-alert",
            source_tier=SourceTier.T1,
            base_tier=0.90,
            reputation=1.15,
            freshness=0.98,
            specificity=1.0,
            location_precision_m=10.0,
            confidence=0.92,
            status=EvidenceStatus.VERIFIED,
            observed_at=now,
            age_minutes=2.5,
            incident_type="WATER_LEVEL",
            latitude=10.9708,
            longitude=76.9152,
            people_affected=30,
            is_contradiction=False,
            details={"source": "Inspector S. Murugan (NDRF/SDMA)", "water_depth_m": 1.25},
        )
        ev2 = EvaluatedEvidence(
            evidence_id="ev-sensor-002",
            message_id="msg-selva-gauge",
            source_tier=SourceTier.T2,
            base_tier=0.75,
            reputation=1.05,
            freshness=0.95,
            specificity=1.0,
            location_precision_m=5.0,
            confidence=0.79,
            status=EvidenceStatus.VERIFIED,
            observed_at=now,
            age_minutes=5.0,
            incident_type="WATER_LEVEL",
            latitude=10.9880,
            longitude=76.9400,
            people_affected=0,
            is_contradiction=False,
            details={"source": "PWD Hydrology Gauge #01", "stage_level": "WARNING"},
        )
        ev3 = EvaluatedEvidence(
            evidence_id="ev-vol-003",
            message_id="msg-ukkadam-sos",
            source_tier=SourceTier.T3,
            base_tier=0.45,
            reputation=0.95,
            freshness=0.92,
            specificity=1.0,
            location_precision_m=50.0,
            confidence=0.46,
            status=EvidenceStatus.CORROBORATED,
            observed_at=now,
            age_minutes=8.0,
            incident_type="PEOPLE_TRAPPED",
            latitude=10.9915,
            longitude=76.9610,
            people_affected=12,
            is_contradiction=False,
            details={"source": "K. Arumugam (Resident Volunteer)", "condition": "High Priority"},
        )
        ev4 = EvaluatedEvidence(
            evidence_id="ev-crowd-004",
            message_id="msg-ondi-road",
            source_tier=SourceTier.T4,
            base_tier=0.20,
            reputation=1.00,
            freshness=0.90,
            specificity=0.8,
            location_precision_m=200.0,
            confidence=0.18,
            status=EvidenceStatus.UNVERIFIED,
            observed_at=now,
            age_minutes=12.0,
            incident_type="ROAD_STATUS",
            latitude=10.9940,
            longitude=77.0550,
            people_affected=0,
            is_contradiction=False,
            details={"source": "Unverified Public SMS", "issue": "Inundated bridge approach"},
        )
        self.evaluated_evidence = [ev1, ev2, ev3, ev4]
        self.active_clusters = self.trust_engine.cluster_and_evaluate(self.evaluated_evidence)

    def _seed_initial_plan(self):
        demands = [
            ZoneDemand("ZONE_PERUR", "Perur", "BOAT", 6, priority_score=0.88),
            ZoneDemand("ZONE_SELVAPURAM", "Selvapuram", "BOAT", 5, priority_score=0.75),
            ZoneDemand("ZONE_UKKADAM", "Ukkadam", "BOAT", 8, priority_score=0.82),
            ZoneDemand("ZONE_SINGANALLUR", "Singanallur", "BOAT", 6, priority_score=0.70),
            ZoneDemand("ZONE_ONDIPUDUR", "Ondipudur", "BOAT", 4, priority_score=0.60),
        ]
        self.replanner.create_initial_plan("PLAN-OPERATIONAL-01", self.depots, demands)

    def _seed_registered_devices(self):
        # Device 101: T1 Field Officer (Perur Command Unit)
        self.router.register_device(
            numeric_id=101,
            device_code="DEV-OFFICER-PERUR",
            role="T1",
            secret_key=b"poseidon-field-officer-key-32b!",
            owner_name="Inspector S. Murugan (NDRF/SDMA)",
        )
        self.trust_engine.set_reputation("DEV-OFFICER-PERUR", 1.15)

        # Device 202: T2 Noyyal Water Level Telemetry Sensor
        self.router.register_device(
            numeric_id=202,
            device_code="DEV-SENSOR-NOYYAL-01",
            role="T2",
            secret_key=b"poseidon-telemetry-sensor-key32b",
            owner_name="PWD River Hydrology Station",
        )
        self.trust_engine.set_reputation("DEV-SENSOR-NOYYAL-01", 1.05)

        # Device 303: T3 Authenticated Citizen Volunteer
        self.router.register_device(
            numeric_id=303,
            device_code="DEV-CITIZEN-UKKADAM",
            role="T3",
            secret_key=b"poseidon-citizen-volunteer-key32",
            owner_name="K. Arumugam (Resident Volunteer)",
        )
        self.trust_engine.set_reputation("DEV-CITIZEN-UKKADAM", 0.95)


# Global singleton instance
system_state = SystemState()


def get_system_state() -> SystemState:
    return system_state

