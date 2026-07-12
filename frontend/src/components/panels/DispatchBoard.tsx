import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DispatchRecommendation } from '../../types';
import { Send, Sparkles, Brain, Award, ShieldCheck, ArrowRight } from 'lucide-react';

export const DispatchBoard: React.FC = () => {
  const { warehouses, dispatchTrip } = useApp();
  
  const [origin, setOrigin] = useState('WH-CHI');
  const [destination, setDestination] = useState('WH-NYC');
  const [cargoType, setCargoType] = useState('hazmat');
  const [cargoWeight, setCargoWeight] = useState(12000);
  
  const [recommendations, setRecommendations] = useState<DispatchRecommendation[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [dispatching, setDispatching] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  // Automatically trigger recommendation audit on form change
  const fetchRecommendations = async () => {
    setLoadingOptions(true);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${backendUrl}/api/ai/dispatch-recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originId: origin,
          destinationId: destination,
          cargoWeightKG: Number(cargoWeight),
          cargoType
        })
      });
      const data = await res.json();
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [origin, destination, cargoType, cargoWeight]);

  const handleDispatch = async (rec: DispatchRecommendation) => {
    setDispatching(rec.vehicle.id);
    try {
      await dispatchTrip({
        originId: origin,
        destinationId: destination,
        vehicleId: rec.vehicle.id,
        driverId: rec.driver.id,
        cargoType,
        cargoWeightKG: Number(cargoWeight)
      });
      setSuccessMsg(`Successfully Dispatched Trip ${rec.vehicle.id} with Driver ${rec.driver.name}!`);
      setRecommendations([]);
      // Reload lists
      fetchRecommendations();
    } catch (err: any) {
      alert(err.message || 'Dispatch failure');
    } finally {
      setDispatching(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-400" />
            <span>AI Smart Dispatch Control</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Optimized Asset Matching & Route Selection
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Dispatch Options Input Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4 h-fit">
          <h3 className="text-sm font-extrabold text-slate-200 tracking-wider uppercase border-b border-slate-850 pb-3 mb-4">
            Order Configuration
          </h3>

          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Origin Warehouse</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Destination Hub</label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {warehouses.filter(w => w.id !== origin).map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Cargo Classification</label>
              <select
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="standard">Standard Dry Freight</option>
                <option value="cold-chain">Cold Chain Reefers</option>
                <option value="hazmat">Chemicals (HazMat)</option>
                <option value="high-value">High Value Electronics</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Cargo Payload Weight (KG)</label>
              <input
                type="number"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
                min="500"
                max="25000"
              />
            </div>
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>AI Operations Scored Pairings</span>
            </h4>
            {loadingOptions && (
              <span className="text-[10px] text-slate-500 animate-pulse">Running scoring matrix...</span>
            )}
          </div>

          {successMsg && (
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold shadow-lg animate-pulse flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {recommendations.length === 0 && !loadingOptions && !successMsg && (
            <div className="glass-panel p-10 rounded-2xl border border-slate-800 text-center text-slate-500 text-sm">
              No available assets matching payload requirement. Verify that drivers are available and vehicles are idle.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => {
              const borderStyles = index === 0 
                ? 'border-blue-500/30 bg-slate-900/30 shadow-[0_0_20px_rgba(59,130,246,0.06)]' 
                : 'border-slate-800 bg-slate-900/10';

              return (
                <div key={rec.vehicle.id} className={`glass-panel p-5 rounded-2xl border ${borderStyles} flex flex-col justify-between hover:border-slate-700 transition-all duration-200`}>
                  
                  {/* Match Rating */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        index === 0 
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {index === 0 ? 'AI Top Recommendation' : `Option Rank #${index + 1}`}
                      </span>
                      <span className="font-extrabold text-sm text-slate-100">{rec.matchScore}% Match</span>
                    </div>

                    {/* Reasoning */}
                    <p className="text-[11px] text-slate-400 italic mb-4 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                      "{rec.reasoning}"
                    </p>

                    {/* Entities Details */}
                    <div className="space-y-3 mb-6 border-b border-slate-850 pb-4">
                      <div>
                        <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Assigned Asset</div>
                        <div className="text-xs font-bold text-slate-200 mt-0.5">{rec.vehicle.id} • {rec.vehicle.type}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Health Score: {rec.vehicle.healthScore}% | Fuel Capacity: {rec.vehicle.fuelCapacity}L</div>
                      </div>

                      <div>
                        <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Assigned Driver</div>
                        <div className="text-xs font-bold text-slate-200 mt-0.5">{rec.driver.name}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Safety Index: {rec.driver.safetyScore}% | Tier: {rec.driver.gamification.tier}</div>
                      </div>
                    </div>

                    {/* Estimates details */}
                    <div className="grid grid-cols-2 gap-3 mb-6 text-xs bg-slate-950/20 p-3 rounded-xl border border-slate-850">
                      <div>
                        <span className="text-slate-500 text-[10px]">Est. Distance</span>
                        <div className="font-bold text-slate-300 mt-0.5">{rec.estimatedDistanceKM} KM</div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px]">Trip Hours</span>
                        <div className="font-bold text-slate-300 mt-0.5">{rec.estimatedDurationHours} Hours</div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px]">Expected Fuel</span>
                        <div className="font-bold text-slate-300 mt-0.5">{rec.expectedFuelLiters} L</div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px]">Expected Profit</span>
                        <div className="font-extrabold text-emerald-400 mt-0.5">${rec.expectedProfitUSD}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={dispatching !== null}
                    onClick={() => handleDispatch(rec)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition-all duration-200 ${
                      index === 0 
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <span>{dispatching === rec.vehicle.id ? 'Dispatching...' : 'Approve & Dispatch'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DispatchBoard;
