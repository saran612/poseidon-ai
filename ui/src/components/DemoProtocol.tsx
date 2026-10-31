import React from 'react';
import {
  FileCheck2,
  RotateCcw,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import type { DemoStep } from '../types';

interface DemoProtocolProps {
  demoSteps: DemoStep[];
  isRunningDemo: boolean;
  onRunDemo: () => void;
}

export const DemoProtocol: React.FC<DemoProtocolProps> = ({
  demoSteps,
  isRunningDemo,
  onRunDemo,
}) => {
  return (
    <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0] mb-4">
        <div>
          <h2 className="font-bold text-sm text-[#172B4D] flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#2563EB]" />
            20-Step End-to-End Flood Demonstration Sequence
          </h2>
          <p className="text-xs text-[#64748B]">
            Autonomous end-to-end verification: Multi-transport ingestion ➔ Cryptographic Deduplication ➔ Corroboration ➔ Prioritization ➔ CP-SAT Allocation ➔ Bridge Severance ➔ Cascading Replan ➔ Human Authorization Gate.
          </p>
        </div>

        <button
          onClick={onRunDemo}
          disabled={isRunningDemo}
          className="px-4 py-2 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shrink-0"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRunningDemo ? 'animate-spin' : ''}`} />
          {isRunningDemo ? 'Executing 20 Steps...' : 'Re-execute Scenario'}
        </button>
      </div>

      {demoSteps.length > 0 ? (
        <div className="space-y-2.5">
          {demoSteps.map(s => (
            <div
              key={s.step}
              className="p-3.5 bg-white rounded-lg border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors flex items-start gap-3.5 text-xs shadow-2xs"
            >
              <div className="w-7 h-7 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold flex items-center justify-center shrink-0 border border-[#BFDBFE] text-xs">
                {s.step}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#172B4D] text-xs">{s.name}</span>
                  <span className="text-[#16A34A] font-bold text-[10px] px-2 py-0.5 bg-[#F0FDF4] rounded border border-[#DCFCE7] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                    PASSED
                  </span>
                </div>

                {s.description && (
                  <p className="text-[#475569] text-[11px] mt-1 leading-relaxed">{s.description}</p>
                )}
                {s.verdict && (
                  <p className="text-[#2563EB] text-[11px] mt-1 font-semibold leading-relaxed">
                    ➔ {s.verdict}
                  </p>
                )}

                {s.processing_metrics && (
                  <div className="mt-2 pt-2 border-t border-[#F1F5F9] flex flex-wrap gap-4 text-[10px] font-mono text-[#64748B]">
                    <span>t_ingest: <strong>{s.processing_metrics.t_ingested_avg_ms}ms</strong></span>
                    <span>t_verify: <strong>{s.processing_metrics.t_verified_avg_ms}ms</strong></span>
                    <span>t_prioritize: <strong>{s.processing_metrics.t_prioritized_ms}ms</strong></span>
                    <span>t_propose: <strong>{s.processing_metrics.t_proposed_ms}ms</strong></span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
          <Activity className="w-10 h-10 text-[#2563EB] mx-auto mb-2.5 opacity-60" />
          <h3 className="text-sm font-bold text-[#172B4D]">20-Step Autonomous Protocol Ready</h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1">
            Click "Re-execute Scenario" above to execute all 20 steps, simulate the Southwest monsoon depression over Coimbatore Noyyal catchment, and observe live millisecond telemetry.
          </p>
        </div>
      )}
    </div>
  );
};
