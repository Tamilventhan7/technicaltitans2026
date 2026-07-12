import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Flame, 
  Compass, 
  Gauge, 
  Activity, 
  ShieldAlert, 
  CloudRain, 
  Clock,
  ChevronDown,
  CheckCircle2,
  Bell
} from 'lucide-react';

const ALERT_CONFIG: Record<string, { icon: any; label: string; color: string; dot: string }> = {
  maintenance:     { icon: Activity,       label: 'Maintenance',     color: 'text-amber-400 bg-amber-500/8 border-amber-500/20',  dot: 'bg-amber-400' },
  fuel_theft:      { icon: Flame,          label: 'Fuel Theft',      color: 'text-red-400 bg-red-500/8 border-red-500/20',       dot: 'bg-red-400' },
  route_deviation: { icon: Compass,        label: 'Route Deviation', color: 'text-sky-400 bg-sky-500/8 border-sky-500/20',       dot: 'bg-sky-400' },
  speeding:        { icon: Gauge,          label: 'Speeding',        color: 'text-orange-400 bg-orange-500/8 border-orange-500/20', dot: 'bg-orange-400' },
  harsh_braking:   { icon: AlertTriangle,  label: 'Harsh Braking',  color: 'text-yellow-400 bg-yellow-500/8 border-yellow-500/20', dot: 'bg-yellow-400' },
  accident:        { icon: ShieldAlert,    label: 'Accident',        color: 'text-red-400 bg-red-500/10 border-red-500/25 animate-pulse', dot: 'bg-red-500' },
  weather_risk:    { icon: CloudRain,      label: 'Weather Risk',    color: 'text-cyan-400 bg-cyan-500/8 border-cyan-500/20',    dot: 'bg-cyan-400' },
  traffic_delay:   { icon: Clock,          label: 'Traffic Delay',   color: 'text-slate-400 bg-slate-500/8 border-slate-500/20', dot: 'bg-slate-400' },
};

export const AlertFeed: React.FC = () => {
  const { alerts, setSelectedVehicleId } = useApp();
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const activeAlerts = alerts.filter(a => !a.resolved);
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;

  const filtered = activeAlerts.filter(a => {
    if (filter === 'critical') return a.severity === 'critical';
    if (filter === 'warning') return a.severity !== 'critical';
    return true;
  });

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-800/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl border ${criticalCount > 0 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200">Operations Alerts</h3>
              <p className="text-[9px] text-slate-500 mt-0.5">{activeAlerts.length} active events</p>
            </div>
          </div>
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 text-[9px] font-black bg-red-500/15 text-red-400 rounded-full border border-red-500/25 animate-pulse">
              {criticalCount} CRITICAL
            </span>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5">
          {(['all', 'critical', 'warning'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-[9px] font-bold capitalize transition-all ${
                filter === f 
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                  : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto py-2 space-y-1 px-2">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3"
            >
              <div className="p-3 bg-emerald-500/8 rounded-2xl border border-emerald-500/15 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-300">Fleet Nominal</p>
                <p className="text-[10px] text-slate-600 mt-0.5">No violations logged</p>
              </div>
            </motion.div>
          ) : (
            filtered.map((alert, i) => {
              const cfg = ALERT_CONFIG[alert.category] || ALERT_CONFIG['speeding'];
              const Icon = cfg.icon;
              const isExpanded = expanded === alert.id;

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setExpanded(isExpanded ? null : alert.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 group ${
                    alert.severity === 'critical'
                      ? 'border-red-900/60 bg-red-950/10 hover:border-red-800/60 hover:bg-red-950/20'
                      : 'border-slate-800/50 bg-slate-900/10 hover:border-slate-700/60 hover:bg-slate-900/30'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className={`p-1.5 rounded-lg border shrink-0 ${cfg.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                            {cfg.label}
                          </span>
                        </div>
                        <span className="text-[8px] text-slate-600 font-mono shrink-0">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={`text-[10px] text-slate-300 font-medium mt-1 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {alert.message}
                      </p>

                      {/* Expanded detail */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 pt-2 border-t border-slate-800/50 space-y-1.5">
                              <div className="flex items-center justify-between text-[9px]">
                                <span className="text-slate-600 font-medium">Severity</span>
                                <span className={`font-bold uppercase ${alert.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>
                                  {alert.severity}
                                </span>
                              </div>
                              {alert.vehicleId && (
                                <button
                                  onClick={e => { e.stopPropagation(); setSelectedVehicleId(alert.vehicleId!); }}
                                  className="w-full text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg px-2 py-1 hover:bg-blue-500/20 transition-colors"
                                >
                                  📍 Locate {alert.vehicleId} on map
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AlertFeed;
