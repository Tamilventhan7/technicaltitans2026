import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Fuel, Plus, AlertTriangle, TrendingDown, TrendingUp, BarChart3, Leaf,
  DollarSign, X, CheckCircle, Flame, Activity, Calendar
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell
} from 'recharts';
import { useApp } from '../../context/AppContext';

const TooltipStyle = {
  backgroundColor: 'rgba(8,12,24,0.97)', borderColor: 'rgba(255,255,255,0.07)',
  borderRadius: '12px', color: '#f1f5f9', fontSize: '11px',
  boxShadow: '0 16px 40px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.07)'
};

const HEATMAP_DATA = [
  ['Mon', 48, 52, 44, 60],
  ['Tue', 55, 47, 62, 38],
  ['Wed', 41, 58, 50, 45],
  ['Thu', 62, 53, 48, 55],
  ['Fri', 70, 61, 55, 68],
  ['Sat', 35, 30, 28, 40],
  ['Sun', 28, 25, 22, 33],
];

const heatColor = (v: number) => {
  if (v >= 65) return 'bg-red-500/70 border-red-500/40';
  if (v >= 50) return 'bg-orange-500/50 border-orange-500/30';
  if (v >= 35) return 'bg-amber-500/40 border-amber-500/25';
  return 'bg-slate-700/40 border-slate-700/20';
};

export const FuelPanel: React.FC = () => {
  const { vehicles } = useApp();
  const [activeTab, setActiveTab] = useState<'analytics' | 'theft' | 'heatmap' | 'carbon'>('analytics');
  const [showAddForm, setShowAddForm] = useState(false);
  const [targetVehicle, setTargetVehicle] = useState(vehicles[0]?.id || '');
  const [liters, setLiters] = useState(120);
  const [amount, setAmount] = useState(11500);
  const [station, setStation] = useState('Shell Route-80 North');

  const [records, setRecords] = useState([
    { id: 'FUEL-901', vehicleId: 'TRK-01', date: '2026-07-11', liters: 140, cost: 13500, station: 'BP Express East', kmpl: 4.2 },
    { id: 'FUEL-902', vehicleId: 'TRK-02', date: '2026-07-09', liters: 160, cost: 15200, station: 'Shell Ohio West', kmpl: 3.8 },
    { id: 'FUEL-903', vehicleId: 'TRK-03', date: '2026-07-12', liters: 125, cost: 11800, station: 'BP Express East', kmpl: 4.5 },
    { id: 'FUEL-904', vehicleId: 'TRK-04', date: '2026-07-10', liters: 185, cost: 17200, station: 'Pilot Flying J', kmpl: 3.1 },
    { id: 'FUEL-905', vehicleId: 'TRK-05', date: '2026-07-08', liters: 110, cost: 10400, station: 'Loves Travel Stop', kmpl: 5.1 },
  ]);

  // Theft anomalies
  const anomalies = [
    { vehicleId: 'TRK-04', date: '2026-07-10', expected: 85, actual: 112, difference: 27, station: 'Pilot Flying J', risk: 'High', confidence: 94 },
    { vehicleId: 'TRK-07', date: '2026-07-09', expected: 60, actual: 78, difference: 18, station: 'Unknown Stop', risk: 'Medium', confidence: 78 },
    { vehicleId: 'TRK-01', date: '2026-07-07', expected: 140, actual: 165, difference: 25, station: 'BP Express East', risk: 'High', confidence: 89 },
  ];

  const trendData = [
    { name: '07/06', price: 92.5, volume: 340 },
    { name: '07/07', price: 93.0, volume: 420 },
    { name: '07/08', price: 93.8, volume: 380 },
    { name: '07/09', price: 93.2, volume: 460 },
    { name: '07/10', price: 93.5, volume: 510 },
    { name: '07/11', price: 94.1, volume: 490 },
    { name: '07/12', price: 94.6, volume: 370 },
  ];

  const totalCost = records.reduce((s, r) => s + r.cost, 0);
  const totalLiters = records.reduce((s, r) => s + r.liters, 0);
  const avgKmpl = (records.reduce((s, r) => s + r.kmpl, 0) / records.length).toFixed(2);
  const co2kg = Math.round(totalLiters * 2.68);

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    setRecords(prev => [{
      id: `FUEL-${Math.floor(100 + Math.random() * 900)}`,
      vehicleId: targetVehicle,
      date: new Date().toISOString().split('T')[0],
      liters, cost: amount, station, kmpl: 4.0
    }, ...prev]);
    setShowAddForm(false);
  };

  const TABS = [
    { id: 'analytics', label: 'Fuel Analytics', icon: BarChart3 },
    { id: 'theft', label: 'Theft Detection', icon: Flame },
    { id: 'heatmap', label: 'Usage Heatmap', icon: Activity },
    { id: 'carbon', label: 'Carbon Footprint', icon: Leaf },
  ] as const;

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-100 flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Fuel className="w-6 h-6 text-amber-400" />
            </div>
            <span>Fuel Intelligence Center</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 ml-14">Consumption analytics · Theft detection · Carbon emissions · Cost per KM</p>
        </div>
        <button onClick={() => setShowAddForm(true)}
          className="btn-primary text-sm">
          <Plus className="w-4 h-4" />
          <span>Log Fuel Fill</span>
        </button>
      </div>

      {/* ── KPI STRIP ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Fuel Cost', value: `₹${(totalCost / 1000).toFixed(1)}K`, sub: 'This week', icon: DollarSign, color: 'blue' },
          { label: 'Avg Efficiency', value: `${avgKmpl} km/L`, sub: 'Fleet average', icon: TrendingUp, color: 'emerald' },
          { label: 'Total Volume', value: `${totalLiters}L`, sub: 'Consumed', icon: Fuel, color: 'amber' },
          { label: 'CO₂ Emitted', value: `${(co2kg / 1000).toFixed(2)}T`, sub: 'This week', icon: Leaf, color: 'teal' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass-panel p-5 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{kpi.label}</span>
                <div className={`p-1.5 rounded-lg bg-${kpi.color}-500/10 border border-${kpi.color}-500/20`}>
                  <Icon className={`w-3.5 h-3.5 text-${kpi.color}-400`} />
                </div>
              </div>
              <p className="text-xl font-black text-slate-100 font-mono">{kpi.value}</p>
              <p className="text-[9px] text-slate-500 mt-1">{kpi.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* ── TABS ── */}
      <div className="flex items-center space-x-1 glass-panel p-1.5 rounded-2xl border border-slate-800 w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id ? 'bg-amber-500/15 text-amber-300 border border-amber-500/25' : 'text-slate-500 hover:text-slate-300'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>

          {/* ══════════ ANALYTICS ══════════ */}
          {activeTab === 'analytics' && (
            <div className="space-y-5">
              {/* Price Trend + Volume */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
                  <h3 className="text-xs font-bold text-slate-300 mb-4 flex items-center space-x-2">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>7-Day Fuel Price Trend (₹/L)</span>
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ left: -15, right: 5, top: 5, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                        <Tooltip contentStyle={TooltipStyle} formatter={(v: number) => [`₹${v.toFixed(2)}/L`, 'Price']} />
                        <Line type="monotone" dataKey="price" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
                  <h3 className="text-xs font-bold text-slate-300 mb-4 flex items-center space-x-2">
                    <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Daily Volume Consumed (L)</span>
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trendData} margin={{ left: -15, right: 5, top: 5, bottom: 0 }} barSize={20}>
                        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={TooltipStyle} formatter={(v: number) => [`${v}L`, 'Volume']} />
                        <Bar dataKey="volume" radius={[6, 6, 0, 0]} fill="#3b82f6" fillOpacity={0.8} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Records Table */}
              <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
                <div className="px-6 py-4 bg-slate-900/20 border-b border-slate-800/60 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-200">Fuel Ledger Records</h3>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{records.length} entries</span>
                </div>
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-slate-800/60 bg-slate-900/10">
                    {['Record ID', 'Vehicle', 'Date', 'Volume', 'Cost', 'Station', 'KM/L'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-widest text-slate-600">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {records.map((r, i) => (
                      <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className="border-b border-slate-800/30 hover:bg-slate-900/15 transition-colors">
                        <td className="px-5 py-3 text-slate-400 font-mono">{r.id}</td>
                        <td className="px-5 py-3 text-blue-400 font-bold">{r.vehicleId}</td>
                        <td className="px-5 py-3 text-slate-400 font-mono">{r.date}</td>
                        <td className="px-5 py-3 text-amber-400 font-bold">{r.liters}L</td>
                        <td className="px-5 py-3 text-emerald-400 font-bold">₹{r.cost.toLocaleString()}</td>
                        <td className="px-5 py-3 text-slate-400">{r.station}</td>
                        <td className="px-5 py-3">
                          <span className={`font-bold ${r.kmpl >= 4.5 ? 'text-emerald-400' : r.kmpl >= 3.5 ? 'text-amber-400' : 'text-red-400'}`}>
                            {r.kmpl} km/L
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════ THEFT DETECTION ══════════ */}
          {activeTab === 'theft' && (
            <div className="space-y-5">
              <div className="glass-panel p-6 rounded-2xl border border-red-900/30 bg-red-950/5">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <Flame className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">AI Fuel Theft Detection Engine</h3>
                    <p className="text-[10px] text-slate-500">Compares expected fill volume vs actual via GPS + odometer telemetry</p>
                  </div>
                  <span className="ml-auto px-2.5 py-1 text-[9px] font-black bg-red-500/15 text-red-400 border border-red-500/25 rounded-lg animate-pulse">
                    {anomalies.length} Anomalies Detected
                  </span>
                </div>

                <div className="space-y-4">
                  {anomalies.map((a, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className={`p-5 rounded-xl border ${a.risk === 'High' ? 'border-red-900/50 bg-red-950/20' : 'border-orange-900/40 bg-orange-950/10'}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-4">
                            <AlertTriangle className={`w-4 h-4 ${a.risk === 'High' ? 'text-red-400' : 'text-orange-400'}`} />
                            <span className="font-bold text-slate-200">{a.vehicleId}</span>
                            <span className="text-[9px] text-slate-500 font-mono">{a.date}</span>
                            <span className="text-[9px] text-slate-500">{a.station}</span>
                          </div>

                          {/* Comparison bars */}
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-slate-900/40 border border-slate-800/40 rounded-xl">
                              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Expected</p>
                              <p className="text-2xl font-black text-blue-400 font-mono">{a.expected}L</p>
                            </div>
                            <div className="text-center p-3 bg-red-950/30 border border-red-500/20 rounded-xl">
                              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Actual</p>
                              <p className="text-2xl font-black text-red-400 font-mono">{a.actual}L</p>
                            </div>
                            <div className={`text-center p-3 rounded-xl border ${a.risk === 'High' ? 'bg-red-950/40 border-red-500/30' : 'bg-orange-950/20 border-orange-500/20'}`}>
                              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Excess</p>
                              <p className={`text-2xl font-black font-mono ${a.risk === 'High' ? 'text-red-400' : 'text-orange-400'}`}>+{a.difference}L</p>
                            </div>
                          </div>

                          {/* Risk bar */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">AI Anomaly Score</span>
                            <span className={`text-[9px] font-black ${a.risk === 'High' ? 'text-red-400' : 'text-orange-400'}`}>{a.confidence}% confidence</span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${a.risk === 'High' ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${a.confidence}%` }} />
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 shrink-0">
                          <span className={`px-3 py-1.5 text-[10px] font-black rounded-xl border ${
                            a.risk === 'High' ? 'bg-red-500/15 border-red-500/30 text-red-400' : 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                          }`}>
                            🔴 {a.risk} Risk
                          </span>
                          <p className="text-[9px] text-slate-500 text-center">Possible fuel anomaly</p>
                          <button className="px-3 py-1.5 text-[9px] font-bold bg-slate-800/60 border border-slate-700/40 rounded-lg text-slate-300 hover:bg-slate-700/60 transition-all">
                            Flag for Review
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ HEATMAP ══════════ */}
          {activeTab === 'heatmap' && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
              <div className="flex items-center space-x-2 mb-5">
                <Activity className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-slate-200">Weekly Fuel Usage Heatmap (Liters/Fill)</h3>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  {/* Column headers */}
                  <div className="flex items-center mb-2">
                    <div className="w-12" />
                    {['TRK-01', 'TRK-02', 'TRK-03', 'TRK-04'].map(v => (
                      <div key={v} className="w-20 text-center text-[9px] font-black text-slate-500 uppercase tracking-wider">{v}</div>
                    ))}
                  </div>
                  {HEATMAP_DATA.map(([day, ...vals], i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      className="flex items-center mb-1.5">
                      <div className="w-12 text-[10px] text-slate-500 font-bold">{day}</div>
                      {(vals as number[]).map((v, j) => (
                        <div key={j} className={`w-20 h-10 mx-0.5 rounded-lg border flex items-center justify-center text-[10px] font-black transition-all hover:scale-105 cursor-default ${heatColor(v)}`}>
                          {v}L
                        </div>
                      ))}
                    </motion.div>
                  ))}
                  {/* Legend */}
                  <div className="flex items-center space-x-4 mt-4 pt-3 border-t border-slate-800/40">
                    <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">Legend:</span>
                    {[
                      { label: '<35L', cls: 'bg-slate-700/40 border-slate-700/20' },
                      { label: '35–50L', cls: 'bg-amber-500/40 border-amber-500/25' },
                      { label: '50–65L', cls: 'bg-orange-500/50 border-orange-500/30' },
                      { label: '>65L', cls: 'bg-red-500/70 border-red-500/40' },
                    ].map(l => (
                      <div key={l.label} className="flex items-center space-x-1.5">
                        <div className={`w-5 h-5 rounded border ${l.cls}`} />
                        <span className="text-[9px] text-slate-500 font-medium">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ CARBON ══════════ */}
          {activeTab === 'carbon' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { label: 'CO₂ This Week', value: `${(co2kg / 1000).toFixed(2)}T`, icon: Leaf, color: 'emerald', sub: '≈ 46 trees needed to offset' },
                  { label: 'CO₂ per KM', value: '1.82 kg', icon: TrendingDown, color: 'blue', sub: '21% below industry avg' },
                  { label: 'Green Score', value: '78 / 100', icon: CheckCircle, color: 'teal', sub: 'Above average fleet' },
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      className="glass-panel p-6 rounded-2xl border border-slate-800/80">
                      <div className={`p-2.5 rounded-xl border w-fit mb-3 bg-${card.color}-500/10 border-${card.color}-500/20`}>
                        <Icon className={`w-4 h-4 text-${card.color}-400`} />
                      </div>
                      <p className="text-2xl font-black text-slate-100 font-mono">{card.value}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1 font-bold">{card.label}</p>
                      <p className="text-[10px] text-emerald-400 mt-1.5 font-semibold">{card.sub}</p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
                <h3 className="text-xs font-bold text-slate-300 mb-4 flex items-center space-x-2">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CO₂ Emissions by Vehicle (kg/week)</span>
                </h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={records.map(r => ({ name: r.vehicleId, CO2: Math.round(r.liters * 2.68), fill: r.liters > 150 ? '#ef4444' : r.liters > 100 ? '#f59e0b' : '#10b981' }))}
                      margin={{ left: -10, right: 5, top: 5, bottom: 0 }} barSize={28}
                    >
                      <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={TooltipStyle} formatter={(v: number) => [`${v} kg CO₂`, 'Emissions']} />
                      <Bar dataKey="CO2" radius={[6, 6, 0, 0]}>
                        {records.map((r, i) => (
                          <Cell key={i} fill={r.liters > 150 ? '#ef4444' : r.liters > 100 ? '#f59e0b' : '#10b981'} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── ADD FUEL MODAL ── */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel border border-slate-800 max-w-md w-full p-7 rounded-3xl relative">
              <button onClick={() => setShowAddForm(false)} className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3 mb-5">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <Fuel className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Log Fuel Fill</h3>
                  <p className="text-[10px] text-slate-500">Record fuel purchase details</p>
                </div>
              </div>
              <form onSubmit={handleAddRecord} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Vehicle</label>
                  <select value={targetVehicle} onChange={e => setTargetVehicle(e.target.value)} className="input-field">
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.id} — {v.plateNumber}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Liters Filled</label>
                    <input type="number" value={liters} onChange={e => setLiters(+e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Total Cost (₹)</label>
                    <input type="number" value={amount} onChange={e => setAmount(+e.target.value)} className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Station Name</label>
                  <input type="text" value={station} onChange={e => setStation(e.target.value)} className="input-field" />
                </div>
                <button type="submit" className="btn-primary w-full justify-center">
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Fuel Log</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FuelPanel;
