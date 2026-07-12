import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trip } from '../../types';
import { AlertOctagon, Compass, ShieldAlert, Sparkles } from 'lucide-react';

export const TripStatusBoard: React.FC = () => {
  const { trips, vehicles, drivers, injectIncident, setSelectedVehicleId } = useApp();
  const [injectingTripId, setInjectingTripId] = useState<string | null>(null);

  const activeTrips = (trips || []).filter(t => t.status === 'in-transit' || t.status === 'delayed');

  const handleInject = async (tripId: string, category: string) => {
    try {
      await injectIncident(tripId, category);
      setInjectingTripId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-4">
        <h3 className="text-sm font-extrabold text-slate-200 tracking-wider uppercase flex items-center space-x-2">
          <Compass className="w-4 h-4 text-blue-500 animate-spin-slow" />
          <span>Active Operations Board</span>
        </h3>
        <span className="px-3 py-1 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          {activeTrips.length} Active Shipments
        </span>
      </div>

      <div className="overflow-x-auto">
        {activeTrips.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            No active shipments currently on routes. Dispatch a vehicle from the <span className="text-blue-400 font-semibold">Smart Dispatch</span> workspace.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="pb-3 font-medium">Trip & Cargo</th>
                <th className="pb-3 font-medium">Route Path</th>
                <th className="pb-3 font-medium">Crew & Asset</th>
                <th className="pb-3 font-medium">Route Progress</th>
                <th className="pb-3 font-medium text-right">Net Profit</th>
                <th className="pb-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {activeTrips.map(trip => {
                const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                const driver = drivers.find(d => d.id === trip.driverId);
                const progress = Math.round((trip.currentRouteIndex / (trip.route.length - 1)) * 100);

                const statusColor = trip.status === 'delayed' 
                  ? 'bg-red-500/15 text-red-400 border-red-500/20' 
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';

                return (
                  <tr key={trip.id} className="text-slate-300 text-xs hover:bg-slate-900/10 transition-colors">
                    {/* Trip ID & Cargo */}
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-slate-200 text-sm">{trip.id}</span>
                        <span className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-wider">
                          {trip.cargoType} • {(trip.cargoWeight / 1000).toFixed(1)}t
                        </span>
                      </div>
                    </td>

                    {/* Route */}
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-350">{trip.origin.name.split(' ')[0]} ➔ {trip.destination.name.split(' ')[0]}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          ETA: {new Date(trip.estimatedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>

                    {/* Crew & Asset */}
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span 
                          onClick={() => setSelectedVehicleId(trip.vehicleId)}
                          className="font-bold text-blue-400 hover:underline cursor-pointer"
                        >
                          {trip.vehicleId} ({vehicle?.type.split(' ')[0] || 'Sprinter'})
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          {driver?.name || 'N/A'} (Score: {driver?.safetyScore}%)
                        </span>
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="py-4 min-w-36 pr-4">
                      <div className="flex flex-col space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className={trip.status === 'delayed' ? 'text-red-400' : 'text-emerald-400'}>
                            {trip.status.toUpperCase()}
                          </span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              trip.status === 'delayed' ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Financials */}
                    <td className="py-4 text-right">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-emerald-400 text-sm">
                          ${trip.financials.profit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">
                          Cost: ${trip.financials.cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </td>

                    {/* Anomaly Injector */}
                    <td className="py-4 text-center relative">
                      {injectingTripId === trip.id ? (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl z-30 grid grid-cols-2 gap-1.5 min-w-44">
                          {['accident', 'fuel_theft', 'maintenance', 'weather_risk', 'traffic_delay', 'speeding'].map(cat => (
                            <button
                              key={cat}
                              onClick={() => handleInject(trip.id, cat)}
                              className="py-1 px-1.5 text-[9px] font-bold text-slate-300 hover:text-white bg-slate-850 hover:bg-red-900/40 rounded border border-slate-800 transition-colors uppercase"
                            >
                              {cat.replace('_', ' ')}
                            </button>
                          ))}
                          <button
                            onClick={() => setInjectingTripId(null)}
                            className="col-span-2 mt-1 py-1 text-[9px] font-bold text-slate-400 hover:text-slate-200 border-t border-slate-800"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setInjectingTripId(trip.id)}
                          className="px-2.5 py-1 text-[10px] font-bold text-amber-400 hover:text-slate-950 bg-amber-500/10 hover:bg-amber-400 border border-amber-500/20 hover:border-amber-400 rounded-lg transition-all duration-150 flex items-center space-x-1 mx-auto"
                        >
                          <AlertOctagon className="w-3.5 h-3.5" />
                          <span>Inject Anomaly</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default TripStatusBoard;
