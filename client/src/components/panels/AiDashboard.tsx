import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Brain, Leaf, HeartPulse, ShieldAlert, TrendingUp, AlertTriangle, Lightbulb, BadgeCheck
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';
import { useApp } from '../../context/AppContext';

export const AiDashboard: React.FC = () => {
  const { kpis, vehicles, drivers, alerts } = useApp();
  const [activeTab, setActiveTab] = useState<'financial' | 'carbon'>('financial');

  // Chart seed data
  const forecastData = [
    { name: 'Jan', revenue: 42000, expenses: 31000, projectedRevenue: 42000, projectedExpenses: 31000 },
    { name: 'Feb', revenue: 45000, expenses: 32500, projectedRevenue: 45000, projectedExpenses: 32500 },
    { name: 'Mar', revenue: 49000, expenses: 34000, projectedRevenue: 49000, projectedExpenses: 34000 },
    { name: 'Apr', revenue: 53000, expenses: 35200, projectedRevenue: 53000, projectedExpenses: 35200 },
    { name: 'May', revenue: 58000, expenses: 37500, projectedRevenue: 58000, projectedExpenses: 37500 },
    { name: 'Jun', revenue: 64000, expenses: 39000, projectedRevenue: 65200, projectedExpenses: 38800 },
    { name: 'Jul', revenue: null, expenses: null, projectedRevenue: 72000, projectedExpenses: 39800 },
    { name: 'Aug', revenue: null, expenses: null, projectedRevenue: 78000, projectedExpenses: 41200 },
  ];

  const carbonData = [
    { name: 'Wk 1', emissions: 1200 },
    { name: 'Wk 2', emissions: 1100 },
    { name: 'Wk 3', emissions: 980 },
    { name: 'Wk 4', emissions: 850 },
  ];

  const aiRecommendations = [
    { id: 1, type: 'maintenance', msg: 'Vehicle TRK-02 mechanical health index declined to 78%. Perform routine oil replacement.', confidence: 96, action: 'Schedule Service' },
    { id: 2, type: 'safety', msg: 'Driver Mark Davis has logged 10 consecutive hours. Recommend fatigue rest break.', confidence: 98, action: 'Notify Dispatch' },
    { id: 3, type: 'efficiency', msg: 'Route deviation detected on TRIP-102. Re-routing via highway 80 saves 18L fuel.', confidence: 91, action: 'Approve Reroute' },
    { id: 4, type: 'savings', msg: 'Bulk fuel purchases at station Cleveland-West qualify for a 12% group discount.', confidence: 87, action: 'View Deal' }
  ];

  // Calculate stats
  const activeAlerts = alerts.filter(a => !a.resolved);
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');

  return (
    <div className="space-y-8 font-sans text-slate-100">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2.5">
          <Brain className="w-5.5 h-5.5 text-blue-400" />
          <span>Predictive AI Command Board</span>
        </h2>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
          Machine Learning Telemetry Projections & Operations Optimization
        </p>
      </div>

      {/* Grid KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Fleet Health Meter */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-850 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Fleet Health Score</span>
            <HeartPulse className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="my-4.5 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-100 font-mono">{kpis?.fleetHealthAvg || 92}%</span>
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Excellent</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            Calculated across mechanical inspections, engine heat, and brake sensor records.
          </p>
        </div>

        {/* Carbon emissions */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-850 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">CO2 Reductions</span>
            <Leaf className="w-5 h-5 text-green-400" />
          </div>
          <div className="my-4.5 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-100 font-mono">1.8T</span>
            <span className="text-xs text-green-400 font-bold uppercase tracking-wider">Offset</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            Saves 420kg carbon emissions this week through optimized AI routing paths.
          </p>
        </div>

        {/* Financial forecast profit */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-850 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Revenue Forecast</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div className="my-4.5 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-100 font-mono">+$72K</span>
            <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Confidence 94%</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            Projected revenue next month based on historical shipping contract volume.
          </p>
        </div>

        {/* Risk profile alert meter */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-850 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Network Risk Index</span>
            <ShieldAlert className="w-5 h-5 text-amber-500" />
          </div>
          <div className="my-4.5 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-100 font-mono">Medium</span>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">2 Criticals</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            Active weather warnings in central logistics routes and 2 vehicles pending service.
          </p>
        </div>

      </div>

      {/* Main Charts & Recommendations sections */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Charts area (8 cols) */}
        <div className="xl:col-span-8 glass-panel p-6.5 rounded-3xl border border-slate-850 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-4">
            <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider">AI Projected Operations</h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => setActiveTab('financial')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'financial' ? 'bg-blue-600 text-white shadow' : 'bg-slate-900 text-slate-450 hover:bg-slate-850'}`}
              >
                Financials Forecast
              </button>
              <button 
                onClick={() => setActiveTab('carbon')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === 'carbon' ? 'bg-blue-600 text-white shadow' : 'bg-slate-900 text-slate-450 hover:bg-slate-850'}`}
              >
                Carbon Metrics
              </button>
            </div>
          </div>

          <div className="h-64 mt-2">
            {activeTab === 'financial' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="projectedRevenue" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" name="Projected Revenue" />
                  <Area type="monotone" dataKey="projectedExpenses" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" name="Projected Expenses" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={carbonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
                  <Bar dataKey="emissions" fill="#10b981" radius={[8, 8, 0, 0]} name="CO2 Emissions (KG)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* AI Recommendations Drawer (4 cols) */}
        <div className="xl:col-span-4 glass-panel p-6.5 rounded-3xl border border-slate-850 flex flex-col">
          <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider mb-4 border-b border-slate-850 pb-3 flex items-center space-x-1.5">
            <Sparkles className="w-4.5 h-4.5 text-blue-400 animate-pulse" />
            <span>AI Real-Time Insights</span>
          </h3>

          <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
            {aiRecommendations.map((rec) => (
              <div 
                key={rec.id} 
                className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl transition-all text-xs"
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Confidence {rec.confidence}%
                  </span>
                  <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{rec.msg}</p>
                <button className="mt-2 text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider">
                  {rec.action} ➔
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid listing Predicted Maintenance & Compliance Audits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Predicted Maintenance (Risk meter) */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-850">
          <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider mb-4 border-b border-slate-850 pb-3">
            Predictive Maintenance Schedule
          </h3>

          <div className="space-y-3">
            {vehicles.slice(0, 3).map((vehicle) => {
              const riskLevel = vehicle.healthScore < 80 ? 'Critical' : vehicle.healthScore < 90 ? 'Medium' : 'Low';
              const riskColor = riskLevel === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : riskLevel === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
              return (
                <div key={vehicle.id} className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-900/40 border border-slate-850">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200 text-xs">{vehicle.id} ({vehicle.type})</span>
                    <p className="text-[10px] text-slate-500 font-medium">Oil Change / Sensor Calibrations due at 122,000 KM</p>
                  </div>
                  <div className="text-right flex items-center space-x-3.5">
                    <span className={`px-2 py-0.5 text-[8.5px] font-black uppercase rounded-md border ${riskColor}`}>
                      {riskLevel} Risk
                    </span>
                    <span className="text-xs font-mono font-black text-slate-200">{vehicle.healthScore}% Health</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Smart Alerts Center */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-850">
          <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider mb-4 border-b border-slate-850 pb-3">
            Active Risk Alerts
          </h3>

          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-850 text-xs">
                <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                <div className="flex-1 space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-200 text-[11px] uppercase tracking-wider">{alert.category.replace('_', ' ')}</span>
                    <span className="text-[9px] text-slate-500 font-medium">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[11px] text-slate-350 leading-relaxed font-semibold">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
export default AiDashboard;
