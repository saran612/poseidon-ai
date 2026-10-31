from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from backend.core.state import get_system_state
from backend.ingestion.transports.base import RawTransportPacket

router = APIRouter()
state = get_system_state()


class IngestPacketRequest(BaseModel):
    transport: str  # "WIFI", "SMS", "LORA"
    raw_payload_hex: str
    metadata: Dict[str, Any] = {}
    incident_type: str = "FLOOD_WATER_LEVEL"
    is_contradiction: bool = False


@router.get("/evidence")
async def list_evidence():
    return {
        "evidence_count": len(state.evaluated_evidence),
        "items": [
            {
                "evidence_id": e.evidence_id,
                "message_id": e.message_id,
                "incident_type": e.incident_type,
                "source_tier": e.source_tier.value,
                "base_tier": e.base_tier,
                "reputation": e.reputation,
                "freshness": round(e.freshness, 3),
                "specificity": round(e.specificity, 3),
                "confidence": round(e.confidence, 3),
                "status": e.status.value,
                "observed_at": e.observed_at.isoformat(),
                "age_minutes": round(e.age_minutes, 1),
                "latitude": e.latitude,
                "longitude": e.longitude,
                "people_affected": e.people_affected,
                "is_contradiction": e.is_contradiction,
            }
            for e in state.evaluated_evidence
        ],
    }


@router.get("/evidence/clusters")
async def list_clusters():
    return {
        "clusters_count": len(state.active_clusters),
        "clusters": [
            {
                "cluster_id": cl.cluster_id,
                "incident_type": cl.incident_type,
                "centroid_lat": round(cl.centroid_lat, 5),
                "centroid_lon": round(cl.centroid_lon, 5),
                "c_support": round(cl.c_support, 3),
                "c_contra": round(cl.c_contra, 3),
                "status": cl.status.value,
                "independent_sources_count": cl.independent_sources_count,
                "has_tier1_or_tier2": cl.has_tier1_or_tier2,
                "estimated_people": cl.estimated_people,
                "evidence_ids": [e.evidence_id for e in cl.evidence_items],
            }
            for cl in state.active_clusters
        ],
    }


@router.post("/evidence/ingest")
async def ingest_packet(req: IngestPacketRequest):
    try:
        raw_bytes = bytes.fromhex(req.raw_payload_hex)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid raw_payload_hex")

    pkt = RawTransportPacket(
        packet_id=f"pkt-{datetime.now(timezone.utc).timestamp()}",
        transport_name=req.transport.upper(),
        raw_payload_bytes=raw_bytes,
        received_at=datetime.now(timezone.utc),
        metadata=req.metadata,
    )

    env, is_dup, t_ingest_ms = await state.router.ingest_packet(pkt)
    ev = state.trust_engine.evaluate_envelope(
        env, incident_type=req.incident_type, is_contradiction=req.is_contradiction
    )

    if not is_dup:
        state.evaluated_evidence.append(ev)
        state.active_clusters = state.trust_engine.cluster_and_evaluate(state.evaluated_evidence)

    return {
        "message_id": env.message_id,
        "origin_id": env.origin_id,
        "is_transport_duplicate": is_dup,
        "source_tier": env.source_tier.value,
        "authentication_status": env.authentication_status.value,
        "confidence": round(ev.confidence, 3),
        "status": ev.status.value,
        "t_ingested_ms": round(t_ingest_ms, 2),
    }

