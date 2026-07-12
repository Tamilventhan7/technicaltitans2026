import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { TrendingUp, Fuel, PieChart as PieIcon, BarChart2 } from 'lucide-react';

const CustomTooltipStyle = {
  backgroundColor: 'rgba(10, 15, 30, 0.97)',
  borderColor: 'rgba(255,255,255,0.08)',
  borderRadius: '12px',
  color: '#f1f5f9',
  fontSize: '11px',
  boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.08)'
};

export const AnalyticsSummary: React.FC = () => {
  const { trips, vehicles } = useApp();
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month'>('week');

  const completedTrips = trips.filter(t => t.status === 'delivered');

  // Weekly financial data
  const weekData = [
    { name: 'Mon', Revenue: 4500, Cost: 3100, Profit: 1400 },
    { name: 'Tue', Revenue: 5200, Cost: 3400, Profit: 1800 },
    { name: 'Wed', Revenue: 4900, Cost: 3500, Profit: 1400 },
    { name: 'Thu', Revenue: 6100, Cost: 4100, Profit: 2000 },
    { name: 'Fri', Revenue: 6800, Cost: 4300, Profit: 2500 },
    { name: 'Sat', Revenue: 3400, Cost: 2500, Profit: 900 },
    { name: 'Sun', Revenue: 2900, Cost: 2100, Profit: 800 }
  ];

  const monthData = [
    { name: 'W1', Revenue: 28000, Cost: 18000, Profit: 10000 },
    { name: 'W2', Revenue: 32000, Cost: 20000, Profit: 12000 },
    { name: 'W3', Revenue: 29500, Cost: 19000, Profit: 10500 },
    { name: 'W4', Revenue: 35000, Cost: 22000, Profit: 13000 },
  ];

  const financialData = chartPeriod === 'week' ? weekData : monthData;

  // Add bonus from completed trips
  if (completedTrips.length > 0) {
    const totalProfitGained = completedTrips.reduce((acc, t) => acc + t.financials.profit, 0);
    const bonusPerPeriod = Math.round(totalProfitGained / financialData.length);
    financialData.forEach(d => {
      d.Profit += bonusPerPeriod;
      d.Revenue += Math.round(bonusPerPeriod * 1.4);
      d.Cost += Math.round(bonusPerPeriod * 0.4);
    });
  }

  // Fleet status breakdown for pie chart
  const idleCount = vehicles.filter(v => v.status === 'idle').length;
  const transitCount = vehicles.filter(v => v.status === 'in-transit').length;
  const maintenanceCount = vehicles.filter(v => v.status === 'maintenance').length;

  const statusData = [
    { name: 'In Transit', value: transitCount || 4, color: '#3b82f6' },
    { name: 'Idle / Ready', value: idleCount || 5, color: '#10b981' },
    { name: 'Maintenance', value: maintenanceCount || 1, color: '#f59e0b' },
  ];

  // Fuel efficiency
  const fuelData = [
    { type: 'Sprinter', Efficiency: 8.5, fill: '#60a5fa' },
    { type: 'Medium', Efficiency: 4.8, fill: '#34d399' },
    { type: 'Heavy Duty', Efficiency: 3.5, fill: '#fb923c' },
    { type: 'Reefer', Efficiency: 3.2, fill: '#c084fc' }
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="700">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Revenue & Profit Area Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 lg:col-span-7 flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">Revenue & Profit Performance</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Fleet financial overview (₹)</p>
            </div>
          </div>
          {/* Period Toggle */}
          <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-lg p-0.5">
            {(['week', 'month'] as const).map(p => (
              <button
                key={p}
                onClick={() => setChartPeriod(p)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold capitalize transition-all ${
                  chartPeriod === p ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={financialData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={CustomTooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString()}`, undefined]} />
              <Area type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#gradRev)" dot={false} />
              <Area type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#gradProfit)" dot={false} />
              <Area type="monotone" dataKey="Cost" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" fillOpacity={1} fill="url(#gradCost)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-5 mt-4 pt-3 border-t border-slate-800/40">
          {[
            { label: 'Revenue', color: '#3b82f6' },
            { label: 'Profit', color: '#10b981' },
            { label: 'Cost', color: '#f59e0b' }
          ].map(l => (
            <div key={l.label} className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-[10px] text-slate-500 font-semibold">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right column: Pie + Bar */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        {/* Fleet Status Donut */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col flex-1">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <PieIcon className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200">Fleet Status Distribution</h3>
              <p className="text-[9px] text-slate-500">Live asset allocation</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-28 h-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={28} outerRadius={50}
                    dataKey="value" labelLine={false} label={renderCustomLabel} strokeWidth={0}>
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={CustomTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="ml-4 space-y-2 flex-1">
              {statusData.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-[10px] text-slate-400 font-medium">{s.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-200">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fuel Efficiency Bar Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col flex-1">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Fuel className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200">Fuel Efficiency (KM/L)</h3>
              <p className="text-[9px] text-slate-500">By vehicle category</p>
            </div>
          </div>
          <div className="w-full h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuelData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }} barSize={18}>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="type" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={CustomTooltipStyle} formatter={(v: number) => [`${v} KM/L`, 'Efficiency']} />
                <Bar dataKey="Efficiency" radius={[6, 6, 0, 0]}>
                  {fuelData.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSummary;
