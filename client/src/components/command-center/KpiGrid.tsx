import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Truck, DollarSign, HeartPulse, Leaf, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

// Animated number counter hook
function useAnimatedCounter(value: number, duration = 800) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    if (start === end) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
      else prevValue.current = end;
    };
    requestAnimationFrame(tick);
  }, [value, duration]);
  return display;
}

// Sparkline component
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 64;
  const h = 24;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

export const KpiGrid: React.FC = () => {
  const { kpis, trips } = useApp();

  // Build last-8-tick sparkline history from trip count changes
  const [sparkHistory, setSparkHistory] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [profitHistory, setProfitHistory] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0]);
  const [healthHistory, setHealthHistory] = useState<number[]>([92, 92, 92, 92, 92, 92, 92, 92]);

  useEffect(() => {
    if (kpis) {
      setSparkHistory(prev => [...prev.slice(-7), kpis.activeTripsCount ?? 0]);
      setProfitHistory(prev => [...prev.slice(-7), kpis.totalProfit ?? 0]);
      setHealthHistory(prev => [...prev.slice(-7), kpis.fleetHealthAvg ?? 92]);
    }
  }, [kpis]);

  const activeTrips = useAnimatedCounter(kpis?.activeTripsCount ?? 0);
  const completedTrips = kpis?.completedTripsCount ?? 0;
  const profit = kpis?.totalProfit ?? 0;
  const revenue = kpis?.totalRevenue ?? 0;
  const health = kpis?.fleetHealthAvg ?? 92;
  const carbon = kpis?.carbonEmissionsKG ?? 0;

  // Trend calculation
  const getTrend = (history: number[]) => {
    if (history.length < 2) return 0;
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    if (prev === 0) return 0;
    return ((last - prev) / prev) * 100;
  };

  const tripTrend = getTrend(sparkHistory);
  const profitTrend = getTrend(profitHistory);
  const healthTrend = getTrend(healthHistory);

  const TrendIndicator = ({ value }: { value: number }) => {
    if (Math.abs(value) < 0.1) return <Minus className="w-3 h-3 text-slate-500" />;
    if (value > 0) return (
      <div className="flex items-center space-x-0.5 text-emerald-400">
        <TrendingUp className="w-3 h-3" />
        <span className="text-[10px] font-bold">+{value.toFixed(1)}%</span>
      </div>
    );
    return (
      <div className="flex items-center space-x-0.5 text-rose-400">
        <TrendingDown className="w-3 h-3" />
        <span className="text-[10px] font-bold">{value.toFixed(1)}%</span>
      </div>
    );
  };

  const stats = [
    {
      label: 'Active Network Shipments',
      value: activeTrips.toString(),
      subtext: `${completedTrips} Deliveries Completed Today`,
      icon: Truck,
      gradient: 'from-blue-600 to-indigo-700',
      glow: 'rgba(59,130,246,0.15)',
      iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      sparkData: sparkHistory,
      sparkColor: '#60a5fa',
      trend: tripTrend,
      badge: kpis?.activeTripsCount ? `${kpis.activeTripsCount} Live` : 'None',
      badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/20'
    },
    {
      label: 'Platform Net Profit',
      value: `₹${(profit / 1000).toFixed(1)}K`,
      subtext: `Revenue: ₹${(revenue / 1000).toFixed(1)}K`,
      icon: DollarSign,
      gradient: 'from-emerald-600 to-teal-700',
      glow: 'rgba(16,185,129,0.15)',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      sparkData: profitHistory,
      sparkColor: '#34d399',
      trend: profitTrend,
      badge: profit > 0 ? 'Profitable' : 'Break-even',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
    },
    {
      label: 'Fleet Mechanical Health',
      value: `${health}%`,
      subtext: health < 80 ? '⚠ Service Overdue Alerts' : '✓ All Systems Nominal',
      icon: HeartPulse,
      gradient: health < 80 ? 'from-rose-600 to-red-700' : 'from-cyan-600 to-blue-700',
      glow: health < 80 ? 'rgba(239,68,68,0.15)' : 'rgba(6,182,212,0.15)',
      iconBg: health < 80 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
      sparkData: healthHistory,
      sparkColor: health < 80 ? '#f87171' : '#22d3ee',
      trend: healthTrend,
      badge: health >= 90 ? 'Excellent' : health >= 75 ? 'Good' : 'Needs Service',
      badgeColor: health >= 90 ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20' : health >= 75 ? 'bg-amber-500/15 text-amber-300 border-amber-500/20' : 'bg-rose-500/15 text-rose-300 border-rose-500/20'
    },
    {
      label: 'Carbon Emissions Offset',
      value: `${((carbon) / 1000).toFixed(1)}T`,
      subtext: `Eco Index: 94.6% Efficiency`,
      icon: Leaf,
      gradient: 'from-emerald-600 to-green-700',
      glow: 'rgba(52,211,153,0.15)',
      iconBg: 'bg-green-500/10 border-green-500/20 text-green-400',
      sparkData: [3.2, 3.8, 3.5, 4.1, 3.9, 4.2, 3.7, carbon / 1000],
      sparkColor: '#4ade80',
      trend: -2.1,
      badge: 'Green Fleet',
      badgeColor: 'bg-green-500/15 text-green-300 border-green-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="relative glass-panel p-6 rounded-2xl border border-slate-800/80 overflow-hidden group hover:-translate-y-1 hover:border-slate-600/60 transition-all duration-300 cursor-default"
            style={{ boxShadow: `0 4px 24px ${stat.glow}, 0 1px 0 rgba(255,255,255,0.04) inset` }}
          >
            {/* Top gradient bar */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

            {/* Background glow */}
            <div
              className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500"
              style={{ background: `radial-gradient(circle, ${stat.glow} 0%, transparent 70%)` }}
            />

            {/* Header row */}
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl border ${stat.iconBg} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${stat.badgeColor}`}>
                {stat.badge}
              </span>
            </div>

            {/* Value */}
            <div className="mb-1">
              <span className="text-3xl font-black text-slate-100 tracking-tight font-mono">
                {stat.value}
              </span>
            </div>

            {/* Label */}
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {stat.label}
            </p>

            {/* Subtext */}
            <p className="text-[10px] text-slate-500 font-medium mb-4">
              {stat.subtext}
            </p>

            {/* Bottom: Sparkline + Trend */}
            <div className="flex items-end justify-between pt-3 border-t border-slate-800/60">
              <Sparkline data={stat.sparkData} color={stat.sparkColor} />
              <TrendIndicator value={stat.trend} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KpiGrid;
