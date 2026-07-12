import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Search, Trash2, Award, Mail, Phone, X, Star, ArrowUpRight, Shield, AwardIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DriverManagerPanel: React.FC = () => {
  const { drivers, createDriver, deleteDriver, role } = useApp();

  // Search state
  const [search, setSearch] = useState('');
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [driverId, setDriverId] = useState('');
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Selected driver detail modal
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!driverId || !name || !licenseNumber || !phone || !email) {
      setErrorMsg('All fields are required to register a driver profile.');
      return;
    }

    setSubmitting(true);
    try {
      await createDriver({
        id: driverId,
        name,
        licenseNumber,
        phone,
        email
      });
      setSuccessMsg(`Driver ${name} successfully registered in roster databases.`);
      setDriverId('');
      setName('');
      setLicenseNumber('');
      setPhone('');
      setEmail('');
      setTimeout(() => {
        setShowAddForm(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register driver.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to suspend driver profile ${id}?`)) {
      try {
        await deleteDriver(id);
      } catch (err: any) {
        alert(err.message || 'Failed to suspend driver');
      }
    }
  };

  const selectedDriver = drivers.find(d => d.id === selectedDriverId);

  return (
    <div className="space-y-6 font-sans text-slate-100 relative">
      
      {/* Redesigned Header: Premium Linear Aesthetic */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-blue-500/10 border border-blue-500/25 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">Driver Roster & Shift Command</h2>
          </div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1.5 pl-9.5">
            Track pilot licensing validation timers, safety scoring parameters, and rewards tier status.
          </p>
        </div>

        {['Admin', 'FleetManager', 'SafetyOfficer'].includes(role) && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-500/10 flex items-center space-x-2 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Register Driver</span>
          </button>
        )}
      </div>

      {/* Redesigned Search & Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-850 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search roster by name, badge, or pilot ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-blue-500/40 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-200 outline-none transition-colors"
          />
        </div>

        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest bg-slate-950/40 border border-slate-850 px-3 py-1.5 rounded-lg">
          ACTIVE Roster: <span className="text-blue-400">{filteredDrivers.length} Pilots</span> / {drivers.length} Total
        </div>
      </div>

      {/* Redesigned Grid view: Obsidian Dark Futuristic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((driver) => {
          const tierColors: Record<string, { bg: string; text: string; border: string }> = {
            'Diamond': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
            'Gold': { bg: 'bg-amber-400/10', text: 'text-amber-400', border: 'border-amber-400/20' },
            'Silver': { bg: 'bg-slate-400/10', text: 'text-slate-350', border: 'border-slate-400/20' },
            'Bronze': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' }
          };
          const tierInfo = tierColors[driver.gamification?.tier] || { bg: 'bg-slate-800/10', text: 'text-slate-400', border: 'border-slate-800/20' };

          return (
            <motion.div 
              layout
              key={driver.id}
              className="glass-panel p-5 rounded-2.5xl border border-slate-850 hover:border-slate-800 flex flex-col justify-between hover:shadow-xl hover:shadow-blue-500/[0.02] transition-all hover:scale-[1.01] duration-300 relative group overflow-hidden"
            >
              {/* Shimmer top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div>
                {/* Upper line: Avatar & ID & Status */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 text-slate-300 flex items-center justify-center font-bold text-xs shadow-inner">
                      {driver.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs.5 text-slate-100 group-hover:text-blue-400 transition-colors">{driver.name}</h4>
                      <span className="text-[9.5px] text-slate-500 font-mono uppercase tracking-wider">{driver.id}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                    driver.status === 'available' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : driver.status === 'driving'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                  }`}>
                    {driver.status}
                  </span>
                </div>

                {/* Performance stats section */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-y border-slate-900 py-4 my-4 text-xs font-semibold">
                  <div>
                    <span className="block text-[8px] text-slate-500 font-black uppercase tracking-wider mb-0.5">Safety Index</span>
                    <span className={`text-[11.5px] font-mono font-extrabold ${driver.safetyScore >= 90 ? 'text-emerald-400' : driver.safetyScore >= 80 ? 'text-amber-400' : 'text-orange-400'}`}>
                      {driver.safetyScore} <span className="text-[9px] text-slate-500 font-normal">/ 100</span>
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-500 font-black uppercase tracking-wider mb-0.5">Reward points</span>
                    <span className="font-mono text-slate-200 text-[11.5px] font-bold flex items-center space-x-1">
                      <Star className="w-3 h-3 text-amber-400 shrink-0" fill="currentColor" />
                      <span>{(driver.gamification?.points || 0).toLocaleString()}</span>
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-500 font-black uppercase tracking-wider mb-0.5">Gamified Tier</span>
                    <span className={`px-2 py-0.5 inline-block text-[8px] font-bold rounded-md uppercase border ${tierInfo.bg} ${tierInfo.text} ${tierInfo.border}`}>
                      {driver.gamification?.tier || 'Bronze'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-500 font-black uppercase tracking-wider mb-0.5">Shift Rating</span>
                    <span className="text-[11px] font-bold text-slate-300">{driver.rating.toFixed(1)} ★</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2">
                <button 
                  onClick={() => setSelectedDriverId(driver.id)}
                  className="text-[9.5px] font-extrabold uppercase tracking-wider text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition-colors"
                >
                  <span>Profile analytics</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>

                {['Admin', 'FleetManager', 'SafetyOfficer'].includes(role) && (
                  <button 
                    onClick={() => handleDelete(driver.id)}
                    className="p-1.5 bg-red-950/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 border border-red-500/10 hover:border-red-500/20 rounded-lg transition-all"
                    title="Suspend Profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Driver profile Details Modal */}
      <AnimatePresence>
        {selectedDriverId && selectedDriver && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-850 max-w-md w-full p-6 rounded-3xl relative text-xs text-slate-400"
            >
              <button 
                onClick={() => setSelectedDriverId(null)}
                className="absolute top-4 right-4 p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center pb-4 mb-4 border-b border-slate-900">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-md mx-auto shadow-md border border-white/10 mb-3">
                  {selectedDriver.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                </div>
                <h3 className="text-sm font-bold text-slate-200">{selectedDriver.name}</h3>
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">{selectedDriver.id}</span>
              </div>

              <div className="space-y-3.5 my-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[8px] tracking-wider">CDL License</span>
                  <span className="font-mono text-slate-200 font-semibold">{selectedDriver.licenseNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[8px] tracking-wider">License Validity</span>
                  <span className="font-semibold text-slate-200">{new Date(selectedDriver.licenseExpiry).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[8px] tracking-wider">Phone Number</span>
                  <span className="font-semibold text-slate-200">{selectedDriver.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[8px] tracking-wider">Email Address</span>
                  <span className="font-semibold text-slate-200">{selectedDriver.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[8px] tracking-wider">Total Transit Miles</span>
                  <span className="font-semibold text-slate-200 font-mono">{(selectedDriver.totalMiles || 1240).toLocaleString()} KM</span>
                </div>
              </div>

              {/* Achievements Badges */}
              <div className="pt-3 border-t border-slate-900">
                <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider mb-2.5">Unlocked Badges</span>
                <div className="flex flex-wrap gap-2">
                  {(selectedDriver.gamification?.badges || ['Safe Driver', 'Fuel Saver']).map((badge, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 bg-slate-900/60 border border-slate-850 hover:border-slate-800 rounded-lg text-[8.5px] font-bold text-slate-350 flex items-center space-x-1"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>{badge}</span>
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Driver Modal Form */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-slate-950 border border-slate-850 max-w-lg w-full p-8 rounded-3xl relative"
            >
              <button 
                onClick={() => setShowAddForm(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-sm.5 font-bold text-slate-100 flex items-center space-x-2">
                <Users className="w-4.5 h-4.5 text-blue-400" />
                <span>Register Driver Profile</span>
              </h3>
              <p className="text-[9.5px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Configure license validity status and parameters</p>

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

              <form onSubmit={handleAddDriverSubmit} className="mt-6 space-y-4 text-xs font-semibold text-slate-350">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[8px] text-slate-500 uppercase tracking-widest font-black">Driver ID</label>
                    <input 
                      type="text"
                      value={driverId}
                      onChange={(e) => setDriverId(e.target.value)}
                      placeholder="e.g. DRV-08"
                      className="w-full bg-slate-900 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[8px] text-slate-500 uppercase tracking-widest font-black">Full Name</label>
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Samuel Jackson"
                      className="w-full bg-slate-900 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[8px] text-slate-500 uppercase tracking-widest font-black">CDL License Number</label>
                  <input 
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. CDL-TX99210-A"
                    className="w-full bg-slate-900 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[8px] text-slate-500 uppercase tracking-widest font-black">Phone Number</label>
                    <input 
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="555-019-9922"
                      className="w-full bg-slate-900 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[8px] text-slate-500 uppercase tracking-widest font-black">Email Address</label>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="samuel@transitops.com"
                      className="w-full bg-slate-900 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none"
                    />
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
                    <span>Register Driver Profile</span>
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
export default DriverManagerPanel;
