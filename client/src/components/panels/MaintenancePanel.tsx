import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, Plus, Calendar, ShieldAlert, CheckCircle2, AlertCircle, DollarSign, Clock, UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MaintenancePanel: React.FC = () => {
  const { vehicles } = useApp();
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  // Form State
  const [targetVehicle, setTargetVehicle] = useState(vehicles[0]?.id || '');
  const [serviceType, setServiceType] = useState('Routine Oil Change');
  const [garage, setGarage] = useState('Central Workshop Hub');
  const [cost, setCost] = useState(25000);
  const [notes, setNotes] = useState('');

  // Sample static maintenance records
  const [logs, setLogs] = useState([
    { id: 'MNT-101', vehicleId: 'TRK-01', date: '2026-07-10', type: 'Routine Oil Change', cost: 18000, status: 'completed', garage: 'Central Workshop Hub', technician: 'Alice Smith' },
    { id: 'MNT-102', vehicleId: 'TRK-02', date: '2026-07-15', type: 'Brake Replacement', cost: 65000, status: 'scheduled', garage: 'East Coast Garage', technician: 'Bob Johnson' },
    { id: 'MNT-103', vehicleId: 'TRK-03', date: '2026-07-08', type: 'Engine Overhaul', cost: 240000, status: 'completed', garage: 'OEM Service Station', technician: 'Dave Miller' },
    { id: 'MNT-104', vehicleId: 'TRK-04', date: '2026-07-19', type: 'Sensor Calibration', cost: 35000, status: 'scheduled', garage: 'Central Workshop Hub', technician: 'Alice Smith' }
  ]);

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog = {
      id: `MNT-${Math.floor(100 + Math.random() * 900)}`,
      vehicleId: targetVehicle,
      date: new Date().toISOString().split('T')[0],
      type: serviceType,
      cost,
      status: 'scheduled',
      garage,
      technician: 'Alice Smith'
    };
    setLogs([newLog, ...logs]);
    setShowScheduleForm(false);
  };

  const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
  const pendingCount = logs.filter(l => l.status === 'scheduled').length;
  const completedCount = logs.filter(l => l.status === 'completed').length;

  return (
    <div className="space-y-6 font-sans text-slate-100 relative">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2.5">
            <Wrench className="w-5.5 h-5.5 text-blue-400" />
            <span>Mechanical Maintenance Command</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Track service intervals, scheduled repairs, and historical expenses.
          </p>
        </div>

        <button 
          onClick={() => setShowScheduleForm(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-500/10 flex items-center space-x-2 transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Service</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="glass-panel p-5 rounded-2xl border border-slate-850">
          <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block">Cumulative Expenses</span>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-emerald-400 font-bold text-sm mr-1">₹</span>
            <span className="text-2xl font-extrabold text-slate-200 font-mono">{totalCost.toLocaleString()}</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-850">
          <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block">Scheduled Services</span>
          <div className="mt-2 flex items-baseline space-x-1">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-2xl font-extrabold text-slate-200 font-mono">{pendingCount}</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-850">
          <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block">Completed Services</span>
          <div className="mt-2 flex items-baseline space-x-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-2xl font-extrabold text-slate-200 font-mono">{completedCount}</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-850">
          <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block">Service Alerts</span>
          <div className="mt-2 flex items-baseline space-x-1">
            <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="text-2xl font-extrabold text-slate-200 font-mono">
              {vehicles.filter(v => v.healthScore < 80).length}
            </span>
          </div>
        </div>

      </div>

      {/* Services List Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-850">
        <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider mb-4">Maintenance Ledgers</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-850 text-slate-400 font-bold uppercase text-[9.5px]">
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-4">Vehicle ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Repair Type</th>
                <th className="py-3 px-4">Garage & Tech</th>
                <th className="py-3 px-4">Cost</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-850 hover:bg-slate-900/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-200">{log.id}</td>
                  <td className="py-3 px-4 font-semibold text-blue-400">{log.vehicleId}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{log.date}</td>
                  <td className="py-3 px-4 font-bold text-slate-200">{log.type}</td>
                  <td className="py-3 px-4 text-slate-400">
                    <span className="font-semibold block">{log.garage}</span>
                    <span className="text-[10px] text-slate-500">{log.technician}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-200">₹{log.cost.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase border ${
                      log.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Form Modal */}
      <AnimatePresence>
        {showScheduleForm && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-slate-900 border border-slate-850 max-w-md w-full p-8 rounded-3xl relative"
            >
              <button 
                onClick={() => setShowScheduleForm(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white"
              >
                <XIcon />
              </button>

              <h3 className="text-md font-extrabold text-slate-100 flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                <span>Schedule Service Ticket</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Assign garage location and task</p>

              <form onSubmit={handleScheduleSubmit} className="mt-6 space-y-4 text-xs font-semibold text-slate-350">
                
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
                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Service Task Type</label>
                    <select 
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="Routine Oil Change">Routine Oil Change</option>
                      <option value="Brake Replacement">Brake Replacement</option>
                      <option value="Engine Overhaul">Engine Overhaul</option>
                      <option value="Tire Rotation">Tire Rotation</option>
                      <option value="Sensor Calibration">Sensor Calibration</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Estimated Cost (₹)</label>
                    <input 
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Select Garage</label>
                  <input 
                    type="text"
                    value={garage}
                    onChange={(e) => setGarage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center space-x-2 transition-all active:scale-98"
                >
                  <span>Submit Ticket Schedule</span>
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

export default MaintenancePanel;
