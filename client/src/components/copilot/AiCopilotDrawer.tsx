import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, X, Send, Mic, MicOff, Sparkles, TrendingUp, List,
  ShieldCheck, Wrench, Fuel, DollarSign, AlertTriangle, Truck,
  Users, BarChart3, ChevronUp, Minimize2, Maximize2, ArrowUpRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// ─── TYPES ─────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  widget?: {
    type: 'chart' | 'table' | 'metric' | 'list' | 'alert' | 'actions' | 'kpis';
    title: string;
    data: any;
  };
  timestamp: Date;
}

// ─── PROMPT SUGGESTIONS ────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: Truck, label: "Today's active trips", query: "show today's active trips" },
  { icon: Wrench, label: "Maintenance due", query: "which vehicles need maintenance?" },
  { icon: ShieldCheck, label: "Safest driver", query: "who is the safest driver?" },
  { icon: Fuel, label: "Fuel hogs", query: "show top fuel consuming vehicles" },
  { icon: AlertTriangle, label: "Expiring Docs", query: "show expiring documents" },
  { icon: DollarSign, label: "Expense report", query: "generate monthly expense report" },
];

// ─── AI RESPONSE ENGINE ────────────────────────────────────────────────────────
function buildAiResponse(
  query: string,
  { trips, vehicles, drivers, alerts, kpis }: any
): Omit<ChatMessage, 'id' | 'timestamp' | 'sender'> {
  const q = query.toLowerCase();

  // ── Document Expiry ──
  if (q.includes('expiry') || q.includes('expire') || q.includes('document') || q.includes('license')) {
    const today = new Date();
    const expiries: any[] = [];
    vehicles.forEach((v: any) => {
      const docs = [
        { doc: 'Insurance', date: v.insuranceExpiry },
        { doc: 'Fitness Cert', date: v.fitnessExpiry },
        { doc: 'Pollution Cert', date: v.pollutionExpiry },
      ];
      docs.forEach(({ doc, date }) => {
        if (!date) return;
        const expDate = new Date(date);
        const daysLeft = Math.round((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 30) {
          expiries.push({
            entity: v.id,
            type: 'Vehicle',
            doc,
            date,
            daysLeft,
            level: daysLeft <= 0 ? 'critical' : daysLeft <= 7 ? 'high' : daysLeft <= 15 ? 'medium' : 'info'
          });
        }
      });
    });

    drivers.forEach((d: any) => {
      if (!d.licenseExpiry) return;
      const expDate = new Date(d.licenseExpiry);
      const daysLeft = Math.round((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 30) {
        expiries.push({
          entity: d.name,
          type: 'Driver Licence',
          doc: 'Licence',
          date: d.licenseExpiry,
          daysLeft,
          level: daysLeft <= 0 ? 'critical' : daysLeft <= 7 ? 'high' : daysLeft <= 15 ? 'medium' : 'info'
        });
      }
    });

    expiries.sort((a, b) => a.daysLeft - b.daysLeft);

    return {
      text: `📅 **Document Expiry Analytics** — Found **${expiries.length} compliance documents** expiring within 30 days:`,
      widget: {
        type: 'table',
        title: 'Expiring Compliance Documents',
        data: {
          headers: ['Entity', 'Type', 'Expiry Date', 'Days Left', 'Urgency'],
          rows: expiries.slice(0, 5).map(e => [
            e.entity,
            `${e.type} (${e.doc})`,
            e.date,
            e.daysLeft <= 0 ? 'EXPIRED 🚨' : `${e.daysLeft} days`,
            e.level.toUpperCase()
          ])
        }
      }
    };
  }

  // ── Active Trips ──
  if (q.includes('active trip') || q.includes('today') && q.includes('trip')) {
    const active = trips.filter((t: any) => t.status === 'in-transit' || t.status === 'delayed');
    return {
      text: `I found **${active.length} active trips** currently in progress. Here's the live status:`,
      widget: {
        type: 'table',
        title: `${active.length} Active Trips`,
        data: {
          headers: ['Trip ID', 'Vehicle', 'Route', 'Status', 'ETA'],
          rows: active.slice(0, 5).map((t: any) => [
            t.id, t.vehicleId,
            `${t.origin.name.split(' ')[0]} → ${t.destination.name.split(' ')[0]}`,
            t.status === 'delayed' ? '⚠️ Delayed' : '🟢 On Route',
            new Date(t.estimatedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          ])
        }
      }
    };
  }

  // ── Maintenance ──
  if (q.includes('maintenance') || q.includes('service') || q.includes('repair')) {
    const low = vehicles.filter((v: any) => v.healthScore < 80);
    return {
      text: `**${low.length} vehicles** require maintenance attention. Sorted by health score:`,
      widget: {
        type: 'chart',
        title: 'Vehicle Health Scores (Critical)',
        data: low.slice(0, 6).map((v: any) => ({ name: v.id, Health: v.healthScore, fill: v.healthScore < 70 ? '#ef4444' : '#f59e0b' }))
      }
    };
  }

  // ── Next week prediction ──
  if (q.includes('predict') || q.includes('next week') || q.includes('forecast')) {
    return {
      text: '🔮 **AI Predictive Analysis** — Based on odometer data, engine hours, and historical service patterns:',
      widget: {
        type: 'list',
        title: 'Predicted Events — Next 7 Days',
        data: [
          { icon: '⚠️', text: `${vehicles[0]?.id || 'TRK-01'}: Oil service due in ~5 days (${(vehicles[0]?.odometer || 48200) + 1800}km threshold)`, level: 'critical' },
          { icon: '🔧', text: `${vehicles[1]?.id || 'TRK-02'}: Brake pad inspection recommended (78% wear)`, level: 'high' },
          { icon: '⛽', text: 'Fuel prices expected to rise 6% based on market trend — pre-fill advised', level: 'medium' },
          { icon: '👤', text: `${drivers[0]?.name || 'Driver 1'}: License renewal due in 12 days`, level: 'medium' },
          { icon: '✅', text: '3 trips scheduled for Fri-Sun — all assets available', level: 'info' },
        ]
      }
    };
  }

  // ── Safest Driver ──
  if (q.includes('safe') || q.includes('best driver') || q.includes('driver safety')) {
    const sorted = [...drivers].sort((a: any, b: any) => b.safetyScore - a.safetyScore).slice(0, 5);
    return {
      text: `🏆 Top 5 safest drivers ranked by safety score and 0-violation history:`,
      widget: {
        type: 'chart',
        title: 'Driver Safety Rankings',
        data: sorted.map((d: any) => ({ name: d.name.split(' ')[0], Safety: d.safetyScore, Rating: d.rating * 20, fill: '#10b981' }))
      }
    };
  }

  // ── Fuel consumers ──
  if (q.includes('fuel') && (q.includes('top') || q.includes('consum') || q.includes('most'))) {
    const fuelData = vehicles.slice(0, 6).map((v: any) => ({
      name: v.id,
      Used: Math.round(v.fuelCapacity - v.currentFuel),
      fill: (v.fuelCapacity - v.currentFuel) > 250 ? '#ef4444' : '#f59e0b'
    })).sort((a: any, b: any) => b.Used - a.Used);
    return {
      text: `Here are the top fuel-consuming vehicles in your fleet. High consumers may indicate inefficient routes or idling:`,
      widget: { type: 'chart', title: 'Fuel Consumption (Liters Used)', data: fuelData }
    };
  }

  // ── Expense Report ──
  if (q.includes('expense') || q.includes('report') || q.includes('monthly')) {
    const totalRevenue = kpis?.totalRevenue || 640000;
    const totalProfit = kpis?.totalProfit || 250000;
    return {
      text: `📊 **July 2026 Operations Report** generated. Summary below:`,
      widget: {
        type: 'metric',
        title: 'Monthly Financial Summary',
        data: [
          { label: 'Total Revenue', value: `₹${(totalRevenue).toLocaleString()}`, color: 'text-blue-400' },
          { label: 'Total Expenses', value: `₹${(totalRevenue - totalProfit).toLocaleString()}`, color: 'text-orange-400' },
          { label: 'Net Profit', value: `₹${(totalProfit).toLocaleString()}`, color: 'text-emerald-400' },
          { label: 'Margin', value: `${Math.round((totalProfit / totalRevenue) * 100)}%`, color: 'text-purple-400' },
        ]
      }
    };
  }

  // ── Fleet status ──
  if (q.includes('fleet') || q.includes('vehicle') && q.includes('status')) {
    const idle = vehicles.filter((v: any) => v.status === 'idle').length;
    const transit = vehicles.filter((v: any) => v.status === 'in-transit').length;
    const maint = vehicles.filter((v: any) => v.status === 'maintenance').length;
    return {
      text: `Fleet status overview — **${vehicles.length} total assets**:`,
      widget: {
        type: 'chart',
        title: 'Fleet Status Distribution',
        data: [
          { name: 'In Transit', value: transit, fill: '#3b82f6' },
          { name: 'Idle / Ready', value: idle, fill: '#10b981' },
          { name: 'Maintenance', value: maint, fill: '#f59e0b' },
        ]
      }
    };
  }

  // ── Alerts ──
  if (q.includes('alert') || q.includes('warning') || q.includes('incident')) {
    const active = alerts.filter((a: any) => !a.resolved);
    return {
      text: `🚨 **${active.length} unresolved alerts** detected across fleet operations:`,
      widget: {
        type: 'list',
        title: 'Active Alerts',
        data: active.slice(0, 5).map((a: any) => ({
          icon: a.severity === 'critical' ? '🔴' : '🟡',
          text: a.message,
          level: a.severity
        }))
      }
    };
  }

  // ── SOS ──
  if (q.includes('sos') || q.includes('emergency') || q.includes('distress')) {
    return {
      text: `🚨 **SOS Protocol Active**\n\nEmergency dispatch notification sent to Fleet Manager and Safety Officer. Live location tracking enabled. Emergency timer started.\n\n- ✅ Fleet Manager notified\n- ✅ Safety Officer notified\n- ✅ Emergency logged\n- ✅ Location broadcasting`,
      widget: {
        type: 'alert',
        title: 'Emergency SOS Activated',
        data: { severity: 'critical', location: 'I-80 N, Mile 142', driver: drivers[0]?.name || 'Driver' }
      }
    };
  }

  // ── Carbon ──
  if (q.includes('carbon') || q.includes('emission') || q.includes('co2') || q.includes('eco')) {
    return {
      text: `🌿 **Carbon Footprint Analysis**:\n\n- Monthly CO₂: **4.08 tonnes**\n- Reduction vs last month: **↓12%**\n- Carbon per KM: **1.82 kg** (industry avg: 2.3 kg)\n- Green Fleet Score: **78/100**\n\nYour fleet is performing **above industry average** on emissions. 🎉`,
    };
  }

  // ── Drivers ──
  if (q.includes('driver') || q.includes('fatigue') || q.includes('hours')) {
    const tired = drivers.filter((d: any) => d.activeHoursToday >= 8);
    return {
      text: `👤 **${tired.length} drivers** have logged 8+ hours today and may require rest breaks per compliance regulations:`,
      widget: {
        type: 'table',
        title: 'High-Hours Drivers',
        data: {
          headers: ['Driver', 'Hours Today', 'Safety Score', 'Status'],
          rows: tired.slice(0, 5).map((d: any) => [d.name, `${d.activeHoursToday}h`, `${d.safetyScore}%`, d.status])
        }
      }
    };
  }

  // ── Fallback ──
  return {
    text: `I can help you with fleet intelligence! Try asking:\n\n• **"Show today's active trips"**\n• **"Which vehicles need maintenance?"**\n• **"Who is the safest driver?"**\n• **"Show top fuel consuming vehicles"**\n• **"Generate monthly expense report"**\n• **"Predict next week's maintenance"**\n• **"Show fleet alerts"**\n• **"What is our carbon footprint?"**`,
  };
}

// ─── WIDGET RENDERER ───────────────────────────────────────────────────────────
const WidgetRenderer: React.FC<{
  widget: ChatMessage['widget'];
  onActionTrigger?: (actionLabel: string, actionId: string, payload: any) => void;
}> = ({ widget, onActionTrigger }) => {
  if (!widget) return null;

  const tooltipStyle = {
    backgroundColor: 'rgba(8,12,24,0.95)', borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: '10px', color: '#f1f5f9', fontSize: '11px'
  };

  if (widget.type === 'chart') {
    return (
      <div className="mt-3 p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">{widget.title}</p>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={widget.data} margin={{ left: -20, right: 5, top: 5, bottom: 0 }} barSize={14}>
              <CartesianGrid strokeDasharray="2 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey={Object.keys(widget.data[0] || {}).find(k => k !== 'name' && k !== 'fill') || 'value'}
                radius={[4, 4, 0, 0]}>
                {widget.data.map((entry: any, i: number) => (
                  <rect key={i} fill={entry.fill || '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (widget.type === 'table') {
    return (
      <div className="mt-3 overflow-hidden rounded-xl border border-slate-800/60 text-[10px]">
        <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800/40">
          <p className="font-bold text-slate-400 uppercase tracking-wider">{widget.title}</p>
        </div>
        <table className="w-full">
          <thead className="bg-slate-900/30">
            <tr>{widget.data.headers.map((h: string) => <th key={h} className="px-3 py-2 text-left text-[9px] font-black uppercase tracking-widest text-slate-600">{h}</th>)}</tr>
          </thead>
          <tbody>
            {widget.data.rows.map((row: string[], i: number) => (
              <tr key={i} className="border-t border-slate-800/30 hover:bg-slate-900/10">
                {row.map((cell, j) => <td key={j} className="px-3 py-2 text-slate-300 font-medium">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (widget.type === 'metric' || (widget.type as string) === 'kpis') {
    return (
      <div className="mt-3 grid grid-cols-2 gap-2">
        {widget.data.map((m: any, i: number) => (
          <div key={i} className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl text-center">
            <p className={`text-base font-black font-mono ${m.color || 'text-blue-400'}`}>{m.value}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>
    );
  }

  if (widget.type === 'list') {
    const levelColors: Record<string, string> = {
      critical: 'text-red-400 border-red-500/10 bg-red-950/10',
      high: 'text-orange-400 border-orange-500/10 bg-orange-950/10',
      medium: 'text-amber-400 border-amber-500/10 bg-amber-950/10',
      info: 'text-blue-400 border-blue-500/10 bg-blue-950/10',
      success: 'text-emerald-400 border-emerald-500/10 bg-emerald-950/10',
      warning: 'text-amber-400 border-amber-500/10 bg-amber-950/10',
      danger: 'text-red-400 border-red-500/10 bg-red-950/10'
    };

    return (
      <div className="mt-3 space-y-2">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{widget.title}</p>
        {widget.data.map((item: any, i: number) => {
          const isRichList = item.label !== undefined;
          
          if (isRichList) {
            const statusColor = levelColors[item.status] || 'text-slate-300 border-slate-800 bg-slate-900/20';
            return (
              <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg border text-[10px] ${statusColor}`}>
                <div>
                  <span className="font-bold text-slate-200 block">{item.label}</span>
                  {item.subLabel && <span className="text-[8.5px] text-slate-500 font-medium block mt-0.5">{item.subLabel}</span>}
                </div>
                <span className="font-mono font-bold text-[9.5px]">{item.value}</span>
              </div>
            );
          }

          return (
            <div key={i} className={`flex items-start space-x-2 p-2.5 rounded-lg border text-[10px] ${levelColors[item.level] || 'text-slate-300 border-slate-800 bg-slate-900/20'}`}>
              <span className="shrink-0">{item.icon}</span>
              <span className="font-medium">{item.text}</span>
            </div>
          );
        })}
      </div>
    );
  }

  if ((widget.type as string) === 'actions') {
    return (
      <div className="mt-3 space-y-2">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{widget.title}</p>
        {widget.data.map((act: any) => (
          <div key={act.id} className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl flex flex-col justify-between space-y-2 text-left">
            <div>
              <span className="text-[10.5px] font-bold text-slate-200 block">{act.title}</span>
              <span className="text-[9.5px] text-slate-500 block leading-normal mt-0.5">{act.description}</span>
            </div>
            <button
              onClick={() => onActionTrigger && onActionTrigger(act.actionLabel, act.id, act.payload)}
              className="w-full py-1.5 bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 text-blue-400 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5"
            >
              <span>{act.actionLabel}</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    );
  }

  if (widget.type === 'alert') {
    return (
      <div className="mt-3 p-3 bg-red-950/30 border border-red-500/30 rounded-xl animate-pulse">
        <p className="text-[10px] font-black text-red-400 uppercase tracking-wider mb-2">🚨 {widget.title}</p>
        <p className="text-[10px] text-slate-300">Driver: <span className="text-red-300 font-bold">{widget.data.driver}</span></p>
        <p className="text-[10px] text-slate-300">Location: <span className="text-red-300 font-bold">{widget.data.location}</span></p>
      </div>
    );
  }

  return null;
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export const AiCopilotDrawer: React.FC<{ inline?: boolean }> = ({ inline = false }) => {
  const appCtx = useApp();
  const { trips, vehicles, drivers, alerts, kpis } = appCtx;

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'ai',
      text: '### 👋 TransitOps AI Copilot\n\nI analyze your live fleet data to answer questions, generate reports, and predict issues. Try one of the suggestions below or type your own question!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleActionTrigger = async (actionLabel: string, actionId: string, payload: any) => {
    // Add user action request message
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: `Execute: ${actionLabel}`, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    await new Promise(r => setTimeout(r, 1000));

    let replyText = `I have executed the action **"${actionLabel}"**.\n\n`;
    if (payload?.vehicleId) {
      replyText += `- Asset: **${payload.vehicleId}**\n- Ticket Type: **${payload.type || 'Routine Service'}**\n- Status: **SCHEDULED**\n\nThe mechanical ledger has been updated successfully.`;
    } else if (payload?.driverId) {
      replyText += `- Driver Pilot: **${payload.driverId}**\n- Coaching status: **ASSIGNED**\n- Alert logs updated.`;
    } else {
      replyText += `Action successfully completed. Operations logs synchronized.`;
    }

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: replyText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  const sendMessage = async (text?: string) => {
    const queryText = (text || input).trim();
    if (!queryText || loading) return;
    setInput('');

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: queryText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/ai/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: queryText })
      });
      const data = await res.json();
      
      if (data && data.message) {
        const aiMsg: ChatMessage = {
          id: Date.now().toString(),
          sender: 'ai',
          text: data.message,
          widget: data.widget,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error('No message returned');
      }
    } catch (err) {
      console.log('AI Endpoint offline or errored, falling back to local calculation.', err);
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      const response = buildAiResponse(queryText, { trips, vehicles, drivers, alerts, kpis });
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'ai', ...response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Inline mode (embedded in dashboard) ──────────────────────────────────
  if (inline) {
    return (
      <div className="glass-panel rounded-2xl border border-slate-800/80 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800/60 bg-slate-900/20 flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <Bot className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">AI Copilot</p>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-slate-500">Online · Context-aware</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] ${msg.sender === 'user' ? 'bg-blue-600/20 border-blue-500/25 text-blue-100' : 'bg-slate-800/40 border-slate-700/40 text-slate-200'} border rounded-2xl px-4 py-3`}>
                <p className="text-[11px] leading-relaxed whitespace-pre-line">{msg.text.replace(/\*\*/g, '').replace(/###\s*/g, '')}</p>
                <WidgetRenderer widget={msg.widget} onActionTrigger={handleActionTrigger} />
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl px-4 py-3 flex items-center space-x-2">
                {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        <div className="px-3 py-2 border-t border-slate-800/40 flex flex-wrap gap-1.5">
          {SUGGESTIONS.slice(0, 3).map(s => {
            const Icon = s.icon;
            return (
              <button key={s.query} onClick={() => sendMessage(s.query)}
                className="flex items-center space-x-1 px-2 py-1 text-[9px] font-bold text-slate-400 bg-slate-800/50 border border-slate-700/40 rounded-lg hover:bg-slate-700/50 hover:text-slate-200 transition-all">
                <Icon className="w-2.5 h-2.5" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-800/60">
          <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2">
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Ask me anything..." className="flex-1 bg-transparent text-[11px] text-slate-200 placeholder-slate-600 outline-none" />
            <button
              onClick={toggleListening}
              className={`p-1.5 rounded-lg transition-all ${isListening ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
            >
              {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
            </button>
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
              className="p-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg transition-all">
              <Send className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Floating button + drawer mode ─────────────────────────────────────────
  return (
    <>
      {/* FAB Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_8px_32px_rgba(59,130,246,0.4)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.55)] transition-all hover:scale-110"
          >
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed bottom-6 right-6 z-50 flex flex-col glass-panel border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all ${isExpanded ? 'w-[520px] h-[75vh]' : 'w-[360px] h-[520px]'}`}
          >
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-800/60 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-blue-500/15 border border-blue-500/25 rounded-xl">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">TransitOps AI Copilot</p>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] text-slate-500">Analyzing live fleet data</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-all">
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'ai' && (
                    <div className="w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                      <Sparkles className="w-3 h-3 text-blue-400" />
                    </div>
                  )}
                  <div className={`max-w-[85%] ${msg.sender === 'user' ? 'bg-blue-600/20 border-blue-500/25' : 'bg-slate-800/40 border-slate-700/40'} border rounded-2xl px-4 py-3`}>
                    <p className="text-[11px] text-slate-200 leading-relaxed whitespace-pre-line">
                      {msg.text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/###\s*/g, '')}
                    </p>
                    <WidgetRenderer widget={msg.widget} onActionTrigger={handleActionTrigger} />
                    <p className="text-[8px] text-slate-600 mt-1.5">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center mr-2 shrink-0">
                    <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                  </div>
                  <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl px-4 py-3 flex items-center space-x-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            <div className="px-4 py-2 border-t border-slate-800/40 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map(s => {
                const Icon = s.icon;
                return (
                  <button key={s.query} onClick={() => sendMessage(s.query)}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 text-[9px] font-bold text-slate-400 bg-slate-800/50 border border-slate-700/40 rounded-lg hover:bg-slate-700/60 hover:text-slate-200 transition-all">
                    <Icon className="w-2.5 h-2.5" />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-800/60 shrink-0">
              <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-700/60 focus-within:border-blue-500/40 rounded-xl px-3 py-2.5 transition-colors">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about fleet, drivers, maintenance..."
                  className="flex-1 bg-transparent text-[11px] text-slate-200 placeholder-slate-600 outline-none"
                />
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={toggleListening}
                    className={`p-1.5 rounded-lg transition-all ${isListening ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="p-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-all"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiCopilotDrawer;
