import React from 'react';
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
  Legend 
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { AreaChart as AreaIcon, BarChart2 } from 'lucide-react';

export const AnalyticsSummary: React.FC = () => {
  const { trips } = useApp();

  // Aggregate stats or fallback mock operational weekly data if empty
  const completedTrips = trips.filter(t => t.status === 'delivered');

  const financialData = [
    { name: 'Mon', Revenue: 4500, Cost: 3100, Profit: 1400 },
    { name: 'Tue', Revenue: 5200, Cost: 3400, Profit: 1800 },
    { name: 'Wed', Revenue: 4900, Cost: 3500, Profit: 1400 },
    { name: 'Thu', Revenue: 6100, Cost: 4100, Profit: 2000 },
    { name: 'Fri', Revenue: 6800, Cost: 4300, Profit: 2500 },
    { name: 'Sat', Revenue: 3400, Cost: 2500, Profit: 900 },
    { name: 'Sun', Revenue: 2900, Cost: 2100, Profit: 800 }
  ];

  // Map historical trip profit additions to the weekly layout
  if (completedTrips.length > 0) {
    // Distribute actual completed trips profit evenly
    const totalProfitGained = completedTrips.reduce((acc, t) => acc + t.financials.profit, 0);
    const bonusPerDay = Math.round(totalProfitGained / 7);
    financialData.forEach(d => {
      d.Profit += bonusPerDay;
      d.Revenue += Math.round(bonusPerDay * 1.4);
      d.Cost += Math.round(bonusPerDay * 0.4);
    });
  }

  const fuelEfficiencyData = [
    { type: 'Sprinter Van', Efficiency: 8.5 },
    { type: 'Medium Cargo', Efficiency: 4.8 },
    { type: 'Heavy Duty', Efficiency: 3.5 },
    { type: 'Reefer Unit', Efficiency: 3.2 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Financials Area Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 lg:col-span-2 flex flex-col">
        <div className="flex items-center space-x-2 border-b border-slate-800/60 pb-4 mb-4">
          <AreaIcon className="w-4.5 h-4.5 text-blue-400" />
          <h3 className="text-sm font-extrabold text-slate-200 tracking-wider uppercase">
            Fleet Revenue & Profit Performance ($)
          </h3>
        </div>
        
        <div className="w-full h-64 text-xs font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={financialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  color: '#f1f5f9'
                }} 
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fuel Efficiency Bar Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col">
        <div className="flex items-center space-x-2 border-b border-slate-800/60 pb-4 mb-4">
          <BarChart2 className="w-4.5 h-4.5 text-emerald-400" />
          <h3 className="text-sm font-extrabold text-slate-200 tracking-wider uppercase">
            Asset Efficiency Index (KM/L)
          </h3>
        </div>

        <div className="w-full h-64 text-xs font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fuelEfficiencyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="type" stroke="#64748b" fontSize={9} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  color: '#f1f5f9'
                }} 
              />
              <Bar dataKey="Efficiency" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default AnalyticsSummary;
