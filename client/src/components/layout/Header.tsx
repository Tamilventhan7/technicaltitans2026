import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useSocket } from '../../context/SocketContext';
import { useSidebar } from '../../context/SidebarContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, ChevronDown, Globe, X, CheckCircle2, AlertTriangle, ShieldAlert, Activity, User } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Admin', color: 'text-purple-400' },
  { value: 'FleetManager', label: 'Fleet Manager', color: 'text-blue-400' },
  { value: 'Dispatcher', label: 'Dispatcher', color: 'text-cyan-400' },
  { value: 'Driver', label: 'Driver', color: 'text-emerald-400' },
  { value: 'SafetyOfficer', label: 'Safety Officer', color: 'text-amber-400' },
  { value: 'FinancialAnalyst', label: 'Financial Analyst', color: 'text-rose-400' },
];

const LANG_OPTIONS = [
  { value: 'en', label: 'EN', flag: '🇬🇧' },
  { value: 'hi', label: 'हिं', flag: '🇮🇳' },
  { value: 'ta', label: 'தமி', flag: '🇮🇳' },
];

export const Header: React.FC = () => {
  const { kpis, alerts, role, setRole, user, activeTab, setActiveTab, language, setLanguage } = useApp();
  const socket = useSocket();
  const { sidebarWidth } = useSidebar();
  const [time, setTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setShowRoleMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unresolvedAlerts = alerts.filter(a => !a.resolved).slice(0, 5);
  const connected = socket ? socket.connected : false;
  const currentRole = ROLE_OPTIONS.find(r => r.value === role);

  const handleRoleChange = (newRole: string) => {
    setRole(newRole as any);
    setShowRoleMenu(false);
    if (newRole === 'Driver') {
      setActiveTab('driver-app');
    } else if (activeTab === 'driver-app') {
      setActiveTab('dashboard');
    } else if (newRole === 'FinancialAnalyst' && !['dashboard', 'what-if', 'expenses', 'reports'].includes(activeTab)) {
      setActiveTab('dashboard');
    } else if (newRole === 'SafetyOfficer' && !['dashboard', 'gamification', 'fleet', 'drivers', 'maintenance'].includes(activeTab)) {
      setActiveTab('dashboard');
    } else if (newRole === 'Dispatcher' && !['dashboard', 'dispatch', 'customer', 'fleet', 'maintenance', 'fuel'].includes(activeTab)) {
      setActiveTab('dashboard');
    }
  };

  const getAlertIcon = (category: string, severity: string) => {
    if (severity === 'critical') return <ShieldAlert className="w-3.5 h-3.5 text-red-400" />;
    if (category === 'maintenance') return <Activity className="w-3.5 h-3.5 text-amber-400" />;
    return <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />;
  };

  // Quick search page navigation
  const SEARCH_PAGES = [
    { q: 'dispatch', tab: 'dispatch', label: 'Smart Dispatch' },
    { q: 'fleet', tab: 'fleet', label: 'Fleet Register' },
    { q: 'driver', tab: 'drivers', label: 'Drivers Roster' },
    { q: 'fuel', tab: 'fuel', label: 'Fuel Ledger' },
    { q: 'maintenance', tab: 'maintenance', label: 'Maintenance Log' },
    { q: 'expense', tab: 'expenses', label: 'Expenses Audit' },
    { q: 'report', tab: 'reports', label: 'Reports Hub' },
    { q: 'ai', tab: 'ai-dashboard', label: 'AI Dashboard' },
    { q: 'settings', tab: 'settings', label: 'Settings' },
    { q: 'customer', tab: 'customer', label: 'Customer Support' },
    { q: 'gamification', tab: 'gamification', label: 'Driver Standings' },
  ];

  const searchResults = searchQuery.length > 1
    ? SEARCH_PAGES.filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()) || p.q.includes(searchQuery.toLowerCase()))
    : [];

  return (
    <header
      className="h-[60px] glass-panel border-b border-slate-800 flex items-center justify-between px-6 fixed top-0 right-0 z-10"
      style={{ left: sidebarWidth, transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      {/* Left: Status indicator + Context */}
      <div className="flex items-center space-x-5">
        {/* Live status pill */}
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-[10px] font-bold ${
          connected
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/25 text-rose-400 animate-pulse'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
          <span>{connected ? 'Digital Twin Live' : 'Reconnecting...'}</span>
        </div>

        {/* Quick stats */}
        {kpis && (
          <div className="hidden xl:flex items-center space-x-4 text-xs border-l border-slate-800/80 pl-5">
            <div className="text-slate-400">
              <span className="text-slate-500 text-[10px] uppercase tracking-wider">Assets</span>
              <span className="ml-2 font-bold text-slate-200">{kpis.activeTripsCount} / 10 Active</span>
            </div>
            <div className="text-slate-400">
              <span className="text-slate-500 text-[10px] uppercase tracking-wider">Health</span>
              <span className={`ml-2 font-bold ${kpis.fleetHealthAvg >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {kpis.fleetHealthAvg}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Center: Search */}
      <div className="relative flex-1 max-w-sm mx-8 hidden md:block">
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all duration-200 ${
          searchFocused
            ? 'bg-slate-800/80 border-blue-500/30 shadow-[0_0_0_3px_rgba(59,130,246,0.08)]'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
        }`}>
          <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => { setSearchFocused(false); setSearchQuery(''); }, 200)}
            className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder-slate-600 w-full font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-600 hover:text-slate-400">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {searchResults.length > 0 && searchFocused && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute top-full mt-2 w-full glass-panel border border-slate-700/60 rounded-xl overflow-hidden shadow-2xl z-50"
            >
              {searchResults.map(r => (
                <button
                  key={r.tab}
                  onMouseDown={() => { setActiveTab(r.tab); setSearchQuery(''); }}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800/50 hover:text-blue-400 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                  <span className="font-medium">{r.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center space-x-2">
        {/* Language Switcher */}
        <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-lg p-0.5">
          {LANG_OPTIONS.map(lang => (
            <button
              key={lang.value}
              onClick={() => setLanguage(lang.value as any)}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all duration-150 ${
                language === lang.value
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Role Switcher Dropdown */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:border-slate-700 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className={currentRole?.color}>{currentRole?.label}</span>
            <ChevronDown className={`w-3 h-3 text-slate-600 transition-transform ${showRoleMenu ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showRoleMenu && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                className="absolute right-0 top-full mt-2 w-44 glass-panel border border-slate-700/60 rounded-xl overflow-hidden shadow-2xl z-50"
              >
                <div className="px-3 py-2 border-b border-slate-800/60">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Switch Role</p>
                </div>
                {ROLE_OPTIONS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => handleRoleChange(r.value)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-xs transition-all duration-150 ${
                      role === r.value ? 'bg-blue-500/10 text-blue-300' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${r.color} bg-current`} />
                    <span className="font-semibold">{r.label}</span>
                    {role === r.value && <CheckCircle2 className="w-3 h-3 text-blue-400 ml-auto" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* System Clock */}
        <div className="text-right hidden lg:block px-2">
          <div className="text-xs font-bold text-slate-200 tracking-wider font-mono">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-[9px] text-slate-600 font-semibold uppercase tracking-wider">
            {time.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-slate-800/60 rounded-xl border border-transparent hover:border-slate-700 transition-all duration-150"
          >
            <Bell className="w-4.5 h-4.5 text-slate-400" />
            {unresolvedAlerts.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[8px] font-black flex items-center justify-center rounded-full animate-pulse">
                {unresolvedAlerts.length}
              </span>
            )}
          </button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                className="absolute right-0 top-full mt-2 w-80 glass-panel border border-slate-700/60 rounded-xl overflow-hidden shadow-2xl z-50"
              >
                <div className="px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-200">Operations Alerts</p>
                  <span className="text-[9px] text-slate-500 font-semibold">{unresolvedAlerts.length} unresolved</span>
                </div>
                {unresolvedAlerts.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-medium">All clear – no active alerts</p>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto">
                    {unresolvedAlerts.map(alert => (
                      <div
                        key={alert.id}
                        className="px-4 py-3 border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="flex items-start space-x-2.5">
                          <div className="mt-0.5 shrink-0">{getAlertIcon(alert.category, alert.severity)}</div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-300 font-medium leading-snug line-clamp-2">{alert.message}</p>
                            <p className="text-[9px] text-slate-600 mt-1 font-mono">
                              {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {alert.vehicleId && ` · ${alert.vehicleId}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800/80">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center border border-blue-400/20 text-white font-black text-xs shadow-lg shadow-blue-900/20">
            {user?.name?.charAt(0) || 'O'}
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-bold text-slate-200 leading-none">{user?.name?.split(' ')[0] || 'Operator'}</div>
            <div className={`text-[9px] font-bold mt-0.5 ${currentRole?.color || 'text-slate-500'}`}>{role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
