import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { Trip } from '../../types';
import { Search, Map, Calendar, ShieldCheck, Download, Bot, MessageSquare, Send } from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const { trips, vehicles } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  
  // AI Chat Bot
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot', text: string }>>([
    { sender: 'bot', text: 'Hello! I am your automated cargo support agent. Enter an Order ID to track and inquire about your shipment.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Initial lookup if trips exist
  useEffect(() => {
    if (trips.length > 0 && !activeTrip) {
      const activeInTransit = trips.find(t => t.status === 'in-transit' || t.status === 'delayed');
      if (activeInTransit) {
        setActiveTrip(activeInTransit);
        setSearchQuery(activeInTransit.orderId);
      }
    }
  }, [trips]);

  const handleSearch = () => {
    const found = trips.find(t => t.orderId.toLowerCase().trim() === searchQuery.toLowerCase().trim() || t.id.toLowerCase().trim() === searchQuery.toLowerCase().trim());
    if (found) {
      setActiveTrip(found);
      setChatMessages(prev => [
        ...prev,
        { sender: 'bot', text: `Loaded Order details for ID: ${found.orderId}. How can I assist you with this shipment?` }
      ]);
    } else {
      alert('Order ID or Trip ID not found in database registry.');
    }
  };

  // Mini Map Renderer
  useEffect(() => {
    if (!mapRef.current || !activeTrip) return;

    if (!mapInstance.current) {
      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([activeTrip.origin.lat, activeTrip.origin.lng], 5);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

      // Origin Marker
      L.marker([activeTrip.origin.lat, activeTrip.origin.lng], {
        icon: L.divIcon({
          html: `<div class="w-6 h-6 rounded-full bg-blue-900 border-2 border-blue-400 flex items-center justify-center text-[8px] font-black text-blue-200">ORI</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(map);

      // Destination Marker
      L.marker([activeTrip.destination.lat, activeTrip.destination.lng], {
        icon: L.divIcon({
          html: `<div class="w-6 h-6 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center text-[8px] font-black text-emerald-200">DST</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(map);

      mapInstance.current = map;
    }

    const map = mapInstance.current;
    
    // Draw / update route polyline
    if (routePolylineRef.current) routePolylineRef.current.remove();
    const polyline = L.polyline(
      activeTrip.route.map(c => [c.lat, c.lng] as L.LatLngExpression),
      { color: '#3b82f6', weight: 3, opacity: 0.6 }
    ).addTo(map);
    routePolylineRef.current = polyline;

    // Place / update truck marker
    const vehicle = vehicles.find(v => v.id === activeTrip.vehicleId);
    const truckLat = vehicle ? vehicle.gps.latitude : activeTrip.route[activeTrip.currentRouteIndex].lat;
    const truckLng = vehicle ? vehicle.gps.longitude : activeTrip.route[activeTrip.currentRouteIndex].lng;
    const truckHeading = vehicle ? vehicle.gps.heading : 0;

    const truckIcon = L.divIcon({
      html: `
        <div style="transform: rotate(${truckHeading}deg)" class="w-7 h-7 rounded-full bg-slate-900 border-2 border-blue-400 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.5)]">
          <svg class="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.setLatLng([truckLat, truckLng]);
      vehicleMarkerRef.current.setIcon(truckIcon);
    } else {
      vehicleMarkerRef.current = L.marker([truckLat, truckLng], { icon: truckIcon }).addTo(map);
    }

    // Pan map to truck
    map.panTo([truckLat, truckLng]);

    return () => {
      // Keep map, cleanup marker ref on trip switch
      if (vehicleMarkerRef.current) {
        vehicleMarkerRef.current.remove();
        vehicleMarkerRef.current = null;
      }
      if (routePolylineRef.current) {
        routePolylineRef.current.remove();
        routePolylineRef.current = null;
      }
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [activeTrip, vehicles]);

  // AI Chat Bot Bot response
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      let botResponse = '';
      if (!activeTrip) {
        botResponse = 'Please query your Order ID above first, so I can fetch the tracking data for your shipment.';
      } else {
        const queryLower = userText.toLowerCase();
        const etaDate = new Date(activeTrip.estimatedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (queryLower.includes('delay') || queryLower.includes('late')) {
          botResponse = activeTrip.status === 'delayed' 
            ? `Yes, unfortunately Order ${activeTrip.orderId} is currently delayed due to extreme weather traffic anomalies en route. Our revised ETA is ${etaDate}.`
            : `No delay warnings are active. Order ${activeTrip.orderId} is tracking on-schedule, slated to arrive at ${etaDate}.`;
        } else if (queryLower.includes('where') || queryLower.includes('location')) {
          botResponse = `Order ${activeTrip.orderId} is currently in-transit near coordinates. You can see its live position moving on the mini-map to your left.`;
        } else if (queryLower.includes('pod') || queryLower.includes('proof') || queryLower.includes('deliver')) {
          botResponse = activeTrip.status === 'delivered'
            ? `Delivery complete! You can download the signed Proof Of Delivery document using the download link below.`
            : `Proof Of Delivery will be available instantly upon delivery confirmation. Currently, status is: ${activeTrip.status.toUpperCase()}.`;
        } else {
          botResponse = `Order ${activeTrip.orderId} from ${activeTrip.origin.name.split(' ')[0]} to ${activeTrip.destination.name.split(' ')[0]} is currently ${activeTrip.status.toUpperCase()}. The estimated arrival is: ${etaDate}. Let me know if you need help with invoices or routing.`;
        }
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 600);
  };

  const downloadMockPOD = () => {
    if (!activeTrip) return;
    // Mock pdf download click
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 400, 150);
      ctx.font = '16px Outfit';
      ctx.fillStyle = '#f1f5f9';
      ctx.fillText(`TRANSITOPS POD - ORDER #${activeTrip.orderId}`, 20, 40);
      ctx.font = '12px Outfit';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`Delivered By: Driver ${activeTrip.driverId}`, 20, 70);
      ctx.fillText(`Origin: ${activeTrip.origin.name}`, 20, 95);
      ctx.fillText(`Status: DELIVERED SUCCESS`, 20, 120);
    }
    const dataURL = canvas.toDataURL();
    const link = document.createElement('a');
    link.download = `POD-${activeTrip.orderId}.png`;
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
          <Search className="w-5 h-5 text-blue-400" />
          <span>Customer Shipment Tracking Portal</span>
        </h2>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
          Client-Facing Status Inquiries & Automated Chat
        </p>
      </div>

      {/* Tracker Lookup Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex items-center space-x-3 max-w-xl">
        <Search className="w-5 h-5 text-slate-500 shrink-0" />
        <input
          type="text"
          placeholder="Enter Order ID or Trip ID (e.g. ORD-123456 or TRIP-102)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-200 placeholder-slate-500 font-medium"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors"
        >
          Track Shipment
        </button>
      </div>

      {activeTrip ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tracking Details & Mini Map */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Tracking Order</span>
                  <h4 className="font-extrabold text-slate-200 text-sm mt-0.5">{activeTrip.orderId}</h4>
                </div>
                <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full border ${
                  activeTrip.status === 'delivered' 
                    ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20' 
                    : activeTrip.status === 'delayed'
                    ? 'bg-red-950/20 text-red-400 border-red-500/20 animate-pulse'
                    : 'bg-blue-950/20 text-blue-400 border-blue-500/20'
                }`}>
                  {activeTrip.status}
                </span>
              </div>

              {/* Grid detail */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px]">Transit Route</span>
                  <div className="font-bold text-slate-300 mt-0.5">
                    {activeTrip.origin.name.split(' ')[0]} ➔ {activeTrip.destination.name.split(' ')[0]}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Estimated ETA</span>
                  <div className="font-bold text-slate-300 mt-0.5">
                    {new Date(activeTrip.estimatedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Freight Cargo</span>
                  <div className="font-bold text-slate-300 mt-0.5">
                    {activeTrip.cargoType} ({(activeTrip.cargoWeight / 1000).toFixed(1)}t)
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Carrier Assigned</span>
                  <div className="font-bold text-slate-300 mt-0.5">{activeTrip.vehicleId}</div>
                </div>
              </div>

              {/* Map Holder */}
              <div className="h-60 w-full rounded-xl overflow-hidden border border-slate-850">
                <div ref={mapRef} className="w-full h-full" />
              </div>

              {/* Downloads */}
              {activeTrip.status === 'delivered' && (
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={downloadMockPOD}
                    className="flex items-center space-x-2 py-2 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Proof of Delivery</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* AI Customer Care Bot Chat */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col h-[52vh]">
            <div className="flex items-center space-x-2 border-b border-slate-850 pb-4 mb-4">
              <Bot className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-extrabold text-slate-200 tracking-wider uppercase">
                Support Chat Bot
              </h3>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto space-y-3.5 mb-4 pr-1 text-xs leading-normal">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl p-3.5 border ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600/10 border-blue-500/20 text-slate-200' 
                      : 'bg-slate-900 border-slate-850 text-slate-350'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleChatSubmit} className="flex items-center space-x-2 border border-slate-800 bg-slate-900/40 px-3 py-1.5 rounded-xl">
              <MessageSquare className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Ask about ETA, delays, or PODs..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-transparent border-none text-xs focus:outline-none text-slate-200 placeholder-slate-550"
              />
              <button 
                type="submit"
                className="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-16 rounded-2xl border border-slate-800 text-center text-slate-500 text-sm">
          No order queried yet. Enter a valid Order ID (e.g. any ORD-xxxxxx) to view the live GPS simulation map and invoke the Support chatbot.
        </div>
      )}
    </div>
  );
};
export default CustomerPortal;
