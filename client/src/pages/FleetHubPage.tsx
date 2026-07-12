import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Activity, TrendingUp, Users, MapPin, Zap, Shield,
  Radio, Wifi, CheckCircle2, ArrowRight, AlertTriangle,
  BarChart3, Navigation, Cpu, Database, Globe,
  ChevronRight, Star, Play
} from 'lucide-react';

interface FleetHubPageProps {
  onGetStarted: () => void;
  onGoBack?: () => void;
}

// ─── Live animated counter ────────────────────────────────────────────────────
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return count;
}

// ─── Blinking cursor ─────────────────────────────────────────────────────────
const Cursor: React.FC = () => {
  const [v, setV] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setV(p => !p), 520);
    return () => clearInterval(t);
  }, []);
  return <span className={`inline-block w-[2px] h-[11px] bg-blue-400 ml-0.5 align-middle ${v ? 'opacity-100' : 'opacity-0'}`} />;
};

// ─── Typewriter log line ──────────────────────────────────────────────────────
const LogLine: React.FC<{ text: string; color?: string; delay: number; timestamp: string }> = ({
  text, color = 'text-slate-400', delay, timestamp
}) => {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    const to = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => {
        setShown(text.slice(0, i + 1));
        i++;
        if (i >= text.length) { clearInterval(iv); setDone(true); }
      }, 20);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(to);
  }, [text, delay]);
  if (!shown) return null;
  return (
    <div className={`flex gap-2 ${color} font-mono text-[10px] leading-relaxed`}>
      <span className="text-slate-600 shrink-0">[{timestamp}]</span>
      <span>{shown}{!done && <Cursor />}</span>
    </div>
  );
};

// ─── Pulsing map node ─────────────────────────────────────────────────────────
const MapNode: React.FC<{ label: string; x: string; y: string; active?: boolean; color?: string }> = ({
  label, x, y, active = false, color = 'bg-blue-500'
}) => (
  <div className="absolute" style={{ left: x, top: y }}>
    {active && (
      <span className={`absolute -inset-2 rounded-full ${color} opacity-20 animate-ping`} />
    )}
    <span className={`relative w-2.5 h-2.5 rounded-full ${color} block shadow-lg`} />
    <span className="absolute left-3 top-0 text-[8px] font-bold text-slate-400 whitespace-nowrap">{label}</span>
  </div>
);

// ─── Route line SVG path ──────────────────────────────────────────────────────
const RouteLines: React.FC = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300" preserveAspectRatio="none">
    <defs>
      <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.15" />
      </linearGradient>
    </defs>
    {/* MUM → DEL */}
    <path d="M 95,200 Q 150,120 220,80" stroke="url(#routeGrad)" strokeWidth="1.5" fill="none" strokeDasharray="5 4">
      <animate attributeName="stroke-dashoffset" values="0;-60" dur="3s" repeatCount="indefinite" />
    </path>
    {/* BLR → CHE */}
    <path d="M 130,240 Q 165,235 195,230" stroke="url(#routeGrad)" strokeWidth="1.5" fill="none" strokeDasharray="5 4">
      <animate attributeName="stroke-dashoffset" values="0;-60" dur="2.5s" repeatCount="indefinite" />
    </path>
    {/* HYD → KOL */}
    <path d="M 170,205 Q 240,160 300,130" stroke="url(#routeGrad)" strokeWidth="1.5" fill="none" strokeDasharray="5 4">
      <animate attributeName="stroke-dashoffset" values="0;-60" dur="3.5s" repeatCount="indefinite" />
    </path>
    {/* DEL → JAI */}
    <path d="M 220,80 Q 195,90 170,105" stroke="url(#routeGrad)" strokeWidth="1.5" fill="none" strokeDasharray="5 4">
      <animate attributeName="stroke-dashoffset" values="0;-60" dur="2s" repeatCount="indefinite" />
    </path>
  </svg>
);

// ─── Main component ───────────────────────────────────────────────────────────
export const FleetHubPage: React.FC<FleetHubPageProps> = ({ onGetStarted, onGoBack }) => {
  const activeVehicles = useCounter(48, 2200);
  const totalTrips     = useCounter(1247, 2400);
  const onTimeRate     = useCounter(97, 1800);
  const totalDrivers   = useCounter(183, 2100);
  const totalKm        = useCounter(82450, 2800);
  const fuelSaved      = useCounter(12340, 2500);

  const now = new Date();
  const t = (offset: number) => new Date(now.getTime() - offset).toLocaleTimeString([], { hour12: false });

  const kpis = [
    { label: 'Active Vehicles', value: activeVehicles, suffix: '', icon: Truck, color: 'blue' },
    { label: 'Total Trips', value: totalTrips, suffix: '', icon: Activity, color: 'emerald' },
    { label: 'On-Time Rate', value: onTimeRate, suffix: '%', icon: TrendingUp, color: 'violet' },
    { label: 'Active Drivers', value: totalDrivers, suffix: '', icon: Users, color: 'amber' },
    { label: 'KMs Covered', value: totalKm, suffix: '', icon: Navigation, color: 'cyan' },
    { label: 'Fuel Saved (L)', value: fuelSaved, suffix: '', icon: Zap, color: 'orange' },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string; bar: string }> = {
    blue:    { bg: 'bg-blue-500/8',    text: 'text-blue-400',   border: 'border-blue-500/15',   bar: 'bg-blue-500' },
    emerald: { bg: 'bg-emerald-500/8', text: 'text-emerald-400',border: 'border-emerald-500/15',bar: 'bg-emerald-500' },
    violet:  { bg: 'bg-violet-500/8',  text: 'text-violet-400', border: 'border-violet-500/15', bar: 'bg-violet-500' },
    amber:   { bg: 'bg-amber-500/8',   text: 'text-amber-400',  border: 'border-amber-500/15',  bar: 'bg-amber-500' },
    cyan:    { bg: 'bg-cyan-500/8',    text: 'text-cyan-400',   border: 'border-cyan-500/15',   bar: 'bg-cyan-500' },
    orange:  { bg: 'bg-orange-500/8',  text: 'text-orange-400', border: 'border-orange-500/15', bar: 'bg-orange-500' },
  };

  const features = [
    { icon: Cpu,       color: 'text-blue-400',   title: 'Digital Twin Engine',       desc: 'Physics-accurate live simulation of fuel burn, traffic, and fatigue across Indian highways.' },
    { icon: Zap,       color: 'text-amber-400',   title: 'AI Dispatch Scoring',       desc: 'Gemini-powered copilot assigns routes, flags risks, and answers operations queries in natural language.' },
    { icon: Shield,    color: 'text-emerald-400', title: 'SOS & Compliance Audit',    desc: 'Automated license checks, vehicle fitness blockers, and live emergency SOS response.' },
    { icon: BarChart3, color: 'text-violet-400',  title: 'Financial Intelligence',    desc: 'Real-time fuel efficiency, expense approvals, profit analysis, and carbon footprint tracking.' },
    { icon: Globe,     color: 'text-cyan-400',    title: 'Live India Route Network',  desc: 'NH-48, NH-44, NH-65 corridors tracked with VAHAN-integrated vehicle data.' },
    { icon: Database,  color: 'text-orange-400',  title: 'Offline-First Resilience',  desc: 'MongoDB with local JSON fallback — dispatch continues even when connectivity drops.' },
  ];

  const routes = ['MUM–DEL NH-48', 'BLR–CHE NH-44', 'HYD–KOL NH-65', 'DEL–JAI NH-8', 'PNE–NGP NH-53', 'AMD–SRT NH-48'];

  return (
    <div className="min-h-screen bg-[#020812] text-slate-100 font-sans overflow-x-hidden">

      {/* ── Animated background ─────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,0.035) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.035) 1px, transparent 1px)`,
            backgroundSize: '56px 56px',
          }}
        />
        <div className="absolute top-0 left-1/4 w-[800px] h-[600px] bg-blue-600/[0.055] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-indigo-600/[0.06] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-0 w-[500px] h-[400px] bg-violet-600/[0.04] rounded-full blur-[90px]" />
        {[...Array(16)].map((_, i) => (
          <motion.div key={i}
            className="absolute w-[3px] h-[3px] rounded-full bg-blue-400/25"
            style={{ left: `${5 + i * 6}%`, top: `${10 + (i % 6) * 15}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.15, 0.5, 0.15] }}
            transition={{ duration: 4 + i * 0.3, repeat: Infinity, delay: i * 0.25 }}
          />
        ))}
      </div>

      {/* ── Sticky Nav ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#020812]/80 backdrop-blur-xl border-b border-slate-800/40 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-blue-500/30">T+</div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#020812]" />
          </div>
          <div>
            <p className="font-extrabold text-[14px] text-white tracking-tight">TransitOps<span className="text-blue-400">+</span></p>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Enterprise Fleet Intelligence</p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-[11px] font-semibold text-slate-400">
          <a href="#live-stats" className="hover:text-blue-400 transition-colors">Live Stats</a>
          <a href="#map"        className="hover:text-blue-400 transition-colors">Route Map</a>
          <a href="#features"   className="hover:text-blue-400 transition-colors">Features</a>
          <a href="#terminal"   className="hover:text-blue-400 transition-colors">System Log</a>
        </div>

        <div className="flex items-center space-x-3">
          {onGoBack && (
            <button onClick={onGoBack}
              className="text-slate-500 hover:text-slate-300 text-[11px] font-bold transition-colors">
              ← Back
            </button>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onGetStarted}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-[11px] rounded-xl shadow-lg shadow-blue-500/20 transition-all"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 lg:px-16 xl:px-24 pt-20 pb-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Headlines */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2">
                <Radio className="w-3 h-3 text-blue-400 animate-pulse" />
                <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">Live Fleet Network · India</span>
              </div>

              <h1 className="text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight">
                <span className="text-white">Intelligent</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  Fleet Operations
                </span>
                <br />
                <span className="text-white">Hub</span>
              </h1>

              <p className="text-base text-slate-400 leading-relaxed max-w-lg font-medium">
                Real-time telemetry, AI-powered dispatch, and predictive diagnostics across <strong className="text-slate-300">48+ Indian metropolitan routes</strong> — all in one command center.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                onClick={onGetStarted}
                className="relative flex items-center space-x-2.5 px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-blue-500/25 overflow-hidden"
              >
                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                  animate={{ x: ['-200%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                />
                <Zap className="w-4 h-4" />
                <span>Access Workspace</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>

              <button
                onClick={onGetStarted}
                className="flex items-center space-x-2 px-6 py-3.5 bg-slate-900/60 hover:bg-slate-800/60 text-slate-300 font-bold text-sm rounded-xl border border-slate-700/60 hover:border-slate-600/60 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Live Demo</span>
              </button>
            </div>

            <div className="flex items-center gap-6 text-[11px] text-slate-500 font-semibold">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /><span>ISO 27001 Certified</span></div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /><span>SOC 2 Type II</span></div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /><span>VAHAN Integrated</span></div>
            </div>
          </motion.div>

          {/* Right: Live map preview */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-slate-900/40 border border-slate-700/40 rounded-3xl overflow-hidden shadow-2xl shadow-black/40 backdrop-blur-sm aspect-[4/3]">
              {/* Map header bar */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-slate-900/60 border-b border-slate-800/40 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-bold text-slate-300">India Fleet Network · Live</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span className="text-[9px] font-bold text-emerald-400">CONNECTED</span>
                </div>
              </div>

              {/* India-shaped map mockup */}
              <div className="relative w-full h-full pt-10">
                {/* Background: India map silhouette gradient */}
                <div className="absolute inset-0 pt-10"
                  style={{
                    background: `radial-gradient(ellipse 70% 80% at 45% 55%, rgba(59,130,246,0.07) 0%, transparent 70%),
                      radial-gradient(ellipse 50% 60% at 50% 60%, rgba(99,102,241,0.05) 0%, transparent 60%)`,
                  }}
                />
                <div className="absolute inset-0 pt-10"
                  style={{
                    backgroundImage: `linear-gradient(rgba(59,130,246,0.025) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(59,130,246,0.025) 1px, transparent 1px)`,
                    backgroundSize: '28px 28px',
                  }}
                />

                {/* Route lines */}
                <RouteLines />

                {/* City nodes */}
                <MapNode label="Delhi"   x="23%" y="26%" active color="bg-blue-400" />
                <MapNode label="Mumbai"  x="10%" y="63%" active color="bg-emerald-400" />
                <MapNode label="Kolkata" x="55%" y="40%" active color="bg-amber-400" />
                <MapNode label="Chennai" x="38%" y="73%" active color="bg-violet-400" />
                <MapNode label="Hyd"     x="34%" y="62%"       color="bg-orange-400" />
                <MapNode label="Blore"   x="31%" y="72%"       color="bg-cyan-400" />
                <MapNode label="Jaipur"  x="19%" y="34%"       color="bg-pink-400" />
                <MapNode label="Pune"    x="14%" y="67%"       color="bg-blue-300" />

                {/* Moving trucks */}
                {[
                  { startX: 95, startY: 200, endX: 220, endY: 80, dur: 6 },
                  { startX: 130, startY: 240, endX: 195, endY: 230, dur: 4 },
                  { startX: 170, startY: 205, endX: 300, endY: 130, dur: 7 },
                ].map((truck, i) => (
                  <div key={i} className="absolute" style={{
                    left: `${(truck.startX / 400) * 100}%`,
                    top: `${(truck.startY / 300) * 100}%`,
                  }}>
                    <motion.div
                      className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"
                      animate={{
                        x: [(truck.endX - truck.startX) * 0.7, 0, (truck.endX - truck.startX) * 0.7],
                        y: [(truck.endY - truck.startY) * 0.7, 0, (truck.endY - truck.startY) * 0.7],
                      }}
                      transition={{ duration: truck.dur, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                ))}
              </div>

              {/* Overlay stats */}
              <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                {[
                  { label: 'Active', val: '48 vehicles', col: 'text-blue-400' },
                  { label: 'Alerts', val: '3 critical', col: 'text-red-400' },
                  { label: 'Routes', val: '6 live', col: 'text-emerald-400' },
                ].map(s => (
                  <div key={s.label} className="flex-1 bg-slate-900/80 rounded-xl p-2.5 border border-slate-800/50 backdrop-blur-sm">
                    <p className="text-[8px] text-slate-500 font-bold uppercase">{s.label}</p>
                    <p className={`text-[11px] font-black ${s.col}`}>{s.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/30"
            >
              ● LIVE
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          LIVE KPI CARDS
         ═══════════════════════════════════════════════════════════════ */}
      <section id="live-stats" className="relative z-10 px-6 lg:px-16 xl:px-24 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <div className="inline-flex items-center space-x-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5">
              <Activity className="w-3 h-3 text-violet-400 animate-pulse" />
              <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider">Real-Time Fleet Telemetry</span>
            </div>
            <h2 className="text-3xl font-black text-white">Live Operations Dashboard</h2>
            <p className="text-sm text-slate-500 font-medium">All metrics update in real-time via WebSocket telemetry streams.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {kpis.map((kpi, i) => {
              const c = colorMap[kpi.color];
              const KpiIcon = kpi.icon;
              return (
                <motion.div key={kpi.label}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className={`${c.bg} border ${c.border} rounded-2xl p-5 space-y-3 backdrop-blur-sm hover:border-opacity-40 transition-all group`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{kpi.label}</p>
                    <KpiIcon className={`w-3.5 h-3.5 ${c.text} group-hover:scale-110 transition-transform`} />
                  </div>
                  <p className={`text-2xl font-black ${c.text} font-mono`}>
                    {kpi.value.toLocaleString()}{kpi.suffix}
                  </p>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className={`h-full ${c.bar} rounded-full opacity-50`}
                      initial={{ width: 0 }} animate={{ width: '80%' }}
                      transition={{ delay: 1 + i * 0.1, duration: 1.2, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          LIVE ROUTE BADGES + SYSTEM TERMINAL
         ═══════════════════════════════════════════════════════════════ */}
      <section id="terminal" className="relative z-10 px-6 lg:px-16 xl:px-24 py-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">

          {/* Active Routes */}
          <div id="map" className="space-y-5">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Navigation className="w-4.5 h-4.5 text-blue-400" />
              Active Indian Corridors
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {routes.map((route, i) => (
                <motion.div key={route}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center justify-between bg-slate-900/40 border border-slate-800/40 rounded-xl px-4 py-3.5 hover:border-blue-500/20 transition-all group"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-300">{route}</span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">LIVE</span>
                </motion.div>
              ))}
            </div>

            {/* Alert strip */}
            <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-4 flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-red-300">3 Active Alerts Detected</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Engine overheat on TN-01-AV-0042 · Fuel anomaly BH-02-PQ · HYD corridor delay 18 min</p>
              </div>
            </div>
          </div>

          {/* System Terminal */}
          <div className="space-y-5">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Cpu className="w-4.5 h-4.5 text-indigo-400" />
              Fleet Daemon Terminal
            </h3>
            <div className="bg-[#050e1a] border border-slate-800/40 rounded-2xl overflow-hidden shadow-2xl">
              {/* Terminal header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/40 bg-slate-900/30">
                <div className="flex items-center space-x-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/70" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/70" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500">fleet-daemon · twin-engine-v2</span>
                </div>
                <div className="flex items-center space-x-1.5 text-emerald-400">
                  <Wifi className="w-3 h-3" />
                  <span className="text-[9px] font-bold">ONLINE</span>
                </div>
              </div>

              {/* Log lines */}
              <div className="p-5 space-y-2.5 min-h-[240px]">
                <LogLine text="BOOT digital twin simulation engine loop — socket.io v4.7" color="text-slate-500" delay={200}  timestamp={t(3200)} />
                <LogLine text="RESOLVED 48 vehicles · 8 live trips · syncing telemetry streams" color="text-blue-400" delay={900}  timestamp={t(2400)} />
                <LogLine text="SEEDED compliance ledgers · fallback MongoDB initialized" color="text-indigo-400" delay={1700} timestamp={t(1600)} />
                <LogLine text="AI dispatcher READY · Gemini route optimizer engaged" color="text-emerald-400" delay={2500} timestamp={t(800)} />
                <LogLine text="AUTH service READY · awaiting credential payload..." color="text-slate-400" delay={3200} timestamp={t(0)} />
                <div className="flex gap-1.5 pt-1">
                  <motion.span className="w-1.5 h-1.5 rounded-full bg-blue-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                  <motion.span className="w-1.5 h-1.5 rounded-full bg-indigo-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }} />
                  <motion.span className="w-1.5 h-1.5 rounded-full bg-violet-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURES GRID
         ═══════════════════════════════════════════════════════════════ */}
      <section id="features" className="relative z-10 px-6 lg:px-16 xl:px-24 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5">
              <Star className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">Enterprise Capabilities</span>
            </div>
            <h2 className="text-3xl font-black text-white">Built for India's Fleet Networks</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto font-medium">
              From NH-48 Mumbai–Delhi to last-mile hyperlocal deliveries — TransitOps+ covers every tier.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const FIcon = f.icon;
              return (
                <motion.div key={f.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="bg-slate-900/30 border border-slate-800/40 rounded-2xl p-6 hover:border-slate-700/60 hover:bg-slate-900/50 transition-all group cursor-pointer"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2.5 rounded-xl bg-slate-800/60 group-hover:scale-110 transition-transform">
                      <FIcon className={`w-5 h-5 ${f.color}`} />
                    </div>
                    <div className="space-y-1.5">
                      <p className="font-black text-sm text-slate-100">{f.title}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA SECTION
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 lg:px-16 xl:px-24 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-blue-600/15 via-indigo-600/10 to-violet-600/15 border border-blue-500/20 rounded-3xl p-12 text-center overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-blue-500/10 rounded-full blur-[60px]" />
            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl font-black text-white">Ready to take command?</h2>
              <p className="text-slate-400 text-base font-medium max-w-xl mx-auto">
                Join 200+ Indian logistics operators using TransitOps+ to optimize their fleet in real-time.
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}
                onClick={onGetStarted}
                className="inline-flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-2xl shadow-blue-500/25 transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>Access Your Workspace Now</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-slate-800/30 px-6 lg:px-16 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-[11px]">T+</div>
            <span className="text-[11px] font-bold text-slate-400">TransitOps<span className="text-blue-400">+</span></span>
          </div>
          <p className="text-[9px] text-slate-600 font-semibold uppercase tracking-widest">
            © 2026 TransitOps Inc. All Rights Reserved.
          </p>
          <div className="flex items-center space-x-1.5 text-[9px] text-slate-600 font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-500/50" />
            <span>ISO 27001 · SOC 2 Type II</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default FleetHubPage;
