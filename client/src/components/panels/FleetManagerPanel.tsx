import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, Plus, Search, Filter, Trash2, Calendar, FileText, BarChart2, QrCode, X, CheckCircle, ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FleetManagerPanel: React.FC = () => {
  const { vehicles, createVehicle, deleteVehicle, role } = useApp();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [vehicleId, setVehicleId] = useState('');
  const [vehicleType, setVehicleType] = useState<'Heavy Duty Truck' | 'Reefer' | 'Medium Cargo' | 'Sprinter Van'>('Heavy Duty Truck');
  const [plateNumber, setPlateNumber] = useState('');
  const [odometer, setOdometer] = useState(120000);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // QR Modal State
  const [qrVehicle, setQrVehicle] = useState<string | null>(null);

  // Filter vehicles list
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.id.toLowerCase().includes(search.toLowerCase()) || v.plateNumber.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || v.type === filterType;
    const matchesStatus = filterStatus === 'All' || v.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!vehicleId || !plateNumber) {
      setErrorMsg('Vehicle asset ID and license plate number are required.');
      return;
    }

    setSubmitting(true);
    try {
      await createVehicle({
        id: vehicleId,
        type: vehicleType,
        plateNumber,
        odometer
      });
      setSuccessMsg(`Vehicle ${vehicleId} successfully registered in operations command database.`);
      setVehicleId('');
      setPlateNumber('');
      setTimeout(() => {
        setShowAddForm(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register vehicle.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to retire vehicle asset ${id}?`)) {
      try {
        await deleteVehicle(id);
      } catch (err: any) {
        alert(err.message || 'Failed to delete vehicle');
      }
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-100 relative">
      
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2.5">
            <Truck className="w-5.5 h-5.5 text-blue-400" />
            <span>Fleet Registry Operations</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Maintain truck configurations, regulatory document status, and QR checks.
          </p>
        </div>

        {['Admin', 'FleetManager'].includes(role) && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-500/10 flex items-center space-x-2 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/40 p-4 border border-slate-850 rounded-2xl">
        <div className="relative flex items-center bg-slate-950/80 border border-slate-850 focus-within:border-blue-500/30 rounded-xl px-3 py-2 transition-colors">
          <Search className="w-4 h-4 text-slate-500 mr-2" />
          <input 
            type="text" 
            placeholder="Search by ID or plate..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-slate-200 focus:outline-none text-xs w-full"
          />
        </div>

        <div className="relative flex items-center bg-slate-950/80 border border-slate-850 focus-within:border-blue-500/30 rounded-xl px-3 py-2">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-2" />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-transparent border-none text-slate-300 focus:outline-none text-xs w-full cursor-pointer font-semibold"
          >
            <option value="All">All Types</option>
            <option value="Heavy Duty Truck">Heavy Duty Truck</option>
            <option value="Reefer">Reefer (Cold Chain)</option>
            <option value="Medium Cargo">Medium Cargo</option>
            <option value="Sprinter Van">Sprinter Van</option>
          </select>
        </div>

        <div className="relative flex items-center bg-slate-950/80 border border-slate-850 focus-within:border-blue-500/30 rounded-xl px-3 py-2">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-2" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent border-none text-slate-300 focus:outline-none text-xs w-full cursor-pointer font-semibold"
          >
            <option value="All">All Statuses</option>
            <option value="idle">Idle (Available)</option>
            <option value="in-transit">In Transit</option>
            <option value="maintenance">Maintenance</option>
            <option value="out-of-service">Out of Service</option>
          </select>
        </div>

        <div className="flex items-center text-xs text-slate-500 font-semibold px-2">
          Showing {filteredVehicles.length} of {vehicles.length} assets
        </div>
      </div>

      {/* Grid List Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => {
          const statusColors: Record<string, string> = {
            'idle': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'in-transit': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'maintenance': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            'out-of-service': 'bg-red-500/10 text-red-400 border-red-500/20'
          };

          return (
            <motion.div 
              layout
              key={vehicle.id}
              className="glass-panel p-6 rounded-3xl border border-slate-850 flex flex-col justify-between hover:border-slate-800 transition-all hover:scale-[1.01] duration-300 relative group"
            >
              <div>
                {/* Upper line: Type Icon & ID & Status */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-850">
                      <Truck className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-100">{vehicle.id}</h4>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{vehicle.type}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase border ${statusColors[vehicle.status] || 'bg-slate-900'}`}>
                    {vehicle.status.replace('-', ' ')}
                  </span>
                </div>

                {/* Grid details metrics */}
                <div className="grid grid-cols-2 gap-3 text-xs border-y border-slate-850 py-4.5 my-4">
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase">License Plate</span>
                    <span className="font-semibold text-slate-200">{vehicle.plateNumber}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase">Odometer</span>
                    <span className="font-mono text-slate-200 font-bold">{(vehicle.odometer).toLocaleString()} KM</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase">Health Score</span>
                    <span className={`font-extrabold ${vehicle.healthScore > 90 ? 'text-emerald-400' : vehicle.healthScore > 75 ? 'text-amber-400' : 'text-red-400'}`}>
                      {vehicle.healthScore}% {vehicle.healthScore > 90 ? '★★★★★' : '★★★☆☆'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase">Active Driver</span>
                    <span className="font-semibold text-slate-350">{vehicle.assignedDriver || 'None'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setQrVehicle(vehicle.id)}
                    className="p-2 hover:bg-slate-850/60 rounded-xl border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Generate QR Compliance Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
                {['Admin', 'FleetManager'].includes(role) && (
                  <button 
                    onClick={() => handleDelete(vehicle.id)}
                    className="p-2 bg-red-950/10 hover:bg-red-950/20 text-red-500/80 hover:text-red-400 border border-red-950/20 rounded-xl transition-all"
                    title="Retire Asset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* QR Code Compliance Modal */}
      <AnimatePresence>
        {qrVehicle && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 max-w-sm w-full p-6 rounded-3xl relative flex flex-col items-center text-center text-xs"
            >
              <button 
                onClick={() => setQrVehicle(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <QrCode className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-sm font-extrabold text-slate-200">Compliance QR Code: {qrVehicle}</h3>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs">
                Scan using virtual onboard camera scanners to pull telemetric profiles.
              </p>

              {/* Simulated QR Code box */}
              <div className="w-44 h-44 bg-white p-3 rounded-2xl my-6 flex justify-center items-center border border-slate-800 shadow-xl relative">
                {/* Custom grid mock mapping */}
                <div className="w-full h-full bg-slate-950 flex flex-col justify-between p-1.5 rounded-lg border border-slate-850">
                  <div className="flex justify-between">
                    <div className="w-10 h-10 border-4 border-white" />
                    <div className="w-10 h-10 border-4 border-white" />
                  </div>
                  <div className="text-[8px] font-mono text-white text-center font-bold tracking-widest">{qrVehicle}</div>
                  <div className="flex justify-between items-end">
                    <div className="w-10 h-10 border-4 border-white" />
                    <div className="w-4 h-4 bg-blue-500 rounded" />
                  </div>
                </div>
              </div>

              <div className="w-full p-3 rounded-xl bg-slate-950 border border-slate-850 text-left space-y-1.5">
                <div className="flex items-center space-x-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> <span className="font-semibold text-slate-350">Insurance Verification: Approved</span></div>
                <div className="flex items-center space-x-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> <span className="font-semibold text-slate-350">Fitness Verification: Approved</span></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Vehicle Modal Form */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-slate-900 border border-slate-850 max-w-lg w-full p-8 rounded-3xl relative"
            >
              <button 
                onClick={() => setShowAddForm(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-md font-extrabold text-slate-100 flex items-center space-x-2">
                <Truck className="w-5 h-5 text-blue-400" />
                <span>Register Operations Asset</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Configure vehicle metrics and specs</p>

              {errorMsg && (
                <div className="mt-4 p-3 rounded-xl bg-red-950/30 border border-red-500/20 text-xs font-bold text-red-400 text-center">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs font-bold text-emerald-400 text-center">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleAddVehicleSubmit} className="mt-6 space-y-4 text-xs font-semibold text-slate-350">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Asset Number (ID)</label>
                    <input 
                      type="text"
                      value={vehicleId}
                      onChange={(e) => setVehicleId(e.target.value)}
                      placeholder="e.g. TRK-08"
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Plate License Number</label>
                    <input 
                      type="text"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      placeholder="e.g. NY-9988-TRK"
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Asset Category Type</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="Heavy Duty Truck">Heavy Duty Truck</option>
                      <option value="Reefer">Reefer (Cold Chain)</option>
                      <option value="Medium Cargo">Medium Cargo</option>
                      <option value="Sprinter Van">Sprinter Van</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Starting Odometer (KM)</label>
                    <input 
                      type="number"
                      value={odometer}
                      onChange={(e) => setOdometer(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Simulated file upload area */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Regulatory documents (PDF/RC)</label>
                  <div className="border border-dashed border-slate-800 hover:border-blue-500/20 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/20">
                    <FileText className="w-7 h-7 text-slate-500 mb-2" />
                    <span className="text-[11px] text-slate-400">Drag and drop insurance contract or vehicle registration documents</span>
                    <span className="text-[9px] text-slate-650 mt-1">Accepts PDF, JPG up to 10MB</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center space-x-2 transition-all active:scale-98"
                >
                  {submitting ? (
                    <div className="w-4.5 h-4.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  ) : (
                    <span>Register Vehicle in Digital Twin</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default FleetManagerPanel;
