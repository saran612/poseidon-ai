import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, Scale, ShieldCheck, Download, AlertTriangle } from 'lucide-react';
import { KpiCard } from '@/components/common/KpiCard';

export const AnalyticsPage: React.FC = () => {
  // Fairness Served-to-Need ratio data per ward
  const fairnessData = [
    { ward: 'Ward 84 (Ukkadam)', ratio: 0.92, need: 8420, served: 7746 },
    { ward: 'Ward 58 (Singanallur)', ratio: 0.88, need: 6150, served: 5412 },
    { ward: 'Ward 72 (Perur)', ratio: 0.85, need: 3900, served: 3315 },
    { ward: 'Ward 39 (Peelamedu)', ratio: 0.81, need: 2800, served: 2268 },
    { ward: 'Ward 21 (Ganapathy)', ratio: 0.79, need: 1950, served: 1540 },
    { ward: 'Ward 96 (Madukkarai)', ratio: 0.76, need: 820, served: 623 },
  ];

  // Report by Tier
  const tierData = [
    { name: 'T1 Govt/Field', value: 45, color: '#10b981' },
    { name: 'T2 IoT Sensors', value: 30, color: '#3b82f6' },
    { name: 'T3 Verified Public', value: 18, color: '#f59e0b' },
    { name: 'T4 Unverified Social', value: 7, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Operational Analytics & Algorithmic Fairness
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gini coefficient tracking, served-to-need equity, false dispatch filtering, and baseline comparison
          </p>
        </div>

        <button
          onClick={() => alert('Exporting situational report as CSV...')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* Fairness KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          title="Algorithmic Gini Index"
          value="0.082"
          subtitle="Well within 0.15 equity limit"
          icon={Scale}
          variant="safe"
        />
        <KpiCard
          title="Best vs Worst Gap"
          value="16%"
          subtitle="Ward 84 (92%) vs Ward 96 (76%)"
          icon={BarChart3}
          variant="default"
        />
        <KpiCard
          title="Rumours Blocked"
          value="14"
          subtitle="Zero false dispatches"
          icon={ShieldCheck}
          variant="safe"
        />
        <KpiCard
          title="Duplicates Merged"
          value="38"
          subtitle="Prevented team collisions"
          icon={ShieldCheck}
          variant="default"
        />
      </div>

      {/* Fairness Served-to-Need Bar Chart */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Served-to-Need Ratio per Affected Ward
            </h3>
            <span className="text-xs text-slate-500">
              Target: Maintain equitable relief distribution across high and low population wards
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded">
            Target Threshold: &gt; 0.70 Met
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fairnessData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="ward" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="ratio" fill="#2563eb" radius={[4, 4, 0, 0]} name="Served Ratio" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Baseline Comparison Table */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            POSEIDON vs Traditional Dispatch Baseline
          </h3>
          <span className="text-slate-400 italic">Synthetic scenario benchmark evaluation</span>
        </div>

        <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b text-slate-500 uppercase font-semibold text-[10px]">
              <th className="p-2.5">Performance Metric</th>
              <th className="p-2.5">Traditional Ad-Hoc Dispatch</th>
              <th className="p-2.5 font-bold text-blue-600">POSEIDON AI (Human-in-the-Loop)</th>
              <th className="p-2.5 text-right">Advantage Delta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <tr>
              <td className="p-2.5 font-semibold">Median Response Time</td>
              <td className="p-2.5 text-slate-500">28.4 minutes</td>
              <td className="p-2.5 font-bold text-slate-900 dark:text-white">14.2 minutes</td>
              <td className="p-2.5 text-right font-mono font-bold text-emerald-600">50% Faster</td>
            </tr>
            <tr>
              <td className="p-2.5 font-semibold">Replan Latency after Road Blockage</td>
              <td className="p-2.5 text-slate-500">42 minutes (manual phone trees)</td>
              <td className="p-2.5 font-bold text-slate-900 dark:text-white">&lt; 15 seconds (Replan Diff)</td>
              <td className="p-2.5 text-right font-mono font-bold text-emerald-600">Instant Isolation</td>
            </tr>
            <tr>
              <td className="p-2.5 font-semibold">False Dispatches from Social Media Rumours</td>
              <td className="p-2.5 text-slate-500">8 wasted team dispatches</td>
              <td className="p-2.5 font-bold text-slate-900 dark:text-white">0 false dispatches (debunked)</td>
              <td className="p-2.5 text-right font-mono font-bold text-emerald-600">100% Filtered</td>
            </tr>
            <tr>
              <td className="p-2.5 font-semibold">Gini Equity Gap (Ward Variance)</td>
              <td className="p-2.5 text-slate-500">0.34 (Periphery Starvation)</td>
              <td className="p-2.5 font-bold text-slate-900 dark:text-white">0.08 (Fairness Protected)</td>
              <td className="p-2.5 text-right font-mono font-bold text-emerald-600">Fair Distribution</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
