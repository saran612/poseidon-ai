import React, { useEffect, useRef, useState } from 'react';
import { Map as MapLibreMap, Marker, NavigationControl } from 'maplibre-gl';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  AlertTriangle,
  MapPin,
  X,
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

export const MissionMap: React.FC<MissionMapProps> = ({
  zones,
  bridges,
  evidence,
  networkGis,
  selectedBridgeId,
  onSelectBridge,
  onSimulateCut,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);

  // Layer visibility state
  const [layers, setLayers] = useState({
    zones: true,
    river: true,
    roads: true,
    bridges: true,
    incidents: true,
    depots: true,
    shelters: true,
  });

  // Selected item inspector state
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'bridge' | 'zone' | 'depot' | 'shelter' | 'incident';
    data: any;
  } | null>(null);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors, © CARTO',
          },
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [76.975, 10.990], // Center of Coimbatore Noyyal Corridor
      zoom: 12.1,
      pitch: 0,
    });

    map.addControl(new NavigationControl({ showCompass: true, showZoom: false }), 'top-right');

    map.on('load', () => {
      mapRef.current = map;
      updateMapLayers(map);
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map sources and layers whenever data changes
  const updateMapLayers = (map: MapLibreMap) => {
    if (!map.isStyleLoaded()) return;

    // 1. Noyyal River Waterway Line
    const riverCoords = networkGis?.noyyal_river || [
      [76.885, 10.965],
      [76.905, 10.97],
      [76.918, 10.9712],
      [76.935, 10.985],
      [76.9385, 10.9875],
      [76.952, 10.99],
      [76.9635, 10.993],
      [76.985, 10.9945],
      [77.015, 10.996],
      [77.025, 10.9972],
      [77.042, 10.995],
      [77.055, 10.994],
      [77.078, 10.991],
    ];

    if (map.getSource('river-source')) {
      (map.getSource('river-source') as any).setData({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: riverCoords },
        properties: { name: 'Noyyal River Corridor' },
      });
    } else {
      map.addSource('river-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: riverCoords },
          properties: { name: 'Noyyal River Corridor' },
        },
      });

      map.addLayer({
        id: 'river-layer',
        type: 'line',
        source: 'river-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#2563EB',
          'line-width': 4.5,
          'line-opacity': 0.85,
        },
      });

      map.addLayer({
        id: 'river-glow-layer',
        type: 'line',
        source: 'river-source',
        paint: {
          'line-color': '#93C5FD',
          'line-width': 9,
          'line-opacity': 0.35,
        },
      });
    }

    // 2. Flood Affected Zones (Polygons)
    const zonesFeatures = zones
      .filter(z => z.polygon_coords && z.polygon_coords.length > 2)
      .map(z => {
        // Ensure closed ring
        const coords = [...(z.polygon_coords || [])];
        if (
          coords.length > 0 &&
          (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])
        ) {
          coords.push(coords[0]);
        }

        let fillColor = '#16A34A';
        let strokeColor = '#15803D';
        if (z.tier === 'CRITICAL') {
          fillColor = '#DC2626';
          strokeColor = '#B91C1C';
        } else if (z.tier === 'HIGH') {
          fillColor = '#D97706';
          strokeColor = '#B45309';
        } else if (z.tier === 'MEDIUM') {
          fillColor = '#CA8A04';
          strokeColor = '#A16207';
        }

        return {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [coords] },
          properties: {
            zone_id: z.zone_id,
            name: z.name,
            tier: z.tier,
            rank: z.rank,
            score_expected: z.score_expected,
            population: z.population || 0,
            fillColor,
            strokeColor,
          },
        };
      });

    if (map.getSource('zones-source')) {
      (map.getSource('zones-source') as any).setData({
        type: 'FeatureCollection',
        features: zonesFeatures,
      });
    } else {
      map.addSource('zones-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: zonesFeatures },
      });

      map.addLayer({
        id: 'zones-fill-layer',
        type: 'fill',
        source: 'zones-source',
        paint: {
          'fill-color': ['get', 'fillColor'],
          'fill-opacity': 0.18,
        },
      });

      map.addLayer({
        id: 'zones-stroke-layer',
        type: 'line',
        source: 'zones-source',
        paint: {
          'line-color': ['get', 'strokeColor'],
          'line-width': 2.0,
          'line-opacity': 0.85,
        },
      });

      // Zone click listener
      map.on('click', 'zones-fill-layer', e => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          const fullZone = zones.find(z => z.zone_id === props.zone_id);
          if (fullZone) {
            setSelectedEntity({ type: 'zone', data: fullZone });
          }
        }
      });
    }

    // 3. Arterial Road Network Edges
    const edges = networkGis?.edges || [];
    const roadFeatures = edges.map(e => ({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: e.coordinates },
      properties: {
        edge_id: e.edge_id,
        bridge_id: e.bridge_id || '',
        is_open: e.is_open,
        distance_km: e.distance_km,
        duration_min: e.duration_min,
        color: e.is_open ? '#64748B' : '#DC2626',
        dash: e.is_open ? [1, 0] : [2, 2],
      },
    }));

    if (map.getSource('roads-source')) {
      (map.getSource('roads-source') as any).setData({
        type: 'FeatureCollection',
        features: roadFeatures,
      });
    } else {
      map.addSource('roads-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: roadFeatures },
      });

      map.addLayer({
        id: 'roads-layer',
        type: 'line',
        source: 'roads-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2.5,
          'line-opacity': 0.75,
        },
      });
    }

    // 4. HTML Markers (Bridges, Depots, Shelters, Incidents)
    renderMarkers(map);
  };

  // Re-render markers when entities update
  const renderMarkers = (map: MapLibreMap) => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Bridges Markers
    if (layers.bridges) {
      bridges.forEach(b => {
        const el = document.createElement('div');
        const isClosed = b.status === 'CLOSED';
        const isSelected = b.bridge_id === selectedBridgeId;

        el.className = `relative cursor-pointer group transition-transform ${
          isSelected ? 'scale-125 z-40' : 'hover:scale-110 z-30'
        }`;

        el.innerHTML = `
          <div class="px-2 py-1 rounded-md shadow-md text-[10px] font-bold flex items-center gap-1 border ${
            isClosed
              ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]'
              : 'bg-white text-[#1E40AF] border-[#93C5FD]'
          }">
            <span class="w-2 h-2 rounded-full ${isClosed ? 'bg-[#DC2626]' : 'bg-[#2563EB]'} animate-ping"></span>
            <span>${b.bridge_id.replace('BR-', '')}</span>
            <span class="text-[8px] px-1 rounded ${isClosed ? 'bg-[#DC2626] text-white' : 'bg-[#EFF6FF] text-[#1E40AF]'}">
              ${isClosed ? 'CUT' : 'OPEN'}
            </span>
          </div>
        `;

        el.onclick = () => {
          onSelectBridge(b);
          setSelectedEntity({ type: 'bridge', data: b });
        };

        const marker = new Marker({ element: el })
          .setLngLat([b.longitude, b.latitude])
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // Depots Markers
    if (layers.depots && networkGis?.depots) {
      networkGis.depots.forEach(d => {
        const el = document.createElement('div');
        el.className = 'cursor-pointer group z-20 transition-transform hover:scale-110';
        el.innerHTML = `
          <div class="px-2 py-1 bg-white border border-[#2563EB] rounded-md shadow-md text-[10px] font-bold text-[#172B4D] flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-[#2563EB]"></span>
            <span>${d.id.replace('DEPOT_', '')}</span>
            <span class="text-[8px] bg-[#EFF6FF] text-[#2563EB] px-1 rounded font-mono">${d.boats}B/${d.medical_kits}K</span>
          </div>
        `;

        el.onclick = () => {
          setSelectedEntity({ type: 'depot', data: d });
        };

        const marker = new Marker({ element: el })
          .setLngLat(d.coordinates)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // Shelters Markers
    if (layers.shelters && networkGis?.shelters) {
      networkGis.shelters.forEach(s => {
        const el = document.createElement('div');
        el.className = 'cursor-pointer group z-20 transition-transform hover:scale-110';
        el.innerHTML = `
          <div class="px-2 py-1 bg-white border border-[#16A34A] rounded-md shadow-md text-[10px] font-bold text-[#172B4D] flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-[#16A34A]"></span>
            <span>${s.id.replace('SHELTER_', '')}</span>
            <span class="text-[8px] bg-[#F0FDF4] text-[#16A34A] px-1 rounded font-mono">Cap: ${s.capacity}</span>
          </div>
        `;

        el.onclick = () => {
          setSelectedEntity({ type: 'shelter', data: s });
        };

        const marker = new Marker({ element: el })
          .setLngLat(s.coordinates)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // Evidence / Incident Markers
    if (layers.incidents) {
      evidence.forEach(ev => {
        if (!ev.longitude || !ev.latitude) return;
        const el = document.createElement('div');
        el.className = 'cursor-pointer group z-25 transition-transform hover:scale-110';

        const isVerified = ev.status === 'VERIFIED';
        const colorClass = isVerified ? 'bg-[#16A34A]' : 'bg-[#D97706]';

        el.innerHTML = `
          <div class="w-5 h-5 rounded-full ${colorClass} text-white text-[9px] font-bold flex items-center justify-center shadow-md border-2 border-white">
            !
          </div>
        `;

        el.onclick = () => {
          setSelectedEntity({ type: 'incident', data: ev });
        };

        const marker = new Marker({ element: el })
          .setLngLat([ev.longitude, ev.latitude])
          .addTo(map);

        markersRef.current.push(marker);
      });
    }
  };

  // Sync state changes with MapLibre layers
  useEffect(() => {
    if (mapRef.current) {
      updateMapLayers(mapRef.current);
    }
  }, [zones, bridges, evidence, networkGis, layers, selectedBridgeId]);

  // Handle layer visibility toggles
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('river-layer')) {
      map.setLayoutProperty('river-layer', 'visibility', layers.river ? 'visible' : 'none');
      map.setLayoutProperty('river-glow-layer', 'visibility', layers.river ? 'visible' : 'none');
    }
    if (map.getLayer('zones-fill-layer')) {
      map.setLayoutProperty('zones-fill-layer', 'visibility', layers.zones ? 'visible' : 'none');
      map.setLayoutProperty('zones-stroke-layer', 'visibility', layers.zones ? 'visible' : 'none');
    }
    if (map.getLayer('roads-layer')) {
      map.setLayoutProperty('roads-layer', 'visibility', layers.roads ? 'visible' : 'none');
    }
  }, [layers]);

  // Zoom controls
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetCorridor = () => {
    mapRef.current?.flyTo({
      center: [76.975, 10.990],
      zoom: 12.1,
      essential: true,
    });
  };

  return (
    <div className="relative w-full h-[540px] rounded-lg border border-[#E2E8F0] overflow-hidden bg-[#F8FAFC] shadow-xs flex flex-col">
      {/* Top Map Action & Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
        {/* Left: GIS Context & Demonstration Mode Badge */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-md border border-[#E2E8F0] shadow-xs flex items-center gap-2 text-xs">
            <Navigation className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="font-semibold text-[#172B4D]">Noyyal Tactical GIS</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
              EPSG:4326 WGS84
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
              SYNTHETIC DEMO
            </span>
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
            title="Fit Entire Noyyal Corridor"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MapLibre WebGL Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Bottom Floating Map Legend */}
      <div className="absolute bottom-3 left-3 z-30 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-md border border-[#E2E8F0] shadow-xs text-xs pointer-events-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-[#2563EB]" />
          GIS Map Legend
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
        </div>
      </div>

      {/* Interactive Entity Detail Drawer / Inspector */}
      {selectedEntity && (
        <div className="absolute top-14 right-3 z-30 w-80 bg-white rounded-lg border border-[#E2E8F0] shadow-lg p-4 text-xs animate-in fade-in slide-in-from-top-2">
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
        </div>
      )}
    </div>
  );
};
