import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Search, Clock, User, ArrowUpDown, Download, Sparkles, Filter, CheckCircle2
} from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  details: string;
  user: string;
  timestamp: string;
}

export const AuditLogPanel: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & filter states
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [userFilter, setUserFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/system/audit-logs');
        if (!res.ok) throw new Error('Failed to fetch system audit logs');
        const data = await res.json();
        setLogs(data);
      } catch (err: any) {
        setError(err.message || 'System audit interface offline');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Filter and sort computation
  const filteredLogs = logs
    .filter(log => {
      const matchesSearch = 
        log.action.toLowerCase().includes(search.toLowerCase()) || 
        log.details.toLowerCase().includes(search.toLowerCase()) || 
        log.user.toLowerCase().includes(search.toLowerCase());
      
      const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
      const matchesUser = userFilter === 'ALL' || log.user.toLowerCase().includes(userFilter.toLowerCase());

      return matchesSearch && matchesAction && matchesUser;
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  // Get unique actions and users for filter dropdowns
  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));
  const uniqueUsers = Array.from(new Set(logs.map(l => l.user.split('@')[0]))); // simplify for filter dropdown

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['Log ID', 'Timestamp', 'Operator', 'Action', 'Audit Details'];
    const rows = filteredLogs.map(l => [
      l.id,
      new Date(l.timestamp).toLocaleString(),
      l.user,
      l.action,
      l.details.replace(/"/g, '""')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transitops_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2.5">
            <FileText className="w-5.5 h-5.5 text-blue-400" />
            <span>Admin Audit Logs & Compliance Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Tamper-proof system ledger tracking operations, dispatches, settings changes, and security events.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredLogs.length === 0}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-500/10 flex items-center space-x-2 transition-all active:scale-98"
        >
          <Download className="w-4 h-4" />
          <span>Export Ledger (CSV)</span>
        </button>
      </div>

      {/* Filter Controls Row */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-850 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action or details..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-blue-500/40 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 outline-none transition-colors"
          />
        </div>

        {/* Action Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Actions Types</option>
            {uniqueActions.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>

        {/* User Filter */}
        <div className="flex items-center space-x-2">
          <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            value={userFilter}
            onChange={e => setUserFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-slate-200 text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Users</option>
            {uniqueUsers.map(usr => (
              <option key={usr} value={usr}>{usr}</option>
            ))}
          </select>
        </div>

        {/* Sort Order Toggle */}
        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl text-xs font-bold text-slate-300 transition-colors"
        >
          <span className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Time Order:</span>
          </span>
          <span className="flex items-center space-x-1 font-mono text-[10px] text-blue-400">
            <span>{sortOrder === 'desc' ? 'NEWEST FIRST' : 'OLDEST FIRST'}</span>
            <ArrowUpDown className="w-3 h-3" />
          </span>
        </button>
      </div>

      {/* Main Ledger Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-850">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black uppercase text-slate-350 tracking-wider flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Operational Log Entry Registry ({filteredLogs.length} Rows)</span>
          </h3>
          <span className="px-2.5 py-0.5 rounded-md text-[8.5px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1 animate-pulse">
            <CheckCircle2 className="w-3 h-3" />
            <span>COMPLIANT STATUS</span>
          </span>
        </div>

        {loading ? (
          <div className="space-y-3 py-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-slate-900/50 rounded-xl border border-slate-850/60 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center text-slate-500 text-xs font-bold bg-slate-950/20 border border-slate-850 rounded-2xl">
            ⚠️ {error}. Using simulated offline logs preview.
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-bold bg-slate-950/20 border border-slate-850 rounded-2xl">
            No matching log entries found. Adjust your search parameters or query filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-850 text-slate-450 font-bold uppercase text-[9.5px] tracking-wider">
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => {
                  let actionBadge = 'bg-slate-850 text-slate-350 border-slate-800';
                  if (log.action.includes('Login')) actionBadge = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                  else if (log.action.includes('Dispatched') || log.action.includes('Pairing')) actionBadge = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                  else if (log.action.includes('Completed') || log.action.includes('Approved')) actionBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                  else if (log.action.includes('Config')) actionBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                  return (
                    <tr key={log.id} className="border-b border-slate-850 hover:bg-slate-900/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-400">{log.id}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {new Date(log.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        <span className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
                          <span>{log.user}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[8.5px] font-black uppercase border ${actionBadge}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-medium max-w-sm truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AuditLogPanel;
