import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Fuel, Plus, CheckCircle, AlertTriangle, BarChart3, TrendingDown, DollarSign, Calendar
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { useApp } from '../../context/AppContext';

export const FuelPanel: React.FC = () => {
  const { vehicles } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [targetVehicle, setTargetVehicle] = useState(vehicles[0]?.id || '');
  const [liters, setLiters] = useState(120);
  const [amount, setAmount] = useState(11500);
  const [station, setStation] = useState('Shell Route-80 North');

  // Sample fuel ledgers
  const [records, setRecords] = useState([
    { id: 'FUEL-901', vehicleId: 'TRK-01', date: '2026-07-11', liters: 140, cost: 13500, station: 'BP Express East', efficiency: 4.2 },
    { id: 'FUEL-902', vehicleId: 'TRK-02', date: '2026-07-09', liters: 160, cost: 15200, station: 'Shell Ohio West', efficiency: 3.8 },
    { id: 'FUEL-903', vehicleId: 'TRK-03', date: '2026-07-12', liters: 125, cost: 11800, station: 'BP Express East', efficiency: 4.5 },
  ]);

  // Fuel theft anomaly logs
  const anomalies = [
    { vehicleId: 'TRK-04', date: '2026-07-10', expected: 85, actual: 112, difference: 27, station: 'Pilot Flying J', risk: 'High' }
  ];

  const chartData = [
    { name: '07/07', price: 92.50 },
    { name: '07/08', price: 93.00 },
    { name: '07/09', price: 93.80 },
    { name: '07/10', price: 93.20 },
    { name: '07/11', price: 93.50 },
    { name: '07/12', price: 94.10 }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord = {
      id: `FUEL-${Math.floor(100 + Math.random() * 900)}`,
      vehicleId: targetVehicle,
      date: new Date().toISOString().split('T')[0],
      liters,
      cost: amount,
      station,
      efficiency: 4.1
    };
    setRecords([newRecord, ...records]);
    setShowAddForm(false);
  };

  const totalFuelCost = records.reduce((sum, r) => sum + r.cost, 0);
  const totalLiters = records.reduce((sum, r) => sum + r.liters, 0);

  return (
    <div className="space-y-6 font-sans text-slate-100 relative">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2.5">
            <Fuel className="w-5.5 h-5.5 text-blue-400" />
            <span>Fuel Analytics & Ledgers</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Analyze fuel spend, coordinate odometer metrics, and flag fill discrepancies.
          </p>
        </div>

        <button 
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-500/10 flex items-center space-x-2 transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Add Fuel Log</span>
        </button>
      </div>

      {/* Grid columns */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Stats (4 cols) */}
        <div className="xl:col-span-4 space-y-4">
          <div className="glass-panel p-5.5 rounded-2xl border border-slate-850">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Total Fuel Spend</span>
            <div className="mt-2.5 flex items-baseline space-x-1">
              <span className="text-emerald-400 font-bold text-sm mr-1">₹</span>
              <span className="text-2xl font-black text-slate-200 font-mono">{totalFuelCost.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal">
              Based on {records.length} refuel events logged.
            </p>
          </div>

          <div className="glass-panel p-5.5 rounded-2xl border border-slate-850">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Total Liters Fuelled</span>
            <div className="mt-2.5 flex items-baseline">
              <span className="text-2xl font-black text-slate-200 font-mono">{totalLiters.toLocaleString()}L</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal">
              Average efficiency: 4.1 KM/L across all vehicles.
            </p>
          </div>
        </div>

        {/* Center: Recharts Fuel trend (8 cols) */}
        <div className="xl:col-span-8 glass-panel p-6.5 rounded-3xl border border-slate-850">
          <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider mb-4 border-b border-slate-850 pb-3">
            Fuel Price Index Trends (₹/L)
          </h3>
          <div className="h-44 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[90, 96]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 3 }} name="Base Fuel Cost" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Anomaly Alerts & Table ledgers */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Ledgers (8 cols) */}
        <div className="md:col-span-8 glass-panel p-6 rounded-3xl border border-slate-850">
          <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider mb-4">Fuel Purchase Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 font-bold uppercase text-[9.5px]">
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">Refuel Date</th>
                  <th className="py-2.5 px-3">Liters</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Station</th>
                  <th className="py-2.5 px-3">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, idx) => (
                  <tr key={idx} className="border-b border-slate-850 hover:bg-slate-900/30 transition-colors">
                    <td className="py-2.5 px-3 font-extrabold text-blue-400">{r.vehicleId}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{r.date}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-200">{r.liters}L</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-200">₹{r.cost.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-semibold">{r.station}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{r.efficiency} KM/L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Theft anomaly (4 cols) */}
        <div className="md:col-span-4 glass-panel p-6 rounded-3xl border border-slate-850">
          <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider mb-4 flex items-center space-x-1">
            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
            <span>AI Theft Anomaly Logs</span>
          </h3>

          <div className="space-y-3">
            {anomalies.map((anom, idx) => (
              <div key={idx} className="p-3.5 bg-red-950/20 border border-red-500/20 rounded-2xl text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-extrabold text-slate-200">{anom.vehicleId}</span>
                  <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-[8px] font-black uppercase text-red-400">
                    {anom.risk} Risk
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                  Refuel at <strong>{anom.station}</strong> exceeded expected tank cap variance by <strong>{anom.difference} Liters</strong>.
                </p>
                <div className="text-[9.5px] text-slate-500 mt-2 font-mono">Timestamp: {anom.date}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Add Fuel form modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-slate-900 border border-slate-850 max-w-md w-full p-8 rounded-3xl relative"
            >
              <button 
                onClick={() => setShowAddForm(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white"
              >
                <XIcon />
              </button>

              <h3 className="text-md font-extrabold text-slate-100 flex items-center space-x-2">
                <Fuel className="w-5 h-5 text-blue-400" />
                <span>Log Fuel Transaction</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Log purchase metrics and totals</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs font-semibold text-slate-350">
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Select Target Vehicle</label>
                  <select 
                    value={targetVehicle}
                    onChange={(e) => setTargetVehicle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.id} ({v.type})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Purchased Fuel (L)</label>
                    <input 
                      type="number"
                      value={liters}
                      onChange={(e) => setLiters(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-mono font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Total cost (₹)</label>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Fuel Station Location</label>
                  <input 
                    type="text"
                    value={station}
                    onChange={(e) => setStation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center space-x-2 transition-all active:scale-98"
                >
                  <span>Submit Refuel Record</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default FuelPanel;
