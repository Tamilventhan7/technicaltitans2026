import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  AlertTriangle, 
  Flame, 
  Compass, 
  Gauge, 
  Activity, 
  ShieldAlert, 
  CloudRain, 
  Clock 
} from 'lucide-react';

export const AlertFeed: React.FC = () => {
  const { alerts, setSelectedVehicleId } = useApp();

  const activeAlerts = alerts.filter(a => !a.resolved);

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'maintenance': return { icon: Activity, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'fuel_theft': return { icon: Flame, color: 'text-red-400 bg-red-500/10 border-red-500/20' };
      case 'route_deviation': return { icon: Compass, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
      case 'speeding': return { icon: Gauge, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
      case 'harsh_braking': return { icon: AlertTriangle, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
      case 'accident': return { icon: ShieldAlert, color: 'text-red-400 bg-red-500/10 border-red-500/20 animate-pulse' };
      case 'weather_risk': return { icon: CloudRain, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
      case 'traffic_delay': return { icon: Clock, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
      default: return { icon: AlertTriangle, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-4">
        <h3 className="text-sm font-extrabold text-slate-200 tracking-wider uppercase flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span>Operations Command Feed</span>
        </h3>
        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-900 border border-slate-850 text-slate-400">
          {activeAlerts.length} Active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 max-h-[42vh] pr-1">
        {activeAlerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-3">
            <div className="p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-emerald-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">Fleet Operations Nominal</p>
              <p className="text-[10px] text-slate-500 mt-0.5">No violations or exceptions logged.</p>
            </div>
          </div>
        ) : (
          activeAlerts.map(alert => {
            const config = getAlertIcon(alert.category);
            const Icon = config.icon;
            
            return (
              <div
                key={alert.id}
                onClick={() => alert.vehicleId && setSelectedVehicleId(alert.vehicleId)}
                className={`p-4 rounded-xl border cursor-pointer hover:bg-slate-900/40 transition-all duration-150 flex items-start space-x-3.5 group ${
                  alert.severity === 'critical' 
                    ? 'border-red-950 bg-red-950/5 hover:border-red-800' 
                    : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl border ${config.color} shrink-0`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                      alert.severity === 'critical' ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {alert.category.replace('_', ' ')}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-1 leading-relaxed line-clamp-2 group-hover:text-slate-100">
                    {alert.message}
                  </p>
                  {alert.vehicleId && (
                    <span className="inline-block mt-2 text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                      Locate {alert.vehicleId}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default AlertFeed;
