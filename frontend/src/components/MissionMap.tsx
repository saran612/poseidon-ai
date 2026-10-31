import React, { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Polygon,
  Marker,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  AlertTriangle,
  MapPin,
  X,
  Activity,
} from 'lucide-react';
import type { Zone, Bridge, EvidenceItem, NetworkGIS } from '../types';

interface MissionMapProps {
  zones: Zone[];
  bridges: Bridge[];
  evidence: EvidenceItem[];
  networkGis: NetworkGIS | null;
  selectedBridgeId: string | null;
  onSelectBridge: (bridge: Bridge) => void;
  onSimulateCut: (bridgeId: string) => void;
}

// Controller component to imperatively manipulate Leaflet map instance
const MapControllerComponent: React.FC<{
  center: [number, number];
  zoom: number;
  triggerReset: number;
}> = ({ center, zoom, triggerReset }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [triggerReset, center, zoom, map]);

  return null;
};

export const MissionMap: React.FC<MissionMapProps> = ({
  zones,
  bridges,
  evidence,
  networkGis,
  selectedBridgeId,
  onSelectBridge,
  onSimulateCut,
}) => {
  // Scenario configuration
  const [selectedScenario, setSelectedScenario] = useState<'coimbatore_flood' | 'andhra_cyclone'>('coimbatore_flood');
  const [mapCenter, setMapCenter] = useState<[number, number]>([10.990, 76.975]);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [resetCounter, setResetCounter] = useState<number>(0);
  const [leafletMap, setLeafletMap] = useState<L.Map | null>(null);

  // Layer visibility state (all 10 operational layers supported)
  const [layers, setLayers] = useState({
    zones: true,
    river: true,
    roads: true,
    bridges: true,
    incidents: true,
    depots: true,
    shelters: true,
    hospitals: true,
    routes: true,
  });

  // Selected item inspector state
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'bridge' | 'zone' | 'depot' | 'shelter' | 'hospital' | 'incident' | 'road';
    data: any;
  } | null>(null);

  // Synchronize scenario center
  useEffect(() => {
    if (selectedScenario === 'coimbatore_flood') {
      setMapCenter([10.990, 76.975]);
      setMapZoom(12);
      setResetCounter(c => c + 1);
    } else {
      setMapCenter([16.5062, 80.6480]);
      setMapZoom(11);
      setResetCounter(c => c + 1);
    }
  }, [selectedScenario]);

  // Noyyal River waterway coordinates converted from [lon, lat] to [lat, lon]
  const riverCoords: [number, number][] = useMemo(() => {
    const raw = networkGis?.noyyal_river || [
      [76.885, 10.965],
      [76.905, 10.970],
      [76.918, 10.9712],
      [76.928, 10.9790],
      [76.9385, 10.9875],
      [76.952, 10.990],
      [76.9635, 10.993],
      [76.985, 10.9945],
      [77.015, 10.996],
      [77.025, 10.9972],
      [77.042, 10.995],
      [77.055, 10.994],
      [77.078, 10.991],
    ];
    return raw.map(([lon, lat]) => [lat, lon]);
  }, [networkGis]);

  // Road edges converted to [lat, lon] pairs
  const roadSegments = useMemo(() => {
    const edges = networkGis?.edges || [];
    return edges.map(e => ({
      ...e,
      latLngs: e.coordinates.map(([lon, lat]) => [lat, lon] as [number, number]),
    }));
  }, [networkGis]);

  // Helper factory for Custom Leaflet DivIcons
  const createBridgeIcon = (bridge: Bridge, isSelected: boolean) => {
    const isClosed = bridge.status === 'CLOSED';
    const html = `
      <div class="px-2 py-1 rounded-md shadow-md text-[10px] font-bold flex items-center gap-1 border transition-transform ${
        isSelected ? 'scale-125 ring-2 ring-[#2563EB] z-50' : 'hover:scale-110'
      } ${
        isClosed
          ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]'
          : 'bg-white text-[#1E40AF] border-[#93C5FD]'
      }">
        <span class="w-2 h-2 rounded-full ${isClosed ? 'bg-[#DC2626]' : 'bg-[#2563EB]'} animate-ping"></span>
        <span>${bridge.bridge_id.replace('BR-', '')}</span>
        <span class="text-[8px] px-1 rounded ${isClosed ? 'bg-[#DC2626] text-white' : 'bg-[#EFF6FF] text-[#1E40AF]'}">
          ${isClosed ? 'CUT' : 'OPEN'}
        </span>
      </div>
    `;
    return L.divIcon({
      className: 'poseidon-bridge-marker',
      html,
      iconSize: [68, 28],
      iconAnchor: [34, 14],
    });
  };

  const createDepotIcon = (depot: any) => {
    const html = `
      <div class="px-2 py-1 bg-white border border-[#2563EB] rounded-md shadow-md text-[10px] font-bold text-[#172B4D] flex items-center gap-1 hover:scale-110 transition-transform">
        <span class="w-2 h-2 rounded-full bg-[#2563EB]"></span>
        <span>${depot.id.replace('DEPOT_', '')}</span>
        <span class="text-[8px] bg-[#EFF6FF] text-[#2563EB] px-1 rounded font-mono">${depot.boats}B/${depot.medical_kits}K</span>
      </div>
    `;
    return L.divIcon({
      className: 'poseidon-depot-marker',
      html,
      iconSize: [72, 28],
      iconAnchor: [36, 14],
    });
  };

  const createShelterIcon = (shelter: any) => {
    const html = `
      <div class="px-2 py-1 bg-white border border-[#16A34A] rounded-md shadow-md text-[10px] font-bold text-[#172B4D] flex items-center gap-1 hover:scale-110 transition-transform">
        <span class="w-2 h-2 rounded-full bg-[#16A34A]"></span>
        <span>${shelter.id.replace('SHELTER_', '')}</span>
        <span class="text-[8px] bg-[#F0FDF4] text-[#16A34A] px-1 rounded font-mono">Cap: ${shelter.capacity}</span>
      </div>
    `;
    return L.divIcon({
      className: 'poseidon-shelter-marker',
      html,
      iconSize: [80, 28],
      iconAnchor: [40, 14],
    });
  };

  const createHospitalIcon = (hosp: any) => {
    const html = `
      <div class="px-2 py-1 bg-white border border-[#DC2626] rounded-md shadow-md text-[10px] font-bold text-[#991B1B] flex items-center gap-1 hover:scale-110 transition-transform">
        <span class="w-2 h-2 rounded-full bg-[#DC2626]"></span>
        <span>${hosp.id.replace('HOSP_', '')}</span>
        <span class="text-[8px] bg-[#FEF2F2] text-[#DC2626] px-1 rounded font-mono">MED</span>
      </div>
    `;
    return L.divIcon({
      className: 'poseidon-hospital-marker',
      html,
      iconSize: [70, 28],
      iconAnchor: [35, 14],
    });
  };

  const createIncidentIcon = (ev: EvidenceItem) => {
    const isVerified = ev.status === 'VERIFIED';
    const colorClass = isVerified ? 'bg-[#16A34A]' : 'bg-[#D97706]';
    const html = `
      <div class="w-6 h-6 rounded-full ${colorClass} text-white text-[10px] font-extrabold flex items-center justify-center shadow-md border-2 border-white hover:scale-125 transition-transform cursor-pointer">
        !
      </div>
    `;
    return L.divIcon({
      className: 'poseidon-incident-marker',
      html,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // Zoom controls
  const handleZoomIn = () => leafletMap?.zoomIn();
  const handleZoomOut = () => leafletMap?.zoomOut();
  const handleResetCorridor = () => {
    setResetCounter(c => c + 1);
  };

  return (
    <div className="relative w-full h-[540px] rounded-lg border border-[#E2E8F0] overflow-hidden bg-[#F8FAFC] shadow-xs flex flex-col">
      {/* Top Map Action & Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        {/* Left: GIS Context & Demonstration Mode Badge + Scenario Selector */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-md border border-[#E2E8F0] shadow-xs flex items-center gap-2 text-xs">
            <Navigation className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="font-semibold text-[#172B4D]">OSM Leaflet Tactical GIS</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
              EPSG:4326 WGS84
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
              OPENSTREETMAP
            </span>
          </div>

          {/* Scenario Selector */}
          <div className="bg-white/95 backdrop-blur-xs px-2 py-1 rounded-md border border-[#E2E8F0] shadow-xs flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-[#64748B] font-medium">Scenario:</span>
            <select
              value={selectedScenario}
              onChange={e => setSelectedScenario(e.target.value as any)}
              aria-label="Select disaster scenario"
              className="text-xs font-semibold text-[#1E40AF] bg-transparent outline-none cursor-pointer"
            >
              <option value="coimbatore_flood">Coimbatore Noyyal Flood</option>
              <option value="andhra_cyclone">Andhra Pradesh Cyclone</option>
            </select>
          </div>
        </div>

        {/* Right: Layer Toggles & View Reset */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-xs p-1 rounded-md border border-[#E2E8F0] shadow-xs text-xs">
          <button
            onClick={() => setLayers(l => ({ ...l, zones: !l.zones }))}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              layers.zones ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold' : 'text-[#64748B] hover:bg-slate-100'
            }`}
          >
            Zones
          </button>
          <button
            onClick={() => setLayers(l => ({ ...l, river: !l.river }))}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              layers.river ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold' : 'text-[#64748B] hover:bg-slate-100'
            }`}
          >
            Noyyal River
          </button>
          <button
            onClick={() => setLayers(l => ({ ...l, roads: !l.roads }))}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              layers.roads ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold' : 'text-[#64748B] hover:bg-slate-100'
            }`}
          >
            Roads
          </button>
          <button
            onClick={() => setLayers(l => ({ ...l, bridges: !l.bridges }))}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              layers.bridges ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold' : 'text-[#64748B] hover:bg-slate-100'
            }`}
          >
            Bridges
          </button>
          <button
            onClick={() => setLayers(l => ({ ...l, incidents: !l.incidents }))}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              layers.incidents ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold' : 'text-[#64748B] hover:bg-slate-100'
            }`}
          >
            Incidents
          </button>
          <button
            onClick={() => setLayers(l => ({ ...l, depots: !l.depots }))}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              layers.depots ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold' : 'text-[#64748B] hover:bg-slate-100'
            }`}
          >
            Depots
          </button>
          <button
            onClick={() => setLayers(l => ({ ...l, shelters: !l.shelters }))}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              layers.shelters ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold' : 'text-[#64748B] hover:bg-slate-100'
            }`}
          >
            Shelters
          </button>
          <button
            onClick={() => setLayers(l => ({ ...l, hospitals: !l.hospitals }))}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              layers.hospitals ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold' : 'text-[#64748B] hover:bg-slate-100'
            }`}
          >
            Hospitals
          </button>

          <div className="w-[1px] h-4 bg-[#E2E8F0] mx-0.5" />

          <button
            onClick={handleZoomIn}
            className="p-1 rounded text-[#475569] hover:bg-slate-100 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1 rounded text-[#475569] hover:bg-slate-100 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetCorridor}
            className="p-1 rounded text-[#475569] hover:bg-slate-100 transition-colors"
            title="Fit Entire Disaster Extent"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Leaflet MapContainer */}
      <div className="w-full h-full">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          zoomControl={false}
          className="w-full h-full"
          ref={setLeafletMap}
        >
          {/* Synchronizer */}
          <MapControllerComponent
            center={mapCenter}
            zoom={mapZoom}
            triggerReset={resetCounter}
          />

          {/* OpenStreetMap Basemap TileLayer with Clean Light Style & Proper Attribution */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png"
            maxZoom={19}
            minZoom={4}
          />

          {/* 1. Noyyal River Waterway Corridor */}
          {layers.river && (
            <>
              {/* Outer Cyan Glow Polyline */}
              <Polyline
                positions={riverCoords}
                pathOptions={{
                  color: '#93C5FD',
                  weight: 8,
                  opacity: 0.45,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
              {/* Core River Polyline */}
              <Polyline
                positions={riverCoords}
                pathOptions={{
                  color: '#2563EB',
                  weight: 4,
                  opacity: 0.9,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            </>
          )}

          {/* 2. Flood Risk Zones Polygons */}
          {layers.zones &&
            zones
              .filter(z => z.polygon_coords && z.polygon_coords.length > 2)
              .map(z => {
                const positions = (z.polygon_coords || []).map(([lon, lat]) => [lat, lon] as [number, number]);
                let fillColor = '#16A34A';
                let borderColor = '#15803D';
                if (z.tier === 'CRITICAL') {
                  fillColor = '#DC2626';
                  borderColor = '#B91C1C';
                } else if (z.tier === 'HIGH') {
                  fillColor = '#D97706';
                  borderColor = '#B45309';
                } else if (z.tier === 'MEDIUM') {
                  fillColor = '#CA8A04';
                  borderColor = '#A16207';
                }

                return (
                  <Polygon
                    key={z.zone_id}
                    positions={positions}
                    pathOptions={{
                      color: borderColor,
                      weight: 2,
                      fillColor: fillColor,
                      fillOpacity: 0.18,
                    }}
                    eventHandlers={{
                      click: () => {
                        setSelectedEntity({ type: 'zone', data: z });
                      },
                    }}
                  />
                );
              })}

          {/* 3. Road Network Polylines */}
          {layers.roads &&
            roadSegments.map(seg => (
              <Polyline
                key={seg.edge_id}
                positions={seg.latLngs}
                pathOptions={{
                  color: seg.is_open ? '#64748B' : '#DC2626',
                  weight: 3,
                  dashArray: seg.is_open ? undefined : '6, 6',
                  opacity: 0.8,
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedEntity({ type: 'road', data: seg });
                  },
                }}
              />
            ))}

          {/* 4. Candidate Bridges Markers */}
          {layers.bridges &&
            bridges.map(b => (
              <Marker
                key={b.bridge_id}
                position={[b.latitude, b.longitude]}
                icon={createBridgeIcon(b, b.bridge_id === selectedBridgeId)}
                eventHandlers={{
                  click: () => {
                    onSelectBridge(b);
                    setSelectedEntity({ type: 'bridge', data: b });
                  },
                }}
              />
            ))}

          {/* 5. Depots Markers */}
          {layers.depots &&
            networkGis?.depots?.map(d => (
              <Marker
                key={d.id}
                position={[d.coordinates[1], d.coordinates[0]]}
                icon={createDepotIcon(d)}
                eventHandlers={{
                  click: () => {
                    setSelectedEntity({ type: 'depot', data: d });
                  },
                }}
              />
            ))}

          {/* 6. Shelters Markers */}
          {layers.shelters &&
            networkGis?.shelters?.map(s => (
              <Marker
                key={s.id}
                position={[s.coordinates[1], s.coordinates[0]]}
                icon={createShelterIcon(s)}
                eventHandlers={{
                  click: () => {
                    setSelectedEntity({ type: 'shelter', data: s });
                  },
                }}
              />
            ))}

          {/* 7. Critical Hospitals Markers */}
          {layers.hospitals &&
            networkGis?.critical_facilities
              ?.filter(f => f.type === 'HOSPITAL')
              .map(h => (
                <Marker
                  key={h.id}
                  position={[h.coordinates[1], h.coordinates[0]]}
                  icon={createHospitalIcon(h)}
                  eventHandlers={{
                    click: () => {
                      setSelectedEntity({ type: 'hospital', data: h });
                    },
                  }}
                />
              ))}

          {/* 8. Incidents & Ground Truth Evidence Markers */}
          {layers.incidents &&
            evidence
              .filter(ev => ev.latitude && ev.longitude)
              .map(ev => (
                <Marker
                  key={ev.evidence_id}
                  position={[ev.latitude!, ev.longitude!]}
                  icon={createIncidentIcon(ev)}
                  eventHandlers={{
                    click: () => {
                      setSelectedEntity({ type: 'incident', data: ev });
                    },
                  }}
                />
              ))}
        </MapContainer>
      </div>

      {/* Bottom Floating Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-2 rounded-md border border-[#E2E8F0] shadow-xs text-xs pointer-events-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-[#2563EB]" />
          GIS Map Legend (OpenStreetMap)
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span> Critical Zone
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span> High Zone
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CA8A04]"></span> Medium Zone
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#2563EB] rounded"></span> Noyyal River
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#64748B]"></span> Open Road
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-[#DC2626]"></span> Closed Cut
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span> Base Depot
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span> Relief Shelter
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span> Hospital
          </span>
        </div>
      </div>

      {/* Interactive Entity Detail Drawer / Inspector */}
      {selectedEntity && (
        <div className="absolute top-14 right-3 z-[1000] w-84 bg-white rounded-lg border border-[#E2E8F0] shadow-lg p-4 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] mb-2.5">
            <div className="flex items-center gap-1.5 font-bold text-[#172B4D]">
              <MapPin className="w-4 h-4 text-[#2563EB]" />
              <span className="capitalize">{selectedEntity.type} Inspector</span>
            </div>
            <button
              onClick={() => setSelectedEntity(null)}
              className="p-1 rounded text-[#94A3B8] hover:text-[#172B4D] hover:bg-slate-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {selectedEntity.type === 'bridge' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-[#172B4D]">{selectedEntity.data.bridge_id}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    selectedEntity.data.status === 'CLOSED'
                      ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]'
                      : 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]'
                  }`}
                >
                  {selectedEntity.data.status}
                </span>
              </div>
              <div className="text-xs font-semibold text-[#334155]">{selectedEntity.data.name}</div>
              <div className="text-[11px] text-[#64748B]">Crosses: {selectedEntity.data.crosses_waterway}</div>
              <div className="text-[11px] text-[#64748B]">
                Coordinates: {selectedEntity.data.latitude.toFixed(4)}, {selectedEntity.data.longitude.toFixed(4)}
              </div>
              <div className="p-2 bg-[#F8FAFC] rounded border border-[#E2E8F0] text-[11px] text-[#475569]">
                <strong>Route Dependency:</strong> {selectedEntity.data.route_dependency}
              </div>
              {selectedEntity.data.connected_zones && (
                <div className="text-[11px] text-[#64748B]">
                  Connected Zones: {selectedEntity.data.connected_zones.join(', ')}
                </div>
              )}
              {selectedEntity.data.closure_reason && (
                <div className="text-[11px] text-[#DC2626] font-medium bg-[#FEF2F2] p-1.5 rounded border border-[#FCA5A5]">
                  Closure Reason: {selectedEntity.data.closure_reason}
                </div>
              )}

              <div className="pt-2 border-t border-[#E2E8F0] flex gap-2">
                {selectedEntity.data.status === 'OPEN' ? (
                  <button
                    onClick={() => onSimulateCut(selectedEntity.data.bridge_id)}
                    className="w-full py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium rounded text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Simulate Flood Cut
                  </button>
                ) : (
                  <button
                    onClick={() => onSimulateCut(selectedEntity.data.bridge_id)}
                    className="w-full py-1.5 bg-[#16A34A] hover:bg-[#15803D] text-white font-medium rounded text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Reopen Bridge
                  </button>
                )}
              </div>
            </div>
          )}

          {selectedEntity.type === 'zone' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-[#172B4D]">{selectedEntity.data.name}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    selectedEntity.data.tier === 'CRITICAL'
                      ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]'
                      : 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
                  }`}
                >
                  Rank #{selectedEntity.data.rank} · {selectedEntity.data.tier}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#F8FAFC] p-2 rounded border border-[#E2E8F0]">
                <div>Population: {(selectedEntity.data.population || 0).toLocaleString()}</div>
                <div>Expected Score: {selectedEntity.data.score_expected}</div>
                <div>Upper Bound: {selectedEntity.data.score_upper}</div>
                <div>Confidence: {selectedEntity.data.confidence}</div>
              </div>
              <p className="text-[11px] text-[#475569]">{selectedEntity.data.evidence_summary}</p>
              <div className="text-[11px] text-[#2563EB] italic">
                Counterfactual: {selectedEntity.data.what_would_change_this}
              </div>
            </div>
          )}

          {selectedEntity.type === 'depot' && (
            <div className="space-y-2">
              <div className="font-bold text-sm text-[#172B4D]">{selectedEntity.data.name}</div>
              <div className="text-[11px] text-[#64748B]">ID: {selectedEntity.data.id}</div>
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#EFF6FF] p-2.5 rounded border border-[#BFDBFE]">
                <div>
                  <span className="text-[#64748B]">Boats Ready:</span>
                  <div className="font-bold text-sm text-[#2563EB]">{selectedEntity.data.boats} Units</div>
                </div>
                <div>
                  <span className="text-[#64748B]">Medical Kits:</span>
                  <div className="font-bold text-sm text-[#2563EB]">{selectedEntity.data.medical_kits} Kits</div>
                </div>
              </div>
              <div className="text-[11px] text-[#64748B]">Sector: {selectedEntity.data.coverage}</div>
            </div>
          )}

          {selectedEntity.type === 'shelter' && (
            <div className="space-y-2">
              <div className="font-bold text-sm text-[#172B4D]">{selectedEntity.data.name}</div>
              <div className="text-[11px] text-[#64748B]">Camp ID: {selectedEntity.data.id}</div>
              <div className="p-2.5 bg-[#F0FDF4] rounded border border-[#DCFCE7] text-[11px]">
                <div className="flex justify-between text-[#166534] font-medium">
                  <span>Capacity: {selectedEntity.data.capacity} evacuees</span>
                  <span>Occupancy: {selectedEntity.data.current_occupancy || 85}</span>
                </div>
                <div className="w-full bg-[#DCFCE7] h-1.5 rounded-full mt-2">
                  <div
                    className="bg-[#16A34A] h-1.5 rounded-full"
                    style={{
                      width: `${Math.round(((selectedEntity.data.current_occupancy || 85) / selectedEntity.data.capacity) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedEntity.type === 'hospital' && (
            <div className="space-y-2">
              <div className="font-bold text-sm text-[#172B4D]">{selectedEntity.data.name}</div>
              <div className="text-[11px] text-[#64748B]">ID: {selectedEntity.data.id}</div>
              <div className="p-2.5 bg-[#FEF2F2] rounded border border-[#FCA5A5] text-[11px]">
                <div className="text-[#991B1B] font-bold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#DC2626]" />
                  <span>Authorized Critical Trauma Facility</span>
                </div>
                <div className="mt-2 text-[#475569]">
                  Emergency medical response center with standby surgical teams and triage routing.
                </div>
              </div>
            </div>
          )}

          {selectedEntity.type === 'incident' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-[#172B4D]">{selectedEntity.data.evidence_id}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                  Tier {selectedEntity.data.source_tier}
                </span>
              </div>
              <div className="text-xs font-semibold text-[#172B4D]">
                Category: {selectedEntity.data.incident_type}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#F8FAFC] p-2 rounded border border-[#E2E8F0]">
                <div>Confidence: {selectedEntity.data.confidence}</div>
                <div>Status: {selectedEntity.data.status}</div>
                <div>People: {selectedEntity.data.people_affected}</div>
                <div>Age: {selectedEntity.data.age_minutes}m ago</div>
              </div>
            </div>
          )}

          {selectedEntity.type === 'road' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-[#172B4D]">{selectedEntity.data.edge_id}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    selectedEntity.data.is_open
                      ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]'
                      : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]'
                  }`}
                >
                  {selectedEntity.data.is_open ? 'OPEN' : 'SEVERED / BLOCKED'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#F8FAFC] p-2 rounded border border-[#E2E8F0]">
                <div>Distance: {selectedEntity.data.distance_km} km</div>
                <div>Duration: {selectedEntity.data.duration_min} min</div>
              </div>
              {selectedEntity.data.bridge_id && (
                <div className="text-[11px] text-[#2563EB]">
                  Associated Bridge: {selectedEntity.data.bridge_id}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
