import React, { useState } from 'react';
import {
  ShieldCheck,
  Layers,
  Scale,
} from 'lucide-react';
import type { EvidenceCluster, EvidenceItem } from '../types';

interface EvidenceTrustExplorerProps {
  clusters: EvidenceCluster[];
  evidence: EvidenceItem[];
}

export const EvidenceTrustExplorer: React.FC<EvidenceTrustExplorerProps> = ({
  clusters,
  evidence: _evidence,
}) => {
  const [selectedCluster, setSelectedCluster] = useState<EvidenceCluster | null>(clusters[0] || null);

  return (
    <div className="space-y-6">
      {/* 1. Architectural Header */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
          <div>
            <h2 className="font-bold text-sm text-[#172B4D] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              Evidence Trust Engine & Cryptographic Source Tiering
            </h2>
            <p className="text-xs text-[#64748B]">
              Deterministic trust evaluation calculated strictly from observed time, bounded replay counters, and cryptographic MAC.
            </p>
          </div>
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
            Deterministic Trust Model
          </span>
        </div>

        {/* 4 Source Tiers Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors">
            <div className="flex justify-between items-center text-[#64748B] text-[11px] font-medium">
              <span>T1: Field Officer</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-[#EFF6FF] text-[#2563EB] rounded font-mono font-bold">HMAC</span>
            </div>
            <div className="text-base font-extrabold text-[#2563EB] mt-1 font-mono">Base Trust: 0.90</div>
            <div className="text-[11px] text-[#475569] mt-1">HMAC-SHA256 Authenticated Field Commander</div>
            <div className="text-[10px] text-[#94A3B8] mt-1">Hardware token verified via Pre-shared Key</div>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors">
            <div className="flex justify-between items-center text-[#64748B] text-[11px] font-medium">
              <span>T2: Telemetry Sensor</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-[#F0FDF4] text-[#16A34A] rounded font-mono font-bold">LoRa</span>
            </div>
            <div className="text-base font-extrabold text-[#16A34A] mt-1 font-mono">Base Trust: 0.75</div>
            <div className="text-[11px] text-[#475569] mt-1">Noyyal River Hydrology Telemetry</div>
            <div className="text-[10px] text-[#94A3B8] mt-1">Periodic ultrasonic water level sensor reading</div>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors">
            <div className="flex justify-between items-center text-[#64748B] text-[11px] font-medium">
              <span>T3: Citizen Volunteer</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-[#FFFBEB] text-[#D97706] rounded font-mono font-bold">SMS/APP</span>
            </div>
            <div className="text-base font-extrabold text-[#D97706] mt-1 font-mono">Base Trust: 0.45</div>
            <div className="text-[11px] text-[#475569] mt-1">Pre-registered Resident Volunteer</div>
            <div className="text-[10px] text-[#94A3B8] mt-1">Known citizen with verified telephone credential</div>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors">
            <div className="flex justify-between items-center text-[#64748B] text-[11px] font-medium">
              <span>T4: Public / Unverified</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-[#FEF2F2] text-[#DC2626] rounded font-mono font-bold">RAW</span>
            </div>
            <div className="text-base font-extrabold text-[#DC2626] mt-1 font-mono">Base Trust: 0.20</div>
            <div className="text-[11px] text-[#475569] mt-1">Unauthenticated Public Telegram/SMS</div>
            <div className="text-[10px] text-[#94A3B8] mt-1">Requires multi-source spatial corroboration</div>
          </div>
        </div>
      </div>

      {/* 2. Independent Evidence Clusters & Trust Formula Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Evidence Clusters Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
            <div>
              <h3 className="font-bold text-sm text-[#172B4D] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#2563EB]" />
                Independent Evidence Clusters ({clusters.length})
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Spatial clustering within 500m radius aggregating support vs contradiction confidence.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {clusters.map(cl => {
              const isSelected = selectedCluster?.cluster_id === cl.cluster_id;
              return (
                <div
                  key={cl.cluster_id}
                  onClick={() => setSelectedCluster(cl)}
                  className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'ring-2 ring-[#2563EB] bg-[#EFF6FF] border-[#BFDBFE]'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-[#172B4D]">{cl.cluster_id}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#2563EB] border border-[#BFDBFE]">
                        {cl.incident_type}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        cl.status === 'VERIFIED'
                          ? 'bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]'
                          : cl.status === 'CORROBORATED'
                          ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                          : 'bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]'
                      }`}
                    >
                      {cl.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#475569] mt-2 pt-2 border-t border-[#E2E8F0]">
                    <div>
                      <span className="text-[#94A3B8] text-[10px]">Support (C_supp):</span>
                      <div className="font-mono font-bold text-[#16A34A]">{cl.c_support}</div>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] text-[10px]">Contra (C_contra):</span>
                      <div className="font-mono font-bold text-[#DC2626]">{cl.c_contra}</div>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] text-[10px]">Sources Count:</span>
                      <div className="font-mono font-bold text-[#172B4D]">
                        {cl.independent_sources_count} {cl.has_tier1_or_tier2 ? '(Includes T1/T2)' : ''}
                      </div>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] text-[10px]">Est. People:</span>
                      <div className="font-mono font-bold text-[#172B4D]">{cl.estimated_people}</div>
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] text-[#64748B] flex items-center justify-between font-mono">
                    <span>Centroid: {cl.centroid_lat.toFixed(4)}, {cl.centroid_lon.toFixed(4)}</span>
                    <span>Evidence Items: {cl.evidence_ids.join(', ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Mathematical Confidence Breakdown & Safety Principles */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
              <h3 className="font-bold text-sm text-[#172B4D] flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#2563EB]" />
                Confidence Breakdown
              </h3>
              <span className="text-[10px] font-mono text-[#94A3B8]">Engine v2.0</span>
            </div>

            {selectedCluster ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <div className="text-[10px] font-bold uppercase text-[#64748B] mb-1">
                    Mathematical Formulation:
                  </div>
                  <div className="font-mono text-[11px] text-[#2563EB] bg-white p-2 rounded border border-[#CBD5E1]">
                    C = BaseTier × Freshness × Rep × Spec - Penalty
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-white rounded border border-[#E2E8F0]">
                    <span className="text-[#475569]">Selected Cluster:</span>
                    <span className="font-mono font-bold text-[#172B4D]">{selectedCluster.cluster_id}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border border-[#E2E8F0]">
                    <span className="text-[#475569]">Support Confidence:</span>
                    <span className="font-mono font-bold text-[#16A34A]">{selectedCluster.c_support}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border border-[#E2E8F0]">
                    <span className="text-[#475569]">Contradiction Deduction:</span>
                    <span className="font-mono font-bold text-[#DC2626]">-{selectedCluster.c_contra}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded border border-[#E2E8F0]">
                    <span className="text-[#475569]">Verified Authority Present:</span>
                    <span className="font-bold text-[#172B4D]">
                      {selectedCluster.has_tier1_or_tier2 ? 'YES (T1/T2)' : 'NO (Public Only)'}
                    </span>
                  </div>
                </div>

                {/* Asymmetric Safety Banner */}
                <div className="p-3 bg-[#FEF2F2] rounded-lg border border-[#FCA5A5] text-[11px] text-[#991B1B] leading-relaxed">
                  <strong>Safety Threshold Invariant:</strong> Public claims alone are capped at C_support ≤ 0.60
                  and will NEVER achieve VERIFIED status without in-field T1 or T2 corroboration.
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-[#64748B] text-xs">
                Select a cluster on the left to inspect its trust calculation breakdown.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] mt-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-2">
              Freshness Half-Life Decay:
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-[#475569]">
              <div className="bg-[#F8FAFC] p-1.5 rounded border border-[#E2E8F0]">
                Water Level: <strong>30m</strong>
              </div>
              <div className="bg-[#F8FAFC] p-1.5 rounded border border-[#E2E8F0]">
                Casualty / SOS: <strong>60m</strong>
              </div>
              <div className="bg-[#F8FAFC] p-1.5 rounded border border-[#E2E8F0]">
                Citizen SMS: <strong>120m</strong>
              </div>
              <div className="bg-[#F8FAFC] p-1.5 rounded border border-[#E2E8F0]">
                Road Cut: <strong>180m</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
