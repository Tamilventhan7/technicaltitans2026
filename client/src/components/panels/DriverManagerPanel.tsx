import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Search, Trash2, Award, Mail, Phone, FileSignature, X, Star, BadgeAlert, ArrowUpRight
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
      
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2.5">
            <Users className="w-5.5 h-5.5 text-blue-400" />
            <span>Driver Roster Command</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Track driver license validity, safety indicators, and points levels.
          </p>
        </div>

        {['Admin', 'FleetManager', 'SafetyOfficer'].includes(role) && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-500/10 flex items-center space-x-2 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add Driver</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/40 p-4 border border-slate-850 rounded-2xl">
        <div className="md:col-span-2 relative flex items-center bg-slate-950/80 border border-slate-850 focus-within:border-blue-500/30 rounded-xl px-3 py-2 transition-colors">
          <Search className="w-4 h-4 text-slate-500 mr-2" />
          <input 
            type="text" 
            placeholder="Search by driver ID or name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-slate-200 focus:outline-none text-xs w-full"
          />
        </div>

        <div className="flex items-center text-xs text-slate-500 font-semibold px-2">
          Showing {filteredDrivers.length} of {drivers.length} drivers
        </div>
      </div>

      {/* Grid view Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((driver) => {
          const tierColors: Record<string, string> = {
            'Elite': 'from-purple-500 to-indigo-600 border-purple-500/30 text-purple-400',
            'Gold': 'from-amber-400 to-amber-600 border-amber-400/30 text-amber-400',
            'Silver': 'from-slate-400 to-slate-600 border-slate-400/30 text-slate-350',
            'Bronze': 'from-orange-500 to-orange-700 border-orange-500/30 text-orange-400'
          };
          const activeTierClass = tierColors[driver.gamification?.tier] || 'from-blue-600 to-indigo-500';

          return (
            <motion.div 
              layout
              key={driver.id}
              className="glass-panel p-6 rounded-3xl border border-slate-850 flex flex-col justify-between hover:border-slate-800 transition-all hover:scale-[1.01] duration-300 relative group"
            >
              <div>
                {/* Upper line: Avatar & ID & Status */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow border border-white/10">
                      {driver.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-100 group-hover:text-blue-400 transition-colors">{driver.name}</h4>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{driver.id}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-md text-[8.5px] font-black uppercase border ${
                    driver.status === 'available' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : driver.status === 'driving'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {driver.status}
                  </span>
                </div>

                {/* Performance stats section */}
                <div className="grid grid-cols-2 gap-3 text-xs border-y border-slate-850 py-4.5 my-4">
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase">Safety Index</span>
                    <span className={`font-extrabold ${driver.safetyScore > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {driver.safetyScore} / 100
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase">Reward points</span>
                    <span className="font-mono text-slate-200 font-bold flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" />
                      <span>{(driver.gamification?.points || 0).toLocaleString()} PTS</span>
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase">Gamified Tier</span>
                    <span className="font-semibold text-slate-200">{driver.gamification?.tier || 'Bronze'}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 font-bold uppercase">Shift Rating</span>
                    <span className="font-semibold text-slate-200">{driver.rating.toFixed(1)} ★</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2">
                <button 
                  onClick={() => setSelectedDriverId(driver.id)}
                  className="text-[10px] font-extrabold uppercase text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition-colors"
                >
                  <span>Profile analytics</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                {['Admin', 'FleetManager', 'SafetyOfficer'].includes(role) && (
                  <button 
                    onClick={() => handleDelete(driver.id)}
                    className="p-2 bg-red-950/10 hover:bg-red-950/20 text-red-500/80 hover:text-red-400 border border-red-950/20 rounded-xl transition-all"
                    title="Suspend Profile"
                  >
                    <Trash2 className="w-4 h-4" />
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
              className="bg-slate-900 border border-slate-800 max-w-md w-full p-6 rounded-3xl relative text-xs text-slate-350"
            >
              <button 
                onClick={() => setSelectedDriverId(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center pb-4 mb-4 border-b border-slate-850">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-lg mx-auto shadow-md border border-white/10 mb-3">
                  {selectedDriver.name.charAt(0)}
                </div>
                <h3 className="text-md font-extrabold text-slate-200">{selectedDriver.name}</h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{selectedDriver.id}</span>
              </div>

              <div className="space-y-3.5 my-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[9.5px]">CDL License</span>
                  <span className="font-mono text-slate-200 font-semibold">{selectedDriver.licenseNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[9.5px]">License Validity</span>
                  <span className="font-semibold text-slate-200">{new Date(selectedDriver.licenseExpiry).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[9.5px]">Phone Number</span>
                  <span className="font-semibold text-slate-200">{selectedDriver.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[9.5px]">Email Address</span>
                  <span className="font-semibold text-slate-200">{selectedDriver.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase text-[9.5px]">Total Transit Miles</span>
                  <span className="font-semibold text-slate-200 font-mono">{(selectedDriver.totalMiles || 1240).toLocaleString()} KM</span>
                </div>
              </div>

              {/* Achievements Badges */}
              <div className="pt-3 border-t border-slate-850">
                <span className="block text-[9.5px] text-slate-500 font-bold uppercase mb-2">Unlocked Badges</span>
                <div className="flex flex-wrap gap-2">
                  {(selectedDriver.gamification?.badges || ['Safe Driver', 'Fuel Saver']).map((badge, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-1 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-lg text-[9px] font-bold text-slate-300 flex items-center space-x-1"
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
              className="bg-slate-900 border border-slate-850 max-w-lg w-full p-8 rounded-3xl relative"
            >
              <button 
                onClick={() => setShowAddForm(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-md font-extrabold text-slate-100 flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>Register Roster Profile</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Configure license status and parameters</p>

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
                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Driver ID</label>
                    <input 
                      type="text"
                      value={driverId}
                      onChange={(e) => setDriverId(e.target.value)}
                      placeholder="e.g. DRV-08"
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Samuel Jackson"
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-widest">CDL License Number</label>
                  <input 
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. CDL-TX99210-A"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Phone Number</label>
                    <input 
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="555-019-9922"
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Email Address</label>
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="samuel@transitops.com"
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none"
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
