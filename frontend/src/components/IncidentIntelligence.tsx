import React, { useState } from 'react';
import {
  Search,
  Radio,
  FileText,
} from 'lucide-react';
import type { EvidenceItem } from '../types';

interface IncidentIntelligenceProps {
  evidence: EvidenceItem[];
  onSelectIncident?: (incident: EvidenceItem) => void;
}

export const IncidentIntelligence: React.FC<IncidentIntelligenceProps> = ({
  evidence,
  onSelectIncident: _onSelectIncident,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(null);

  // Filter logic
  const filteredEvidence = evidence.filter(item => {
    const matchesSearch =
      item.evidence_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.incident_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.details && JSON.stringify(item.details).toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || item.incident_type === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    const matchesTier = selectedTier === 'ALL' || item.source_tier === selectedTier;

    return matchesSearch && matchesCategory && matchesStatus && matchesTier;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]';
      case 'CORROBORATED':
        return 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]';
      case 'UNVERIFIED':
        return 'bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]';
      case 'DISPUTED':
        return 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]';
      case 'STALE':
        return 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]';
      case 'REJECTED':
        return 'bg-[#FEF2F2] text-[#991B1B] border-[#F87171]';
      default:
        return 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]';
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'T1':
        return 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]';
      case 'T2':
        return 'bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]';
      case 'T3':
        return 'bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]';
      case 'T4':
        return 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-xs p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0] mb-4">
        <div>
          <h2 className="font-bold text-sm text-[#172B4D] flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#2563EB]" />
            Incident Intelligence & Multi-Transport Telemetry Feed
          </h2>
          <p className="text-xs text-[#64748B]">
            Cryptographically verified, de-duplicated incidents originating from Field Officers, LoRa telemetry, GSM/SMS, and citizens.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-[#64748B]">
            Showing <strong>{filteredEvidence.length}</strong> of <strong>{evidence.length}</strong> reports
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 mb-4 text-xs">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incident ID or keyword..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:border-[#2563EB] text-xs"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-2.5 py-1.5 rounded-md border border-[#CBD5E1] bg-[#F8FAFC] text-xs text-[#172B4D] focus:outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="WATER_LEVEL">Water Level / Inundation</option>
          <option value="PEOPLE_TRAPPED">Casualty / People Trapped</option>
          <option value="ROAD_STATUS">Road & Bridge Status</option>
          <option value="GOVERNMENT_ALERT">Government Alert</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="px-2.5 py-1.5 rounded-md border border-[#CBD5E1] bg-[#F8FAFC] text-xs text-[#172B4D] focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="VERIFIED">Verified</option>
          <option value="CORROBORATED">Corroborated</option>
          <option value="UNVERIFIED">Unverified</option>
          <option value="DISPUTED">Disputed</option>
          <option value="STALE">Stale</option>
          <option value="REJECTED">Rejected</option>
        </select>

        {/* Source Tier Filter */}
        <select
          value={selectedTier}
          onChange={e => setSelectedTier(e.target.value)}
          className="px-2.5 py-1.5 rounded-md border border-[#CBD5E1] bg-[#F8FAFC] text-xs text-[#172B4D] focus:outline-none"
        >
          <option value="ALL">All Source Tiers</option>
          <option value="T1">T1: Field Officer (HMAC)</option>
          <option value="T2">T2: Telemetry Sensor (LoRa)</option>
          <option value="T3">T3: Citizen Volunteer</option>
          <option value="T4">T4: Public Crowdsourced</option>
        </select>
      </div>

      {/* Incident Table */}
      <div className="border border-[#E2E8F0] rounded-lg overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0] text-[11px]">
            <tr>
              <th className="py-2.5 px-3">Incident ID</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Location</th>
              <th className="py-2.5 px-3">Source Tier</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Confidence</th>
              <th className="py-2.5 px-3">People</th>
              <th className="py-2.5 px-3">Age</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {filteredEvidence.map(item => (
              <tr
                key={item.evidence_id}
                onClick={() => setSelectedItem(item)}
                className={`hover:bg-[#F8FAFC] cursor-pointer transition-colors ${
                  selectedItem?.evidence_id === item.evidence_id ? 'bg-[#EFF6FF]' : ''
                }`}
              >
                <td className="py-2.5 px-3 font-bold font-mono text-[#172B4D]">{item.evidence_id}</td>
                <td className="py-2.5 px-3 font-medium text-[#172B4D]">{item.incident_type}</td>
                <td className="py-2.5 px-3 text-[#64748B] font-mono text-[11px]">
                  {item.latitude && item.longitude ? `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}` : 'Corridor Sector'}
                </td>
                <td className="py-2.5 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTierBadge(item.source_tier)}`}>
                    {item.source_tier}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono font-bold text-[#172B4D]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          item.confidence >= 0.75
                            ? 'bg-[#16A34A]'
                            : item.confidence >= 0.45
                            ? 'bg-[#D97706]'
                            : 'bg-[#DC2626]'
                        }`}
                        style={{ width: `${Math.round(item.confidence * 100)}%` }}
                      />
                    </div>
                    <span>{item.confidence.toFixed(2)}</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 font-mono text-[#64748B]">
                  {item.people_affected > 0 ? (
                    <span className="font-bold text-[#DC2626]">{item.people_affected} in distress</span>
                  ) : (
                    'None'
                  )}
                </td>
                <td className="py-2.5 px-3 text-[#94A3B8] font-mono text-[11px]">{item.age_minutes}m ago</td>
                <td className="py-2.5 px-3 text-right">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedItem(item);
                    }}
                    className="text-[#2563EB] hover:underline font-medium text-[11px]"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Incident Details Drawer */}
      {selectedItem && (
        <div className="mt-4 p-4 bg-[#F8FAFC] rounded-lg border border-[#CBD5E1] text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] mb-2.5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2563EB]" />
              <span className="font-bold text-[#172B4D] text-sm">
                Incident Detail: {selectedItem.evidence_id}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(selectedItem.status)}`}>
                {selectedItem.status}
              </span>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-[#64748B] hover:text-[#172B4D] text-xs font-medium"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-2.5 rounded border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px]">Message Origin:</span>
              <div className="font-mono font-bold text-[#172B4D]">{selectedItem.message_id}</div>
              <div className="text-[10px] text-[#64748B] mt-1">Observed: {selectedItem.observed_at}</div>
            </div>

            <div className="bg-white p-2.5 rounded border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px]">Mathematical Trust Composition:</span>
              <div className="text-[11px] text-[#475569] space-y-0.5 mt-0.5">
                <div>Base Tier ({selectedItem.source_tier}): {selectedItem.base_tier}</div>
                <div>Freshness Decay: {selectedItem.freshness}</div>
                <div>Source Reputation: {selectedItem.reputation}</div>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded border border-[#E2E8F0]">
              <span className="text-[#64748B] text-[10px]">Cryptographic & Verification State:</span>
              <div className="text-[11px] font-bold text-[#16A34A] mt-0.5">
                {selectedItem.source_tier === 'T1'
                  ? 'HMAC-SHA256 Authenticated Field Officer'
                  : selectedItem.source_tier === 'T2'
                  ? 'LoRa Hardware Hydrology Node Validated'
                  : 'Pre-shared Volunteer Authentication Token'}
              </div>
              <div className="text-[10px] text-[#64748B] mt-1">
                Contradiction: {selectedItem.is_contradiction ? 'YES (Penalty Applied)' : 'None Detected'}
              </div>
            </div>
          </div>

          {selectedItem.details && Object.keys(selectedItem.details).length > 0 && (
            <div className="mt-3 p-2 bg-white rounded border border-[#E2E8F0] text-[11px] font-mono text-[#475569]">
              <strong>Payload Metadata:</strong> {JSON.stringify(selectedItem.details)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
