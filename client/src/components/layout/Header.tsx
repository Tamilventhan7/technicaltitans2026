import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useSocket } from '../../context/SocketContext';
import { Bell, CloudLightning, ShieldCheck, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { kpis, alerts, role, setRole, user, activeTab, setActiveTab } = useApp();
  const socket = useSocket();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const connected = socket ? socket.connected : false;

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as any;
    setRole(newRole);
    
    // Auto navigation depending on role capabilities
    if (newRole === 'Driver') {
      setActiveTab('driver-app');
    } else if (activeTab === 'driver-app') {
      // Driver page is forbidden to other roles, return to Command Center
      setActiveTab('dashboard');
    } else if (newRole === 'FinancialAnalyst' && !['dashboard', 'what-if'].includes(activeTab)) {
      setActiveTab('dashboard');
    } else if (newRole === 'SafetyOfficer' && !['dashboard', 'gamification'].includes(activeTab)) {
      setActiveTab('dashboard');
    } else if (newRole === 'Dispatcher' && !['dashboard', 'dispatch', 'customer'].includes(activeTab)) {
      setActiveTab('dashboard');
    } else if (newRole === 'FleetManager' && !['dashboard', 'dispatch', 'gamification'].includes(activeTab)) {
      setActiveTab('dashboard');
    }
  };

  return (
    <header className="h-20 glass-panel border-b border-slate-800 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10">
      {/* Search Bar / Context Status */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
          <span className="text-xs font-semibold text-slate-400">
            {connected ? 'Digital Twin Server Live' : 'Reconnecting to Simulator...'}
          </span>
        </div>

        {kpis && (
          <div className="hidden lg:flex items-center space-x-4 text-xs font-semibold border-l border-slate-850 pl-6">
            <span className="text-slate-500">Active Assets:</span>
            <span className="text-slate-200">{kpis.activeTripsCount} / 10 Trucks</span>
            <span className="text-slate-500">Health Index:</span>
            <span className="text-slate-200">{kpis.fleetHealthAvg}%</span>
          </div>
        )}
      </div>

      {/* Clock & Profile info */}
      <div className="flex items-center space-x-6">
        
        {/* Dynamic Role Switcher */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-850 p-2 rounded-xl text-xs">
          <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Simulate Role:</span>
          <select 
            value={role}
            onChange={handleRoleChange}
            className="bg-transparent border-none text-slate-200 focus:outline-none font-bold text-blue-400 cursor-pointer"
          >
            <option value="Admin">Admin</option>
            <option value="FleetManager">Fleet Manager</option>
            <option value="Dispatcher">Dispatcher</option>
            <option value="Driver">Driver</option>
            <option value="SafetyOfficer">Safety Officer</option>
            <option value="FinancialAnalyst">Financial Analyst</option>
          </select>
        </div>

        {/* System Time clock */}
        <div className="text-right hidden sm:block">
          <div className="text-sm font-bold text-slate-200 tracking-wide font-mono">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            {time.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>

        {/* Alerts Center indicator */}
        <div className="relative cursor-pointer p-2 hover:bg-slate-800/40 rounded-lg border border-transparent hover:border-slate-800 transition-all duration-150">
          <Bell className="w-5 h-5 text-slate-400 hover:text-slate-200" />
          {unresolvedAlerts.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[9px] font-extrabold flex items-center justify-center rounded-full animate-bounce">
              {unresolvedAlerts.length}
            </span>
          )}
        </div>

        {/* Profile Card */}
        <div className="flex items-center space-x-3 border-l border-slate-800 pl-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center border border-blue-400/20 text-white font-bold">
            {user?.name?.charAt(0) || 'O'}
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-black text-slate-200">{user?.name || 'Ops Command'}</div>
            <div className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider">{role} View</div>
          </div>
        </div>
      </div>
    </header>
  );
};
