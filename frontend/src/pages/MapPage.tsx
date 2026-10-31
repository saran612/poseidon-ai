import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  HelpCircle,
  Filter,
  Navigation,
  ShieldAlert,
  Building2,
  AlertOctagon,
  Clock,
  Radio,
} from 'lucide-react';
import { mockApi } from '@/lib/api';
import { PriorityBandChip } from '@/components/common/PriorityBandChip';
import { TierBadge } from '@/components/common/TierBadge';
import { ReliabilityBar } from '@/components/common/ReliabilityBar';
import { StaleBadge } from '@/components/common/StaleBadge';
import { useUiStore } from '@/store/useUiStore';

// Fix Leaflet standard marker icon paths in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom SVG Icons for Leaflet Markers
const createSvgIcon = (color: string, label: string) =>
  L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold; font-family: sans-serif;">
        ${label}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

export const MapPage: React.FC = () => {
  const { mapTileUrl, openDecisionCard } = useUiStore();

  // Layer Toggles State
  const [layers, setLayers] = useState({
    incidents: true,
    resources: true,
    shelters: true,
    hospitals: true,
    roads: true,
    silentAreas: true,
  });

  const [timeFilterHours, setTimeFilterHours] = useState(3);

  const { data: areas = [] } = useQuery({ queryKey: ['areas'], queryFn: mockApi.getAreas });
  const { data: resources = [] } = useQuery({ queryKey: ['resources'], queryFn: mockApi.getResources });
  const { data: incidents = [] } = useQuery({ queryKey: ['incidents'], queryFn: mockApi.getIncidents });
  const { data: roads = [] } = useQuery({ queryKey: ['roads'], queryFn: mockApi.getRoads });
  const { data: shelters = [] } = useQuery({ queryKey: ['shelters'], queryFn: mockApi.getShelters });
  const { data: hospitals = [] } = useQuery({ queryKey: ['hospitals'], queryFn: mockApi.getHospitals });

  const center: [number, number] = [10.998, 76.965]; // Coimbatore Urban Corridor

  return (
    <div className="h-[calc(100vh-6rem)] relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
      {/* Leaflet Map */}
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={mapTileUrl}
        />

        {/* 1. Roads & Bridge Overlays */}
        {layers.roads &&
          roads.map((road) => {
            let color = '#22c55e'; // Open: Green
            let dashArray = undefined;
            if (road.status === 'slow') color = '#eab308'; // Slow: Yellow
            if (road.status === 'closed') color = '#ef4444'; // Closed: Red
            if (road.reliability < 0.5) dashArray = '6, 6'; // Dashed if reliability < 0.5

            return (
              <Polyline
                key={road.id}
                positions={road.polyline}
                pathOptions={{
                  color,
                  weight: road.isBridge ? 8 : 5,
                  opacity: 0.85,
                  dashArray,
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{road.name}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                          road.status === 'closed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {road.status}
                      </span>
                    </div>
                    {road.closureReason && (
                      <p className="text-rose-600 font-semibold">{road.closureReason}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <span>Reliability:</span>
                      <ReliabilityBar score={road.reliability} size="sm" className="w-24" />
                    </div>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

        {/* 2. Incidents */}
        {layers.incidents &&
          incidents.map((inc) => {
            const color =
              inc.priorityBand === 'CRITICAL'
                ? '#dc2626'
                : inc.priorityBand === 'HIGH'
                ? '#f59e0b'
                : '#3b82f6';

            return (
              <Marker
                key={inc.id}
                position={[inc.lat, inc.lng]}
                icon={createSvgIcon(color, '!')}
              >
                <Popup>
                  <div className="p-2 space-y-2 text-xs max-w-xs">
                    <div className="flex items-center justify-between gap-2">
                      <PriorityBandChip band={inc.priorityBand} />
                      <TierBadge tier={inc.tier} />
                    </div>
                    <h4 className="font-bold text-slate-900">{inc.title}</h4>
                    <p className="text-slate-600 italic">"{inc.description}"</p>
                    <div className="flex items-center justify-between pt-1 border-t">
                      <StaleBadge lastUpdated={inc.updatedAt} />
                      <button
                        onClick={() => openDecisionCard(`DEC-${inc.wardId}`)}
                        className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Why?
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 3. Resource Fleet Units */}
        {layers.resources &&
          resources.map((unit) => (
            <Marker
              key={unit.id}
              position={[unit.lat, unit.lng]}
              icon={createSvgIcon('#2563eb', unit.type === 'boat' ? '⛵' : '🚑')}
            >
              <Popup>
                <div className="p-2 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{unit.callsign}</span>
                    <span className="font-mono text-blue-600 font-bold uppercase">{unit.status}</span>
                  </div>
                  <p className="text-slate-600">Base: {unit.assignedBase}</p>
                  <div className="flex justify-between text-slate-500 font-mono text-[11px]">
                    <span>Capacity: {unit.capacity}</span>
                    <span>Fuel: {unit.fuelPercent}%</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 4. Shelters */}
        {layers.shelters &&
          shelters.map((shelter) => {
            const occPct = Math.round((shelter.currentOccupancy / shelter.capacity) * 100);
            return (
              <Marker
                key={shelter.id}
                position={[shelter.lat, shelter.lng]}
                icon={createSvgIcon('#059669', '⛺')}
              >
                <Popup>
                  <div className="p-2 space-y-1.5 text-xs">
                    <span className="font-bold text-slate-900">{shelter.name}</span>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Occupancy:</span>
                      <span className="font-mono font-bold">
                        {shelter.currentOccupancy} / {shelter.capacity} ({occPct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${occPct > 85 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${occPct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">Contact: {shelter.contactPhone}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* 5. Silent Area Markers */}
        {layers.silentAreas &&
          areas
            .filter((a) => a.isSilent)
            .map((silentArea) => (
              <Circle
                key={silentArea.id}
                center={silentArea.coordinates}
                radius={800}
                pathOptions={{
                  color: '#64748b',
                  dashArray: '4, 8',
                  fillColor: '#94a3b8',
                  fillOpacity: 0.25,
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1 text-xs">
                    <span className="font-bold text-slate-800">Silent Area: {silentArea.name}</span>
                    <p className="text-slate-500 text-[11px]">
                      No incoming telemetry in last 40 minutes. Ground verification team recommended.
                    </p>
                  </div>
                </Popup>
              </Circle>
            ))}
      </MapContainer>

      {/* Floating Layers Panel */}
      <div className="absolute top-4 right-4 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl w-60 space-y-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Interactive Layers</span>
        </div>

        <div className="space-y-1.5">
          {Object.entries(layers).map(([key, val]) => (
            <label
              key={key}
              className="flex items-center justify-between text-slate-700 dark:text-slate-300 hover:text-slate-900 cursor-pointer capitalize"
            >
              <span>{key.replace(/([A-Z])/g, ' $1')}</span>
              <input
                type="checkbox"
                checked={val}
                onChange={() => setLayers({ ...layers, [key]: !val })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 block">
            Time Scrubber (Last {timeFilterHours} hours)
          </span>
          <input
            type="range"
            min={1}
            max={6}
            value={timeFilterHours}
            onChange={(e) => setTimeFilterHours(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
