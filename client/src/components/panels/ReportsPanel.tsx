import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Download, Play, Calendar, CheckCircle2, ShieldCheck, FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReportsPanel: React.FC = () => {
  const [reportType, setReportType] = useState('monthly');
  const [category, setCategory] = useState('all');
  const [fileFormat, setFileFormat] = useState('pdf');
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sample historical report prints list
  const [history, setHistory] = useState([
    { name: 'Weekly Fleet Odometer Audit', date: '2026-07-06', type: 'weekly', format: 'xlsx', size: '2.4 MB' },
    { name: 'Monthly Financial Expense Review', date: '2026-07-01', type: 'monthly', format: 'pdf', size: '4.8 MB' },
    { name: 'Daily Telemetry Deviations Log', date: '2026-07-11', type: 'daily', format: 'csv', size: '820 KB' }
  ]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setSuccess(true);
      const newReport = {
        name: `Custom ${category.toUpperCase()} Digest Report`,
        date: new Date().toISOString().split('T')[0],
        type: reportType,
        format: fileFormat,
        size: '1.2 MB'
      };
      setHistory([newReport, ...history]);
      setTimeout(() => setSuccess(false), 2000);
    }, 1500);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100 relative">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2.5">
          <FileText className="w-5.5 h-5.5 text-blue-400" />
          <span>Operations Report Center</span>
        </h2>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
          Export logistics telematics, fuel consumption data, and financial registers.
        </p>
      </div>

      {/* Main Grid: Generator Form on Left (7 cols), Recent History on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Generator Form */}
        <div className="lg:col-span-7 glass-panel p-6.5 rounded-3xl border border-slate-850 flex flex-col justify-between relative">
          
          <div>
            <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider mb-4 border-b border-slate-850 pb-3">
              Configure Report Engine
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs font-semibold text-slate-350">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Report Date Cycle</label>
                  <select 
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="daily">Daily Summary</option>
                    <option value="weekly">Weekly Summary</option>
                    <option value="monthly">Monthly Summary</option>
                    <option value="custom">Custom Date Range</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Target Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-blue-500/30 rounded-xl p-3 text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Modules</option>
                    <option value="trips">Transit Trips</option>
                    <option value="fuel">Fuel Purchase Logs</option>
                    <option value="maintenance">Maintenance Service Tickets</option>
                    <option value="expenses">Accounting Expenses</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest">Choose Output Format</label>
                <div className="grid grid-cols-3 gap-3">
                  {['pdf', 'csv', 'xlsx'].map((format) => (
                    <button
                      key={format}
                      type="button"
                      onClick={() => setFileFormat(format)}
                      className={`py-3 rounded-xl font-bold uppercase tracking-wider transition-all border text-[10px] ${
                        fileFormat === format
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-900'
                      }`}
                    >
                      {format === 'xlsx' ? 'Excel (XLSX)' : format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-4.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center space-x-2 transition-all active:scale-98"
              >
                {generating ? (
                  <div className="w-4.5 h-4.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run Query and Compile Export</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Success Overlay */}
          <AnimatePresence>
            {success && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-6 rounded-3xl border border-slate-850 z-10"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-black text-slate-100 text-sm">Report Compiled Successfully</h4>
                <p className="text-[10px] text-slate-500 mt-1">
                  Document has been formatted and cached in your vault for local download.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* History / Recent Downloads (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6.5 rounded-3xl border border-slate-850 flex flex-col">
          <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider mb-4 border-b border-slate-850 pb-3">
            Recent Exports Cache
          </h3>

          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {history.map((h, i) => (
              <div 
                key={i} 
                className="p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-2xl transition-all flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5 min-w-0 pr-3">
                  <h4 className="font-extrabold text-slate-200 truncate">{h.name}</h4>
                  <p className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                    {h.date} • {h.format.toUpperCase()} • {h.size}
                  </p>
                </div>
                <button 
                  onClick={() => alert(`Initiating mock download: ${h.name}.${h.format} (${h.size})`)}
                  className="p-2 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all shrink-0"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
export default ReportsPanel;
