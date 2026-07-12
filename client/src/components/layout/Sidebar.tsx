import React from 'react';
import { useApp } from '../../context/AppContext';
import { useSidebar } from '../../context/SidebarContext';
import { motion, AnimatePresence } from 'framer-motion';
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
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Zap,
  BarChart3
} from 'lucide-react';

const SECTIONS = [
  {
    title: 'Operations',
    items: [
      { id: 'dashboard', labelKey: 'commandCenter', icon: LayoutDashboard, roles: ['Admin', 'FleetManager', 'Dispatcher', 'SafetyOfficer', 'FinancialAnalyst'] },
      { id: 'ai-dashboard', labelKey: 'aiDashboard', icon: Brain, roles: ['Admin', 'FleetManager', 'Dispatcher', 'SafetyOfficer', 'FinancialAnalyst'] },
      { id: 'dispatch', labelKey: 'smartDispatch', icon: Send, roles: ['Admin', 'FleetManager', 'Dispatcher'] },
    ]
  },
  {
    title: 'Fleet Management',
    items: [
      { id: 'fleet', labelKey: 'fleetRegister', icon: Truck, roles: ['Admin', 'FleetManager', 'Dispatcher', 'SafetyOfficer'] },
      { id: 'drivers', labelKey: 'driversShift', icon: Users, roles: ['Admin', 'FleetManager', 'SafetyOfficer'] },
      { id: 'maintenance', labelKey: 'maintenanceLog', icon: Wrench, roles: ['Admin', 'FleetManager', 'Dispatcher', 'SafetyOfficer'] },
      { id: 'fuel', labelKey: 'fuelLedger', icon: Fuel, roles: ['Admin', 'FleetManager', 'Dispatcher', 'SafetyOfficer'] },
    ]
  },
  {
    title: 'Finance & Analytics',
    items: [
      { id: 'expenses', labelKey: 'expensesAudit', icon: DollarSign, roles: ['Admin', 'FinancialAnalyst'] },
      { id: 'what-if', labelKey: 'whatIf', icon: Sliders, roles: ['Admin', 'FinancialAnalyst'] },
      { id: 'reports', labelKey: 'reportsHub', icon: BarChart3, roles: ['Admin', 'FleetManager', 'FinancialAnalyst'] },
    ]
  },
  {
    title: 'Engagement',
    items: [
      { id: 'gamification', labelKey: 'driverStandings', icon: Trophy, roles: ['Admin', 'FleetManager', 'SafetyOfficer'] },
      { id: 'customer', labelKey: 'customerSupport', icon: UserCheck, roles: ['Admin', 'Dispatcher'] },
      { id: 'driver-app', labelKey: 'driverPortal', icon: Smartphone, roles: ['Admin', 'Driver'] },
      { id: 'settings', labelKey: 'settingsControl', icon: Settings, roles: ['Admin', 'FleetManager', 'FinancialAnalyst'] },
    ]
  }
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, alerts, kpis, setSimulationSpeed, resetDatabase, role, logout, t } = useApp();
  const { collapsed, setCollapsed } = useSidebar();

  const activeAlertsCount = alerts.filter(a => !a.resolved).length;

  const getBadge = (id: string) => {
    if (id === 'dashboard' && activeAlertsCount > 0) return activeAlertsCount;
    return undefined;
  };

  const multipliers = [1, 5, 10, 60];

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="glass-panel border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-20 overflow-hidden"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="min-w-0"
            >
              <h1 className="text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 whitespace-nowrap">
                TransitOps+
              </h1>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold whitespace-nowrap">
                Enterprise Fleet AI
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-900/30"
            >
              <Zap className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-500 hover:text-slate-300 transition-all duration-150 shrink-0 ml-2"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {SECTIONS.map(section => {
          const sectionItems = section.items.filter(item => item.roles.includes(role));
          if (!sectionItems.length) return null;

          return (
            <div key={section.title} className="mb-3">
              {/* Section Header */}
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-4 mb-1.5"
                  >
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                      {section.title}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Section Items */}
              <div className="px-3 space-y-0.5">
                {sectionItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const badge = getBadge(item.id);
                  const label = t(item.labelKey);

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      title={collapsed ? label : undefined}
                      className={`w-full flex items-center rounded-xl transition-all duration-200 group relative ${
                        collapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-blue-600/15 text-blue-400 border border-blue-500/25 shadow-[0_0_20px_rgba(59,130,246,0.08)]'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-r-full"
                        />
                      )}

                      <div className={`flex items-center ${collapsed ? '' : 'space-x-3'}`}>
                        <Icon className={`w-4.5 h-4.5 shrink-0 transition-all duration-200 group-hover:scale-110 ${
                          isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-200'
                        }`} />
                        <AnimatePresence>
                          {!collapsed && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              exit={{ opacity: 0, width: 0 }}
                              className="text-sm font-semibold whitespace-nowrap overflow-hidden"
                            >
                              {label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>

                      {badge !== undefined && !collapsed && (
                        <span className="px-1.5 py-0.5 text-[9px] font-black bg-red-500/20 text-red-400 rounded-full border border-red-500/30 animate-pulse shrink-0">
                          {badge}
                        </span>
                      )}
                      {badge !== undefined && collapsed && (
                        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[7px] font-black flex items-center justify-center rounded-full">
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Simulation Engine Controls */}
      {!collapsed && ['Admin', 'FleetManager', 'Dispatcher'].includes(role) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 py-3 border-t border-slate-800 bg-slate-950/40"
        >
          <div className="flex items-center space-x-2 text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2">
            <Gauge className="w-3 h-3 text-blue-400 shrink-0" />
            <span>Sim Speed</span>
          </div>
          <div className="grid grid-cols-4 gap-1 mb-2">
            {multipliers.map(mult => {
              const isActive = (kpis?.multiplier || 1) === mult;
              return (
                <button
                  key={mult}
                  onClick={() => setSimulationSpeed(mult)}
                  className={`py-1 text-[10px] font-bold rounded-lg border transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {mult}x
                </button>
              );
            })}
          </div>
          <button
            onClick={resetDatabase}
            className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 border border-red-900/30 hover:border-red-900/50 rounded-lg text-[10px] font-bold transition-all duration-150"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Digital Twin</span>
          </button>
        </motion.div>
      )}

      {/* Footer User Session */}
      <div className={`p-3 border-t border-slate-800 bg-slate-950/60 flex items-center shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-[9px] text-slate-500 font-black uppercase tracking-wider">{role} Session</div>
          </div>
        )}
        <button
          onClick={logout}
          className="p-2 hover:bg-slate-800 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </motion.aside>
  );
};
