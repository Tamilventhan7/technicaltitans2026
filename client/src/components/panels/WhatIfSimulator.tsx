import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sliders, Sparkles, AlertTriangle, TrendingDown, Clock, ShieldAlert } from 'lucide-react';

interface WhatIfReport {
  fuelCostIncreasePercent: number;
  projectedProfitDeltaUSD: number;
  expectedDelayedTripsCount: number;
  projectedSlaFulfillmentPercent: number;
  recommendation: string;
}

export const WhatIfSimulator: React.FC = () => {
  const { kpis } = useApp();
  
  const [fuelMultiplier, setFuelMultiplier] = useState(1.0);
  const [orderSpike, setOrderSpike] = useState(0);
  const [sickDrivers, setSickDrivers] = useState(0);
  const [weather, setWeather] = useState<'clear' | 'rain' | 'storm' | 'snow'>('clear');

  const [report, setReport] = useState<WhatIfReport | null>(null);
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  const runSimulationModel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/ai/what-if`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fuelPriceMultiplier: fuelMultiplier,
          orderVolumeSpike: orderSpike,
          activeDriversUnavailableCount: sickDrivers,
          weatherSeverity: weather
        })
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulationModel();
  }, [fuelMultiplier, orderSpike, sickDrivers, weather]);

  const fuelCostPercent = Math.round((fuelMultiplier - 1.0) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-blue-400" />
          <span>AI Operational What-If Simulator</span>
        </h2>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
          Predict Business Impact & Recalculate Operations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenarios Parameters */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-6">
          <h3 className="text-sm font-extrabold text-slate-200 tracking-wider uppercase border-b border-slate-850 pb-3 mb-4">
            Stress Test Parameters
          </h3>

          {/* Slider 1: Fuel Multiplier */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>Fuel Price Adjustment</span>
              <span className={fuelCostPercent >= 0 ? 'text-red-400' : 'text-emerald-400'}>
                {fuelCostPercent >= 0 ? `+${fuelCostPercent}%` : `${fuelCostPercent}%`}
              </span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="2.0" 
              step="0.05"
              value={fuelMultiplier}
              onChange={(e) => setFuelMultiplier(Number(e.target.value))}
              className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-semibold uppercase">
              <span>-50% Cost</span>
              <span>Baseline (1.0x)</span>
              <span>+100% Cost</span>
            </div>
          </div>

          {/* Slider 2: Order Spikes */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>Order Volume Spike</span>
              <span className="text-blue-400">+{orderSpike} Orders</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="30" 
              step="1"
              value={orderSpike}
              onChange={(e) => setOrderSpike(Number(e.target.value))}
              className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-semibold uppercase">
              <span>0 (Standard)</span>
              <span>+15 orders</span>
              <span>+30 orders</span>
            </div>
          </div>

          {/* Slider 3: Sick Drivers */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>Unavailable Crew (Sick List)</span>
              <span className="text-orange-400">{sickDrivers} Drivers</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="8" 
              step="1"
              value={sickDrivers}
              onChange={(e) => setSickDrivers(Number(e.target.value))}
              className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-semibold uppercase">
              <span>Full Roster</span>
              <span>4 Crew sick</span>
              <span>8 Crew sick</span>
            </div>
          </div>

          {/* Dropdown: Weather */}
          <div className="space-y-2">
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Simulated Weather System</label>
            <select
              value={weather}
              onChange={(e: any) => setWeather(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="clear">Clear Conditions</option>
              <option value="rain">Heavy Rainfall</option>
              <option value="storm">Severe Thunderstorms</option>
              <option value="snow">Blizzard & Snow Accumulations</option>
            </select>
          </div>
        </div>

        {/* AI Projection Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Projected SLA & Margin Deltas</span>
          </h3>

          {loading && !report ? (
            <div className="glass-panel p-16 rounded-2xl border border-slate-800 text-center text-slate-500 animate-pulse text-sm">
              Processing stress-test variables...
            </div>
          ) : report ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Profit Impact */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Profit Margin Delta</span>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className={`text-2xl font-extrabold ${report.projectedProfitDeltaUSD <= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {report.projectedProfitDeltaUSD <= 0 ? '' : '+'}${report.projectedProfitDeltaUSD.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">Projected Net</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-2 text-[10px] font-bold text-red-500/80 uppercase">
                  <TrendingDown className="w-4 h-4" />
                  <span>Increased Fuel Friction</span>
                </div>
              </div>

              {/* SLA Fulfillment */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Projected SLA Deliveries</span>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className={`text-2xl font-extrabold ${report.projectedSlaFulfillmentPercent < 85 ? 'text-red-400' : report.projectedSlaFulfillmentPercent < 95 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {report.projectedSlaFulfillmentPercent}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">SLA Guarantee</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>{report.expectedDelayedTripsCount} Trip Delay Risk Warnings</span>
                </div>
              </div>

              {/* AI Operational Recommendation Card */}
              <div className="glass-panel p-6 rounded-2xl border border-blue-900/30 bg-blue-950/5 md:col-span-2 flex flex-col space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-400 uppercase tracking-wide">
                  <ShieldAlert className="w-4 h-4 text-blue-400 animate-pulse" />
                  <span>Decision Engine Recommendation</span>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                  "{report.recommendation}"
                </p>
                <div className="text-[10px] text-slate-500 font-semibold border-t border-slate-800/60 pt-2.5">
                  AI Decision Engine updated calculations in real-time.
                </div>
              </div>

            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
export default WhatIfSimulator;
