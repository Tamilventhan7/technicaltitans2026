import React from 'react';
import { useApp } from '../../context/AppContext';
import { Truck, DollarSign, HeartPulse, Leaf } from 'lucide-react';

export const KpiGrid: React.FC = () => {
  const { kpis } = useApp();

  // Standard fallback coordinates
  const stats = [
    {
      label: 'Active Network Shipments',
      value: kpis?.activeTripsCount ?? 0,
      subtext: `${kpis?.completedTripsCount ?? 0} Deliveries Completed`,
      icon: Truck,
      color: 'from-blue-600 to-indigo-600',
      iconColor: 'text-blue-400'
    },
    {
      label: 'Platform Net Profit',
      value: `$${(kpis?.totalProfit ?? 0).toLocaleString()}`,
      subtext: `Total Revenue: $${(kpis?.totalRevenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'from-emerald-600 to-teal-600',
      iconColor: 'text-emerald-400'
    },
    {
      label: 'Fleet Mechanical Health',
      value: `${kpis?.fleetHealthAvg ?? 92}%`,
      subtext: kpis && kpis.fleetHealthAvg < 80 ? 'Service Overdue Alerts' : 'All systems normal',
      icon: HeartPulse,
      color: kpis && kpis.fleetHealthAvg < 80 ? 'from-rose-600 to-red-600' : 'from-cyan-600 to-blue-600',
      iconColor: kpis && kpis.fleetHealthAvg < 80 ? 'text-rose-400' : 'text-cyan-400'
    },
    {
      label: 'Carbon Emissions Offset',
      value: `${((kpis?.carbonEmissionsKG ?? 0) / 1000).toFixed(1)} Tons`,
      subtext: `Eco Index: 94.6% Rating`,
      icon: Leaf,
      color: 'from-emerald-600 to-green-600',
      iconColor: 'text-green-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div 
            key={i} 
            className="glass-panel p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700/60 transition-all duration-300 relative overflow-hidden group hover:-translate-y-1"
          >
            {/* Ambient Background Glow */}
            <div className={`absolute -right-12 -bottom-12 w-24 h-24 bg-gradient-to-tr ${stat.color} opacity-[0.03] group-hover:opacity-[0.08] blur-xl rounded-full transition-opacity duration-300`} />
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${stat.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4">
              <span className="text-2xl font-extrabold text-slate-100 tracking-tight">
                {stat.value}
              </span>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {stat.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default KpiGrid;
