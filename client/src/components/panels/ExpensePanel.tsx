import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, Plus, CheckCircle, AlertTriangle, PieChart, TrendingUp, XCircle, FileText
} from 'lucide-react';
import { ResponsiveContainer, Cell, PieChart as RePieChart, Pie, Tooltip } from 'recharts';
import { useApp } from '../../context/AppContext';

export const ExpensePanel: React.FC = () => {
  const { vehicles, drivers, role } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [expenseType, setExpenseType] = useState('Fuel');
  const [amount, setAmount] = useState(120);
  const [targetDriver, setTargetDriver] = useState(drivers[0]?.id || 'DRV-01');
  const [targetVehicle, setTargetVehicle] = useState(vehicles[0]?.id || 'TRK-01');
  const [remarks, setRemarks] = useState('');

  // Sample static expense ledger
  const [expenses, setExpenses] = useState([
    { id: 'EXP-401', type: 'Fuel', amount: 15000, driver: 'DRV-01', vehicle: 'TRK-01', status: 'pending', date: '2026-07-11', remarks: 'Diesel fillup Ohio east' },
    { id: 'EXP-402', type: 'Toll', amount: 4500, driver: 'DRV-02', vehicle: 'TRK-02', status: 'approved', date: '2026-07-09', remarks: 'Pennsylvania Turnpike toll fee' },
    { id: 'EXP-403', type: 'Repairs', amount: 35000, driver: 'DRV-03', vehicle: 'TRK-03', status: 'approved', date: '2026-07-10', remarks: 'Headlight sensor calibration' },
    { id: 'EXP-404', type: 'Lodging', amount: 8500, driver: 'DRV-04', vehicle: 'TRK-04', status: 'pending', date: '2026-07-12', remarks: 'Overnight rest stop Illinois' }
  ]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 0) {
      alert('Negative amounts are not allowed.');
      return;
    }
    const newExp = {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      type: expenseType,
      amount,
      driver: targetDriver,
      vehicle: targetVehicle,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      remarks
    };
    setExpenses([newExp, ...expenses]);
    setShowAddForm(false);
  };

  const handleApprove = (id: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'approved' } : e));
  };

  const handleReject = (id: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'rejected' } : e));
  };

  // Pie chart calculation
  const fuelTotal = expenses.filter(e => e.type === 'Fuel').reduce((sum, e) => sum + e.amount, 0);
  const tollTotal = expenses.filter(e => e.type === 'Toll').reduce((sum, e) => sum + e.amount, 0);
  const repairTotal = expenses.filter(e => e.type === 'Repairs').reduce((sum, e) => sum + e.amount, 0);
  const lodgeTotal = expenses.filter(e => e.type === 'Lodging').reduce((sum, e) => sum + e.amount, 0);

  const pieData = [
    { name: 'Fuel', value: fuelTotal || 1, color: '#3b82f6' },
    { name: 'Tolls', value: tollTotal || 1, color: '#f59e0b' },
    { name: 'Repairs', value: repairTotal || 1, color: '#ef4444' },
    { name: 'Lodging', value: lodgeTotal || 1, color: '#a855f7' }
  ];

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingTotal = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 font-sans text-slate-100 relative">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2.5">
            <DollarSign className="w-5.5 h-5.5 text-blue-400" />
            <span>Financial Expense Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Audit expenditures, review invoice logs, and approve pending driver disbursements.
          </p>
        </div>

        <button 
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-500/10 flex items-center space-x-2 transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Grid columns */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Stats list (4 cols) */}
        <div className="xl:col-span-4 space-y-4">
          <div className="glass-panel p-5.5 rounded-2xl border border-slate-850">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Total Expenditures</span>
            <div className="mt-2.5 flex items-baseline space-x-1">
              <span className="text-emerald-400 font-bold text-sm mr-1">₹</span>
              <span className="text-2xl font-black text-slate-200 font-mono">{totalExpense.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal">
              Accumulated driver expense claims logged.
            </p>
          </div>

          <div className="glass-panel p-5.5 rounded-2xl border border-slate-850">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Pending Approvals</span>
            <div className="mt-2.5 flex items-baseline space-x-1">
              <span className="text-amber-550 font-bold text-sm mr-1">₹</span>
              <span className="text-2xl font-black text-slate-200 font-mono">{pendingTotal.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal">
              Awaiting Financial Analyst audit approval.
            </p>
          </div>
        </div>

        {/* Center: Pie Chart Categories (8 cols) */}
        <div className="xl:col-span-8 glass-panel p-6 rounded-3xl border border-slate-850 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1 space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider border-b border-slate-850 pb-2">
              Expense Allocation Metrics
            </h3>
            <div className="space-y-2">
              {pieData.map((d, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="font-semibold text-slate-300">{d.name}</span>
                  </div>
                  <span className="font-mono text-slate-200 font-bold">₹{d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
                <Pie 
                  data={pieData} 
                  innerRadius={50} 
                  outerRadius={75} 
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Ledger lists */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-850">
        <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider mb-4">Pending Audit Register</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-850 text-slate-400 font-bold uppercase text-[9.5px]">
                <th className="py-2.5 px-3">Exp ID</th>
                <th className="py-2.5 px-3">Vehicle / Driver</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Details / Remarks</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b border-slate-850 hover:bg-slate-900/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-200">{e.id}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-blue-400 block">{e.vehicle}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{e.driver}</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-200">{e.type}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-200">₹{e.amount.toLocaleString()}</td>
                  <td className="py-3 px-3 text-slate-450 font-semibold">{e.remarks}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">{e.date}</td>
                  <td className="py-3 px-3 text-right">
                    {e.status === 'pending' ? (
                      <div className="flex justify-end space-x-2">
                        {['Admin', 'FinancialAnalyst'].includes(role) ? (
                          <>
                            <button 
                              onClick={() => handleApprove(e.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition-colors"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleReject(e.id)}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Awaiting Audit</span>
                        )}
                      </div>
                    ) : (
                      <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase border ${
                        e.status === 'approved' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {e.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-slate-900 border border-slate-850 max-w-md w-full p-8 rounded-3xl relative"
            >
              <button 
                onClick={() => setShowAddForm(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white"
              >
                <XIcon />
              </button>

              <h3 className="text-md font-extrabold text-slate-100 flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-blue-400" />
                <span>Log Expense Claim</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Report trip-related costs</p>

              <form onSubmit={handleCreate} className="mt-6 space-y-4 text-xs font-semibold text-slate-350">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Expense Category</label>
                    <select 
                      value={expenseType}
                      onChange={(e) => setExpenseType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="Fuel">Fuel</option>
                      <option value="Toll">Toll</option>
                      <option value="Repairs">Repairs</option>
                      <option value="Lodging">Lodging</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Amount (₹)</label>
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-mono font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Remarks / Description</label>
                  <input 
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none"
                    placeholder="e.g. Purchase invoice #2881"
                  />
                </div>

                {/* Simulated file upload area */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Upload Receipt Scan</label>
                  <div className="border border-dashed border-slate-850 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-950/20">
                    <FileText className="w-6 h-6 text-slate-500 mb-1" />
                    <span className="text-[10px] text-slate-400">Upload JPG, PDF receipt logs</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center space-x-2 transition-all active:scale-98"
                >
                  <span>Submit Expense Claim</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default ExpensePanel;
