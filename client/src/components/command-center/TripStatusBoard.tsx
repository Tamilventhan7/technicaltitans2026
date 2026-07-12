import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trip } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, Compass, Package, Clock, DollarSign, User, Truck, MapPin, ChevronDown, X } from 'lucide-react';

const INCIDENT_TYPES = [
  { id: 'accident', label: 'Accident', color: 'text-red-400 bg-red-950/30 border-red-500/20 hover:bg-red-950/50' },
  { id: 'fuel_theft', label: 'Fuel Theft', color: 'text-orange-400 bg-orange-950/30 border-orange-500/20 hover:bg-orange-950/50' },
  { id: 'maintenance', label: 'Breakdown', color: 'text-amber-400 bg-amber-950/30 border-amber-500/20 hover:bg-amber-950/50' },
  { id: 'weather_risk', label: 'Weather', color: 'text-cyan-400 bg-cyan-950/30 border-cyan-500/20 hover:bg-cyan-950/50' },
  { id: 'traffic_delay', label: 'Traffic', color: 'text-slate-400 bg-slate-900/60 border-slate-700/20 hover:bg-slate-800/60' },
  { id: 'speeding', label: 'Speeding', color: 'text-yellow-400 bg-yellow-950/30 border-yellow-500/20 hover:bg-yellow-950/50' },
];

export const TripStatusBoard: React.FC = () => {
  const { trips, vehicles, drivers, injectIncident, setSelectedVehicleId } = useApp();
  const [injectingTripId, setInjectingTripId] = useState<string | null>(null);
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);

  const activeTrips = trips.filter(t => t.status === 'in-transit' || t.status === 'delayed');
  const completedCount = trips.filter(t => t.status === 'delivered').length;

  const handleInject = async (tripId: string, category: string) => {
    try {
      await injectIncident(tripId, category);
      setInjectingTripId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <Compass className="w-4 h-4 text-blue-400 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">Active Operations Board</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {completedCount} completed today · Real-time tracking
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {activeTrips.some(t => t.status === 'delayed') && (
            <span className="px-2.5 py-1 text-[9px] font-black bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg animate-pulse">
              {activeTrips.filter(t => t.status === 'delayed').length} DELAYED
            </span>
          )}
          <span className="px-3 py-1.5 text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            {activeTrips.length} Active
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {activeTrips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30 mb-4">
              <Package className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-slate-400">No Active Shipments</p>
            <p className="text-xs text-slate-600 mt-1 max-w-xs">
              No trips in-transit. Use <span className="text-blue-400">Smart Dispatch</span> to assign a new shipment.
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            {/* THead */}
            <thead>
              <tr className="border-b border-slate-800/60 bg-slate-900/10">
                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500">Shipment</th>
                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500">Route</th>
                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500">Crew & Asset</th>
                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 min-w-36">Progress</th>
                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 text-right">P&L</th>
                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-slate-500 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              <AnimatePresence>
                {activeTrips.map((trip, idx) => {
                  const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                  const driver = drivers.find(d => d.id === trip.driverId);
                  const progress = Math.round((trip.currentRouteIndex / Math.max(trip.route.length - 1, 1)) * 100);
                  const isDelayed = trip.status === 'delayed';
                  const isExpanded = expandedTripId === trip.id;
                  const isInjecting = injectingTripId === trip.id;

                  return (
                    <React.Fragment key={trip.id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`border-b border-slate-800/30 text-xs transition-colors cursor-pointer ${
                          isDelayed ? 'bg-red-950/5 hover:bg-red-950/10' : 'hover:bg-slate-900/20'
                        }`}
                        onClick={() => setExpandedTripId(isExpanded ? null : trip.id)}
                      >
                        {/* Trip ID */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center space-x-2">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isDelayed ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                              <span className="font-bold text-slate-200">{trip.id}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 mt-0.5 pl-3.5 uppercase tracking-wider">
                              {trip.cargoType} · {(trip.cargoWeight / 1000).toFixed(1)}T
                            </span>
                          </div>
                        </td>

                        {/* Route */}
                        <td className="px-5 py-4">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                            <div>
                              <div className="font-semibold text-slate-300">
                                {trip.origin.name.split(' ')[0]} → {trip.destination.name.split(' ')[0]}
                              </div>
                              <div className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                <span>ETA {new Date(trip.estimatedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Crew */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={e => { e.stopPropagation(); setSelectedVehicleId(trip.vehicleId); }}
                              className="flex items-center space-x-1.5 text-blue-400 hover:text-blue-300 font-bold w-fit"
                            >
                              <Truck className="w-3 h-3" />
                              <span>{trip.vehicleId}</span>
                            </button>
                            <div className="flex items-center space-x-1.5 text-slate-500">
                              <User className="w-3 h-3" />
                              <span className="text-[10px]">{driver?.name?.split(' ')[0] || 'N/A'}</span>
                              {driver && <span className="text-emerald-400 text-[9px] font-bold">{driver.safetyScore}%</span>}
                            </div>
                          </div>
                        </td>

                        {/* Progress Bar */}
                        <td className="px-5 py-4 min-w-36">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className={`text-[9px] font-black uppercase tracking-wider ${isDelayed ? 'text-red-400' : 'text-emerald-400'}`}>
                                {trip.status.toUpperCase()}
                              </span>
                              <span className="text-[10px] font-bold text-slate-300">{progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                className={`h-full rounded-full ${isDelayed ? 'bg-gradient-to-r from-red-600 to-orange-500' : 'bg-gradient-to-r from-blue-600 to-indigo-500'}`}
                              />
                            </div>
                            {vehicle && (
                              <div className="text-[9px] text-slate-600">
                                {vehicle.gps.speed.toFixed(0)} km/h · {Math.round(vehicle.currentFuel)}L fuel
                              </div>
                            )}
                          </div>
                        </td>

                        {/* P&L */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-emerald-400">
                              ₹{trip.financials.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-[9px] text-slate-500 mt-0.5">
                              Rev: ₹{trip.financials.revenue?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '—'}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-center" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => setInjectingTripId(trip.id)}
                              className="px-2.5 py-1.5 text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 rounded-lg transition-all flex items-center space-x-1"
                              title="Inject scenario anomaly"
                            >
                              <AlertOctagon className="w-3 h-3" />
                              <span>Anomaly</span>
                            </button>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </td>
                      </motion.tr>

                      {/* Expanded Details Row */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            key={`${trip.id}-expanded`}
                          >
                            <td colSpan={6} className="px-5 pb-4 bg-slate-900/20">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-800/40">
                                <div>
                                  <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold mb-1">Vehicle Health</p>
                                  <p className={`font-bold text-sm ${vehicle && vehicle.healthScore >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {vehicle?.healthScore ?? '—'}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold mb-1">Fuel Level</p>
                                  <p className="font-bold text-sm text-amber-400">
                                    {vehicle ? `${Math.round(vehicle.currentFuel)} / ${vehicle.fuelCapacity}L` : '—'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold mb-1">Engine Temp</p>
                                  <p className="font-bold text-sm text-blue-400">
                                    {vehicle ? `${vehicle.telemetry.engineTemp.toFixed(0)}°C` : '—'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold mb-1">Total Cost</p>
                                  <p className="font-bold text-sm text-slate-300">
                                    ₹{trip.financials.cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>

                      {/* Inject Anomaly Overlay */}
                      <AnimatePresence>
                        {isInjecting && (
                          <motion.tr
                            key={`${trip.id}-inject`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <td colSpan={6} className="px-5 pb-4 bg-slate-900/30">
                              <div className="pt-3 border-t border-slate-800/40">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                                    ⚠ Inject Scenario into {trip.id}
                                  </p>
                                  <button onClick={() => setInjectingTripId(null)} className="text-slate-600 hover:text-slate-400">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                  {INCIDENT_TYPES.map(inc => (
                                    <button
                                      key={inc.id}
                                      onClick={() => handleInject(trip.id, inc.id)}
                                      className={`py-2 px-2 text-[9px] font-bold border rounded-xl transition-all ${inc.color}`}
                                    >
                                      {inc.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TripStatusBoard;
