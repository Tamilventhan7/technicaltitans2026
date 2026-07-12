import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, ShieldAlert, Key, Globe, Eye, EyeOff, Save, Database, ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsPanel: React.FC = () => {
  const { role, resetDatabase, language, setLanguage } = useApp();

  // Form states
  const [orgName, setOrgName] = useState('TransitOps Global Carriers');
  const [apiKey, setApiKey] = useState('to_live_9201a88b1cc90d81b8e21a');
  const [showKey, setShowKey] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState('normal');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Notification toggles
  const [alerts, setAlerts] = useState({
    speeding: true,
    maintenance: true,
    fuelAnomaly: true,
    sos: true
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100 relative">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2.5">
          <Settings className="w-5.5 h-5.5 text-blue-400" />
          <span>Operations Configuration Panel</span>
        </h2>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
          Configure multi-tenant settings, API tokens, alerts thresholds, and digital twin values.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: General Profile & Keys (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Org form */}
          <div className="glass-panel p-6.5 rounded-3xl border border-slate-850">
            <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider mb-4 border-b border-slate-850 pb-3">
              Corporate Account Profile
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-slate-350">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Organization Name</label>
                <input 
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-widest">HQ Location Zone</label>
                  <input 
                    type="text"
                    defaultValue="Chicago Terminal Hub"
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-widest">System Language</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="en">English (US)</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Operations API Token (OBD-II Integration)</label>
                <div className="relative flex items-center bg-slate-950 border border-slate-850 focus-within:border-blue-500/30 rounded-xl overflow-hidden px-3.5 py-3 transition-colors">
                  <Key className="w-4 h-4 text-slate-500 mr-2.5" />
                  <input 
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    readOnly
                    className="flex-1 bg-transparent border-none text-slate-200 focus:outline-none font-mono"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="text-slate-500 hover:text-slate-400"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center space-x-2 transition-all active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>Save Settings Changes</span>
              </button>
            </form>
          </div>

          {/* Org database management */}
          {['Admin'].includes(role) && (
            <div className="glass-panel p-6.5 rounded-3xl border border-slate-850">
              <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider mb-4 border-b border-slate-850 pb-3 flex items-center space-x-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span>Data Core Operations</span>
              </h3>

              <div className="space-y-4">
                <p className="text-xs text-slate-450 leading-relaxed">
                  Reset the Digital Twin Mongoose database and re-inject default configurations (100 Vehicles, 200 Drivers, etc.) for testing.
                </p>
                <button
                  onClick={async () => {
                    if (confirm('Are you sure you want to reset all vehicle telemetry and active dispatch logs?')) {
                      await resetDatabase();
                      alert('Database seed reset completed.');
                    }
                  }}
                  className="px-4.5 py-2.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 border border-red-900/30 hover:border-red-900/50 rounded-xl text-xs font-bold transition-all"
                >
                  Force Re-Seed Database
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Alert Settings checkboxes (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6.5 rounded-3xl border border-slate-850">
          <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider mb-4 border-b border-slate-850 pb-3">
            Real-Time Alert Channels
          </h3>

          <div className="space-y-4 text-xs font-semibold text-slate-350">
            <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-850 rounded-2xl">
              <div>
                <span className="text-slate-200 font-bold block">Harsh Speeding Alerts</span>
                <span className="text-[9.5px] text-slate-500">Trigger warnings when trucks exceed 95 KM/H</span>
              </div>
              <input 
                type="checkbox"
                checked={alerts.speeding}
                onChange={() => setAlerts({ ...alerts, speeding: !alerts.speeding })}
                className="w-4 h-4 bg-slate-900 border-slate-800 rounded accent-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-850 rounded-2xl">
              <div>
                <span className="text-slate-200 font-bold block">Routine Maintenance Blocks</span>
                <span className="text-[9.5px] text-slate-500">Auto-lock dispatcher from scheduling vehicles on maintenance</span>
              </div>
              <input 
                type="checkbox"
                checked={alerts.maintenance}
                onChange={() => setAlerts({ ...alerts, maintenance: !alerts.maintenance })}
                className="w-4 h-4 bg-slate-900 border-slate-800 rounded accent-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-850 rounded-2xl">
              <div>
                <span className="text-slate-200 font-bold block">Fuel Theft Alerts</span>
                <span className="text-[9.5px] text-slate-500">Trigger warnings when fill logs show capacity mismatch</span>
              </div>
              <input 
                type="checkbox"
                checked={alerts.fuelAnomaly}
                onChange={() => setAlerts({ ...alerts, fuelAnomaly: !alerts.fuelAnomaly })}
                className="w-4 h-4 bg-slate-900 border-slate-800 rounded accent-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-850 rounded-2xl">
              <div>
                <span className="text-slate-200 font-bold block">Emergency Driver SOS</span>
                <span className="text-[9.5px] text-slate-500">Instantly pop up a red warning alert on active dispatcher monitors</span>
              </div>
              <input 
                type="checkbox"
                checked={alerts.sos}
                onChange={() => setAlerts({ ...alerts, sos: !alerts.sos })}
                className="w-4 h-4 bg-slate-900 border-slate-800 rounded accent-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Save Toast notification */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-2xl flex items-center space-x-2.5 text-xs font-bold shadow-xl shadow-emerald-500/5 animate-bounce">
          <ShieldCheck className="w-5 h-5" />
          <span>General settings saved successfully.</span>
        </div>
      )}

    </div>
  );
};
export default SettingsPanel;
