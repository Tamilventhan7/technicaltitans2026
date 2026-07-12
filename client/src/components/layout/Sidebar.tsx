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
  Gauge,
  LogOut,
  Brain,
  Truck,
  Wrench,
  Fuel,
  DollarSign,
  FileText,
  Settings,
  UserCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, alerts, kpis, setSimulationSpeed, resetDatabase, role, logout } = useApp();

  const activeAlertsCount = alerts.filter(a => !a.resolved).length;

  const allMenuItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, badge: activeAlertsCount > 0 ? activeAlertsCount : undefined, roles: ['Admin', 'FleetManager', 'Dispatcher', 'SafetyOfficer', 'FinancialAnalyst'] },
    { id: 'ai-dashboard', label: 'AI Dashboard', icon: Brain, roles: ['Admin', 'FleetManager', 'Dispatcher', 'SafetyOfficer', 'FinancialAnalyst'] },
    { id: 'fleet', label: 'Fleet Register', icon: Truck, roles: ['Admin', 'FleetManager', 'Dispatcher', 'SafetyOfficer'] },
    { id: 'drivers', label: 'Drivers Shift Roster', icon: Users, roles: ['Admin', 'FleetManager', 'SafetyOfficer'] },
    { id: 'dispatch', label: 'Smart Dispatch', icon: Send, roles: ['Admin', 'FleetManager', 'Dispatcher'] },
    { id: 'maintenance', label: 'Maintenance Log', icon: Wrench, roles: ['Admin', 'FleetManager', 'Dispatcher', 'SafetyOfficer'] },
    { id: 'fuel', label: 'Fuel Ledger', icon: Fuel, roles: ['Admin', 'FleetManager', 'Dispatcher', 'SafetyOfficer'] },
    { id: 'expenses', label: 'Expenses Audit', icon: DollarSign, roles: ['Admin', 'FinancialAnalyst'] },
    { id: 'what-if', label: 'What-If Simulator', icon: Sliders, roles: ['Admin', 'FinancialAnalyst'] },
    { id: 'gamification', label: 'Driver Standings', icon: Trophy, roles: ['Admin', 'FleetManager', 'SafetyOfficer'] },
    { id: 'reports', label: 'Reports Hub', icon: FileText, roles: ['Admin', 'FleetManager', 'FinancialAnalyst'] },
    { id: 'customer', label: 'Customer Support', icon: UserCheck, roles: ['Admin', 'Dispatcher'] },
    { id: 'settings', label: 'Settings Control', icon: Settings, roles: ['Admin', 'FleetManager', 'FinancialAnalyst'] },
    { id: 'driver-app', label: 'Driver Dispatch Portal', icon: Smartphone, roles: ['Admin', 'Driver'] }
  ];

  // Filter items matching user's current role
  const menuItems = allMenuItems.filter(item => item.roles.includes(role));

  const multipliers = [1, 5, 10, 60];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex flex-col">
        <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
          TransitOps+
        </h1>
        <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">
          Smart AI Fleet Platform
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
                <span className="text-sm font-semibold">{item.label}</span>
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

      {/* Simulation Engine Controls (Only visible to Admin or Managers) */}
      {['Admin', 'FleetManager', 'Dispatcher'].includes(role) && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
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
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 border border-red-900/30 hover:border-red-900/50 rounded-xl text-xs font-bold transition-all duration-150"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Digital Twin</span>
          </button>
        </div>
      )}

      {/* Bottom Footer User Session */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{role} View</div>
        </div>
        <button 
          onClick={logout}
          className="p-2 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
          title="Sign Out of Session"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </div>
    </aside>
  );
};
