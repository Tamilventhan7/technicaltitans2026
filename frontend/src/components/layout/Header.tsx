import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useSocket } from '../../context/SocketContext';
import { Bell, CloudLightning, ShieldCheck, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { kpis, alerts } = useApp();
  const socket = useSocket();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const connected = socket ? socket.connected : false;

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
          <div className="hidden lg:flex items-center space-x-4 text-xs font-medium border-l border-slate-800 pl-6">
            <span className="text-slate-500">Active Assets:</span>
            <span className="text-slate-200">{kpis.activeTripsCount} / 10 Trucks</span>
            <span className="text-slate-500">Health Index:</span>
            <span className="text-slate-200">{kpis.fleetHealthAvg}%</span>
          </div>
        )}
      </div>

      {/* Clock & Profile info */}
      <div className="flex items-center space-x-6">
        {/* System Time clock */}
        <div className="text-right">
          <div className="text-sm font-bold text-slate-200 tracking-wide font-mono">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center border border-blue-400/20 text-white">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-bold text-slate-200">Ops Command</div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Dispatcher #02</div>
          </div>
        </div>
      </div>
    </header>
  );
};
