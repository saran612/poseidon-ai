import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowUpDown,
  HelpCircle,
} from 'lucide-react';
import type { Zone } from '../types';

interface RiskPrioritizationMatrixProps {
  zones: Zone[];
}

export const RiskPrioritizationMatrix: React.FC<RiskPrioritizationMatrixProps> = ({
  zones,
}) => {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(zones[0] || null);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'rank' | 'score_expected' | 'score_upper' | 'confidence'>('rank');
  const [sortAsc, setSortAsc] = useState(true);

  // Filter & sort
  const filteredZones = zones
    .filter(z => severityFilter === 'ALL' || z.tier === severityFilter)
    .sort((a, b) => {
      const mult = sortAsc ? 1 : -1;
      return (a[sortField] > b[sortField] ? 1 : -1) * mult;
    });

  const handleSort = (field: 'rank' | 'score_expected' | 'score_upper' | 'confidence') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'rank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Weights Reference */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] mb-4">
          <div>
            <h2 className="font-bold text-sm text-[#172B4D] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2563EB]" />
              Dual-Interval Explainable Disaster Prioritization
            </h2>
            <p className="text-xs text-[#64748B]">
              Dual interval ranking: <code>score_expected</code> (verified threats) vs <code>score_upper</code> (potential upper bound with unverified claims).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-[#64748B] bg-[#F8FAFC] p-1.5 rounded-md border border-[#E2E8F0]">
            <span className="font-bold text-[#172B4D]">Weights:</span>
            <span>Life 0.35</span> · <span>Exposure 0.20</span> · <span>Vuln 0.20</span> · <span>Access 0.15</span> · <span>Trend 0.10</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-[#64748B]">Filter Tier:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'SAFE'].map(tier => (
            <button
              key={tier}
              onClick={() => setSeverityFilter(tier)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                severityFilter === tier
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:bg-slate-100 border border-[#E2E8F0]'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Sortable Prioritization Table & Explanation Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table View (Left 2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#E2E8F0] shadow-xs p-5">
          <div className="border border-[#E2E8F0] rounded-lg overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0] text-[11px]">
                <tr>
                  <th
                    onClick={() => handleSort('rank')}
                    className="py-2.5 px-3 cursor-pointer hover:text-[#172B4D]"
                  >
                    <div className="flex items-center gap-1">
                      Rank <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3">Zone Name</th>
                  <th className="py-2.5 px-3">Tier</th>
                  <th
                    onClick={() => handleSort('score_expected')}
                    className="py-2.5 px-3 cursor-pointer hover:text-[#172B4D]"
                  >
                    <div className="flex items-center gap-1">
                      Expected <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('score_upper')}
                    className="py-2.5 px-3 cursor-pointer hover:text-[#172B4D]"
                  >
                    <div className="flex items-center gap-1">
                      Upper Bound <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('confidence')}
                    className="py-2.5 px-3 cursor-pointer hover:text-[#172B4D]"
                  >
                    <div className="flex items-center gap-1">
                      Confidence <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3">Action Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredZones.map(z => {
                  const isSelected = selectedZone?.zone_id === z.zone_id;
                  return (
                    <tr
                      key={z.zone_id}
                      onClick={() => setSelectedZone(z)}
                      className={`hover:bg-[#F8FAFC] cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#EFF6FF]' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-[#2563EB]">#{z.rank}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#172B4D]">{z.name}</div>
                        <div className="text-[10px] text-[#94A3B8] font-mono">{z.zone_id}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            z.tier === 'CRITICAL'
                              ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]'
                              : z.tier === 'HIGH'
                              ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
                              : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]'
                          }`}
                        >
                          {z.tier}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#172B4D]">{z.score_expected}</td>
                      <td className="py-3 px-3 font-mono font-bold text-[#D97706]">
                        {z.score_upper > z.score_expected ? (
                          <span className="flex items-center gap-1">
                            {z.score_upper}
                            <span className="text-[9px] text-[#D97706] font-normal">(+{round(z.score_upper - z.score_expected, 2)})</span>
                          </span>
                        ) : (
                          z.score_upper
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#16A34A] font-bold">{z.confidence}</td>
                      <td className="py-3 px-3">
                        {z.verify_next ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF] tracking-wider animate-pulse">
                            VERIFY NEXT
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#94A3B8]">Stable</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Factor Breakdown & Counterfactual Drawer (Right Col) */}
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
              <h3 className="font-bold text-sm text-[#172B4D]">Factor Contribution & Counterfactual</h3>
              <span className="text-[10px] font-mono text-[#64748B]">
                {selectedZone ? selectedZone.zone_id : ''}
              </span>
            </div>

            {selectedZone ? (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="font-bold text-base text-[#172B4D]">{selectedZone.name}</div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">{selectedZone.evidence_summary}</p>
                </div>

                {/* Factor Contribution Bars */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-[#172B4D]">Factor Breakdown (0.0 to 1.0):</div>
                  {selectedZone.factor_breakdown &&
                    Object.entries(selectedZone.factor_breakdown).map(([key, val]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#64748B] capitalize">{key.replace('_', ' ')}</span>
                          <span className="font-mono font-bold text-[#172B4D]">{val}</span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#2563EB] h-full rounded-full"
                            style={{ width: `${Math.round(val * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>

                {/* Counterfactual Explanation */}
                <div className="p-3 bg-[#EFF6FF] rounded-lg border border-[#BFDBFE] text-xs">
                  <div className="font-bold text-[#1E40AF] flex items-center gap-1.5 mb-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Counterfactual Insight:
                  </div>
                  <p className="text-[11px] text-[#1E3A8A] leading-relaxed">
                    {selectedZone.what_would_change_this}
                  </p>
                </div>

                {/* Crucial Distinguish Notice */}
                <div className="p-2.5 bg-[#F8FAFC] rounded border border-[#E2E8F0] text-[10px] text-[#64748B] leading-relaxed">
                  <strong>Notice:</strong> Evidence Confidence (truth probability) is mathematically distinct from
                  Incident Priority (hazard severity). A low-confidence report of high casualties generates an upper-bound
                  interval trigger (<code>VERIFY NEXT</code>).
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-[#64748B] text-xs">
                Select a zone to inspect its multi-factor mathematical contribution.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function round(num: number, decimals: number) {
  return Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals);
}
