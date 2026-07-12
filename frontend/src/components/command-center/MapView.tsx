import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../../context/AppContext';
import { Vehicle, Warehouse, Trip } from '../../types';

export const MapView: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const polylinesRef = useRef<Record<string, L.Polyline>>({});
  const { vehicles, warehouses, trips, selectedVehicleId, setSelectedVehicleId } = useApp();

  // 1. Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // US central view coordinates
    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false
    }).setView([39.8283, -98.5795], 4);

    // Dark Matter tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 2. Render Warehouses (Static Hubs)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    warehouses.forEach(wh => {
      const markerId = `wh-${wh.id}`;
      if (markersRef.current[markerId]) return; // already rendered

      const hubIcon = L.divIcon({
        html: `
          <div class="w-8 h-8 rounded-lg bg-slate-900 border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center justify-center text-[10px] font-extrabold text-blue-300">
            ${wh.id.split('-')[1]}
          </div>
        `,
        className: 'custom-hub-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([wh.location.lat, wh.location.lng], { icon: hubIcon })
        .addTo(map)
        .bindPopup(`
          <div class="p-2 font-sans text-slate-100">
            <h4 class="font-bold text-sm text-blue-400">${wh.name}</h4>
            <div class="text-xs text-slate-400 mt-1">Capacity: ${wh.inventoryLevel} / ${wh.capacity} Pallets</div>
            <div class="text-xs text-slate-400">Incoming: ${wh.incomingShipments} | Outgoing: ${wh.outgoingShipments}</div>
          </div>
        `);

      markersRef.current[markerId] = marker;
    });
  }, [warehouses]);

  // 3. Render and Update Moving Vehicles & Active Route Polylines
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Clear old active polylines that are no longer active
    Object.keys(polylinesRef.current).forEach(tripId => {
      const activeTrip = trips.find(t => t.id === tripId && (t.status === 'in-transit' || t.status === 'delayed'));
      if (!activeTrip) {
        polylinesRef.current[tripId].remove();
        delete polylinesRef.current[tripId];
      }
    });

    // Clear old vehicle markers
    Object.keys(markersRef.current).forEach(markerId => {
      if (markerId.startsWith('trk-')) {
        const vehicleId = markerId.replace('trk-', '');
        const exists = vehicles.some(v => v.id === vehicleId);
        if (!exists) {
          markersRef.current[markerId].remove();
          delete markersRef.current[markerId];
        }
      }
    });

    // Update / Draw Polylines and Vehicle Markers
    trips.forEach(trip => {
      if (trip.status !== 'in-transit' && trip.status !== 'delayed') return;

      // Draw Route Polyline if not already drawn
      if (!polylinesRef.current[trip.id]) {
        const polylineColor = trip.status === 'delayed' ? '#ef4444' : '#3b82f6';
        const polyline = L.polyline(
          trip.route.map(c => [c.lat, c.lng] as L.LatLngExpression),
          { color: polylineColor, weight: 3, opacity: 0.6 }
        ).addTo(map);

        polylinesRef.current[trip.id] = polyline;
      } else {
        // Update color
        const polylineColor = trip.status === 'delayed' ? '#ef4444' : '#3b82f6';
        polylinesRef.current[trip.id].setStyle({ color: polylineColor });
      }
    });

    vehicles.forEach(vehicle => {
      const markerId = `trk-${vehicle.id}`;
      const lat = vehicle.gps.latitude;
      const lng = vehicle.gps.longitude;

      const activeTrip = trips.find(t => t.vehicleId === vehicle.id && (t.status === 'in-transit' || t.status === 'delayed'));

      // Status Colors
      let colorClass = 'border-blue-400 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
      if (vehicle.status === 'in-transit') {
        colorClass = activeTrip?.status === 'delayed' 
          ? 'border-red-500 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse'
          : 'border-emerald-400 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]';
      } else if (vehicle.status === 'maintenance') {
        colorClass = 'border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
      }

      const vehicleIcon = L.divIcon({
        html: `
          <div style="transform: rotate(${vehicle.gps.heading}deg)" class="w-8 h-8 rounded-full bg-slate-900 border-2 ${colorClass} flex items-center justify-center transition-all duration-300">
            <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
            </svg>
          </div>
        `,
        className: 'custom-vehicle-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (!markersRef.current[markerId]) {
        // Create marker
        const marker = L.marker([lat, lng], { icon: vehicleIcon })
          .addTo(map)
          .on('click', () => {
            setSelectedVehicleId(vehicle.id);
          });
          
        markersRef.current[markerId] = marker;
      } else {
        // Update marker position and icon rotation
        const marker = markersRef.current[markerId];
        marker.setLatLng([lat, lng]);
        marker.setIcon(vehicleIcon);
      }

      // Update popup content dynamically if open
      const popup = markersRef.current[markerId].getPopup();
      const popupContent = `
        <div class="p-3 font-sans text-slate-100 min-w-48">
          <div class="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span class="font-extrabold text-sm text-blue-400">${vehicle.id}</span>
            <span class="text-[10px] px-2 py-0.5 font-bold uppercase rounded-md bg-slate-800 text-slate-300 border border-slate-700">${vehicle.status}</span>
          </div>
          <div class="space-y-1 text-xs">
            <div class="flex justify-between"><span class="text-slate-500">Speed:</span> <span class="font-semibold text-slate-200">${vehicle.gps.speed.toFixed(0)} KM/H</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Fuel:</span> <span class="font-semibold text-slate-200">${Math.round(vehicle.currentFuel)} / ${vehicle.fuelCapacity} L</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Temp:</span> <span class="font-semibold text-slate-200">${vehicle.telemetry.engineTemp.toFixed(0)} °C</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Health:</span> <span class="font-semibold ${vehicle.healthScore > 80 ? 'text-emerald-400' : 'text-rose-400'}">${vehicle.healthScore}%</span></div>
            ${activeTrip ? `<div class="mt-2 text-[10px] text-blue-400 text-center font-medium border-t border-slate-800/60 pt-1.5">Cargo: ${activeTrip.cargoType}</div>` : ''}
          </div>
        </div>
      `;
      markersRef.current[markerId].bindPopup(popupContent);
    });
  }, [vehicles, trips]);

  // 4. Focus Map on Selected Vehicle
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !selectedVehicleId) return;

    const vehicle = vehicles.find(v => v.id === selectedVehicleId);
    if (vehicle) {
      map.setView([vehicle.gps.latitude, vehicle.gps.longitude], 7);
      
      // Auto open popup
      const markerId = `trk-${vehicle.id}`;
      const marker = markersRef.current[markerId];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedVehicleId]);

  return (
    <div className="relative w-full h-[55vh] rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl glass-panel">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map Floating HUD */}
      <div className="absolute top-4 left-14 z-[400] flex items-center space-x-2">
        <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-bold text-slate-300 shadow-lg flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Digital Twin Simulation Live</span>
        </div>
      </div>
    </div>
  );
};
export default MapView;
