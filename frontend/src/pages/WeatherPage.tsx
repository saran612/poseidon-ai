import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CloudRain,
  AlertTriangle,
  Radio,
  Clock,
  TrendingUp,
  AlertOctagon,
  CheckCircle2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { mockApi } from '@/lib/api';
import { TierBadge } from '@/comp/common/TierBadge';
import { ReliabilityBar } from '@/comp/common/ReliabilityBar';
import { StaleBadge } from '@/comp/common/StaleBadge';

export const WeatherPage: React.FC = () => {
  const { data: alerts = [] } = useQuery({ queryKey: ['weatherAlerts'], queryFn: mockApi.getWeatherAlerts });
  const { data: sensors = [] } = useQuery({ queryKey: ['sensors'], queryFn: mockApi.getSensors });

  const riverSensor = sensors.find((s) => s.id === 'SENS-NOYYAL-01');
  const rainSensor = sensors.find((s) => s.id === 'SENS-RAIN-UKKADAM');
  const faultySensor = sensors.find((s) => s.isFaulty);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Hydrological Telemetry & Meteorological Alerts
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Real-time river stage levels, rainfall intensity gauges, and sensor anomaly diagnostics
        </p>
      </div>

      {/* Weather Alerts List */}
      <div className="space-y-3">
        {alerts.map((al) => (
          <div
            key={al.id}
            className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/40 text-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-600 animate-pulse" />
                <h3 className="font-bold text-sm text-rose-900 dark:text-rose-200">{al.title}</h3>
              </div>
              <span className="font-mono text-[11px] text-rose-700 dark:text-rose-300 font-semibold">
                Expires: {new Date(al.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-rose-800 dark:text-rose-300">{al.description}</p>
          </div>
        ))}
      </div>

      {/* Faulty Sensor Alert if present */}
      {faultySensor && (
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>SENSOR TELEMETRY ANOMALY DETECTED: {faultySensor.name}</span>
          </div>
          <p>{faultySensor.faultReason}</p>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* River Gauge Chart */}
        {riverSensor && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-black shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{riverSensor.name}</h3>
                <span className="text-xs text-slate-500">{riverSensor.wardName}</span>
              </div>
              <span className="font-mono font-bold text-base text-rose-600">
                {riverSensor.currentValue} {riverSensor.unit}
              </span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riverSensor.history}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                  <YAxis domain={[2, 6]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <ReferenceLine
                    y={riverSensor.dangerThreshold}
                    label="Danger Mark"
                    stroke="#dc2626"
                    strokeDasharray="4 4"
                  />
                  <ReferenceLine
                    y={riverSensor.warningThreshold}
                    label="Warning"
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Rain Gauge Chart */}
        {rainSensor && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-black shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{rainSensor.name}</h3>
                <span className="text-xs text-slate-500">{rainSensor.wardName}</span>
              </div>
              <span className="font-mono font-bold text-base text-blue-600">
                {rainSensor.currentValue} {rainSensor.unit}
              </span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rainSensor.history}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 60]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <ReferenceLine
                    y={rainSensor.dangerThreshold}
                    label="Emergency"
                    stroke="#dc2626"
                    strokeDasharray="4 4"
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0891b2"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Sensor Reading Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-black shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="p-3">Sensor Name</th>
              <th className="p-3">Ward / Location</th>
              <th className="p-3 text-right">Current Value</th>
              <th className="p-3 text-right">Thresholds</th>
              <th className="p-3">Health Status</th>
              <th className="p-3">Reliability & Age</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sensors.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="p-3 font-bold text-slate-900 dark:text-white">{s.name}</td>
                <td className="p-3 text-slate-600 dark:text-slate-400">{s.wardName}</td>
                <td className="p-3 text-right font-mono font-bold">
                  {s.currentValue} {s.unit}
                </td>
                <td className="p-3 text-right font-mono text-slate-500">
                  Warn: {s.warningThreshold} | Danger: {s.dangerThreshold}
                </td>
                <td className="p-3">
                  {s.isFaulty ? (
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold uppercase text-[10px]">
                      Faulty Anomaly
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px]">
                      Operational
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <ReliabilityBar score={s.reliability} size="sm" className="w-20" />
                    <StaleBadge lastUpdated={s.lastUpdated} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
