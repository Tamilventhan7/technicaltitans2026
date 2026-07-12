import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Send, 
  Sliders, 
  Trophy, 
  Users, 
  Smartphone, 
  RotateCcw, 
  Gauge 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, alerts, kpis, setSimulationSpeed, resetDatabase } = useApp();

  const activeAlertsCount = alerts.filter(a => !a.resolved).length;

  const menuItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, badge: activeAlertsCount > 0 ? activeAlertsCount : undefined },
    { id: 'dispatch', label: 'Smart Dispatch', icon: Send },
    { id: 'what-if', label: 'What-If Simulator', icon: Sliders },
    { id: 'gamification', label: 'Driver Leaderboard', icon: Trophy },
    { id: 'customer', label: 'Customer Portal', icon: Users },
    { id: 'driver-app', label: 'Driver Mobile App', icon: Smartphone }
  ];

  const multipliers = [1, 5, 10, 60];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex flex-col">
        <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
          TransitOps AI+
        </h1>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
          Digital Twin FMS v1.0
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-bold bg-red-500/20 text-red-400 rounded-full border border-red-500/30 animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Simulation Engine Controls */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Gauge className="w-3.5 h-3.5 text-blue-400" />
            <span>Simulation Speed</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {multipliers.map(mult => {
              const isActive = (kpis?.multiplier || 1) === mult;
              return (
                <button
                  key={mult}
                  onClick={() => setSimulationSpeed(mult)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition-all duration-150 ${
                    isActive 
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md' 
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {mult}x
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={resetDatabase}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 border border-red-900/30 hover:border-red-900/50 rounded-xl text-xs font-medium transition-all duration-150"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Digital Twin</span>
        </button>
      </div>
    </aside>
  );
};
