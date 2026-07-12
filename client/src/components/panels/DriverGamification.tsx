import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import {
  Trophy, Medal, Star, Shield, Leaf, Award, Zap, Target, Clock,
  TrendingUp, CheckCircle2, Gift, Crown, ChevronUp, ChevronDown, Users
} from 'lucide-react';

// ─── TIER CONFIG ──────────────────────────────────────────────────────────────
const TIERS = [
  { id: 'Legend', min: 9000, color: 'from-yellow-400 to-orange-500', text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.25)]', icon: '👑' },
  { id: 'Elite', min: 6000, color: 'from-purple-400 to-pink-500', text: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', glow: 'shadow-[0_0_18px_rgba(168,85,247,0.2)]', icon: '⚡' },
  { id: 'Diamond', min: 4000, color: 'from-cyan-300 to-blue-400', text: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30', glow: 'shadow-[0_0_16px_rgba(34,211,238,0.2)]', icon: '💎' },
  { id: 'Platinum', min: 2500, color: 'from-slate-300 to-slate-400', text: 'text-slate-300', bg: 'bg-slate-600/10 border-slate-500/30', glow: '', icon: '🏆' },
  { id: 'Gold', min: 1500, color: 'from-amber-400 to-yellow-500', text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', glow: 'shadow-[0_0_12px_rgba(245,158,11,0.15)]', icon: '🥇' },
  { id: 'Silver', min: 800, color: 'from-slate-300 to-slate-500', text: 'text-slate-300', bg: 'bg-slate-500/10 border-slate-400/20', glow: '', icon: '🥈' },
  { id: 'Bronze', min: 300, color: 'from-amber-700 to-orange-700', text: 'text-amber-700', bg: 'bg-amber-900/10 border-amber-700/20', glow: '', icon: '🥉' },
  { id: 'New Driver', min: 0, color: 'from-slate-500 to-slate-600', text: 'text-slate-500', bg: 'bg-slate-800/30 border-slate-700/20', glow: '', icon: '🚛' },
];

const getTier = (points: number) => TIERS.find(t => points >= t.min) || TIERS[TIERS.length - 1];

// ─── BADGE DEFINITIONS ────────────────────────────────────────────────────────
const ALL_BADGES = [
  { id: 'safe_driver', label: 'Safe Driver', icon: Shield, color: 'text-blue-400 bg-blue-500/10 border-blue-500/25', desc: 'Zero violations for 10 shifts', req: (d: any) => d.safetyScore >= 90 },
  { id: 'fuel_saver', label: 'Fuel Saver', icon: Leaf, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25', desc: 'Fuel efficiency top 10%', req: (d: any) => d.safetyScore >= 85 },
  { id: 'zero_accident', label: 'Zero Accident', icon: CheckCircle2, color: 'text-green-400 bg-green-500/10 border-green-500/25', desc: '6-month clean record', req: (d: any) => d.safetyScore >= 92 },
  { id: 'early_bird', label: 'Early Bird', icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/25', desc: 'Delivered early 5+ times', req: (d: any) => d.gamification.points >= 500 },
  { id: 'eco_driver', label: 'Eco Driver', icon: Leaf, color: 'text-teal-400 bg-teal-500/10 border-teal-500/25', desc: 'Carbon footprint < 1.5 kg/km', req: (d: any) => d.rating >= 4.5 },
  { id: 'night_rider', label: 'Night Rider', icon: Star, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25', desc: '5+ night deliveries completed', req: (d: any) => d.gamification.safeDrivingStreak >= 7 },
  { id: 'customer_fav', label: 'Customer Fav', icon: Star, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25', desc: 'Avg rating 4.8+ stars', req: (d: any) => d.rating >= 4.8 },
  { id: 'fast_dispatch', label: 'Fast Dispatch', icon: Zap, color: 'text-orange-400 bg-orange-500/10 border-orange-500/25', desc: 'Pickup in <15 min avg', req: (d: any) => d.gamification.points >= 1000 },
  { id: '100_trips', label: '100 Trips', icon: Trophy, color: 'text-purple-400 bg-purple-500/10 border-purple-500/25', desc: 'Completed 100 deliveries', req: (d: any) => d.totalMiles >= 10000 },
  { id: 'maintenance_champ', label: 'Maint. Champ', icon: Award, color: 'text-rose-400 bg-rose-500/10 border-rose-500/25', desc: 'Vehicle always maintained', req: (d: any) => d.gamification.tier === 'Diamond' || d.gamification.tier === 'Gold' },
];

// ─── REWARD EVENTS ────────────────────────────────────────────────────────────
const REWARD_EVENTS = [
  { label: 'Completed Trip', pts: +20, color: 'text-emerald-400', icon: '✅' },
  { label: 'Safe Driving Bonus', pts: +30, color: 'text-blue-400', icon: '🛡️' },
  { label: 'No Accident (Month)', pts: +50, color: 'text-green-400', icon: '🎯' },
  { label: 'Fuel Efficient', pts: +25, color: 'text-teal-400', icon: '⛽' },
  { label: 'Customer 5★ Rating', pts: +40, color: 'text-yellow-400', icon: '⭐' },
  { label: 'Early Delivery', pts: +20, color: 'text-cyan-400', icon: '⏰' },
  { label: 'Late Delivery', pts: -10, color: 'text-orange-400', icon: '⏱️' },
  { label: 'Traffic Violation', pts: -30, color: 'text-red-400', icon: '🚫' },
  { label: 'Accident', pts: -100, color: 'text-rose-400', icon: '💥' },
];

// ─── PODIUM ───────────────────────────────────────────────────────────────────
const PodiumBlock: React.FC<{ driver: any; rank: number }> = ({ driver, rank }) => {
  const tier = getTier(driver.gamification.points);
  const heights = { 1: 'h-24', 2: 'h-16', 3: 'h-12' };
  const trophyColors = { 1: 'text-yellow-400', 2: 'text-slate-300', 3: 'text-amber-700' };
  const trophyIcons = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <div className={`flex flex-col items-center ${rank === 1 ? 'order-2' : rank === 2 ? 'order-1' : 'order-3'}`}>
      {/* Avatar */}
      <div className={`relative mb-2 ${rank === 1 ? 'scale-110' : ''}`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border-2 ${
          rank === 1 ? 'border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.3)]' :
          rank === 2 ? 'border-slate-500/40 bg-slate-600/10' : 'border-amber-700/40 bg-amber-900/10'
        }`}>
          {driver.name.charAt(0)}
        </div>
        <div className="absolute -top-3 -right-2 text-xl">{trophyIcons[rank as keyof typeof trophyIcons]}</div>
        {rank === 1 && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-lg">👑</div>
        )}
      </div>

      <p className="text-xs font-bold text-slate-200 text-center max-w-20 truncate">{driver.name.split(' ')[0]}</p>
      <p className="text-[10px] font-black text-blue-400 font-mono">{driver.gamification.points.toLocaleString()} pts</p>
      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border mt-1 ${tier.bg} ${tier.text}`}>
        {tier.icon} {tier.id}
      </span>

      {/* Podium base */}
      <div className={`w-20 ${heights[rank as keyof typeof heights]} mt-3 rounded-t-xl flex items-center justify-center ${
        rank === 1 ? 'bg-gradient-to-t from-yellow-600/30 to-yellow-500/15 border border-yellow-500/30' :
        rank === 2 ? 'bg-gradient-to-t from-slate-600/30 to-slate-500/15 border border-slate-500/30' :
        'bg-gradient-to-t from-amber-800/30 to-amber-700/15 border border-amber-700/30'
      }`}>
        <span className={`text-xl font-black ${trophyColors[rank as keyof typeof trophyColors]}`}>#{rank}</span>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export const DriverGamification: React.FC = () => {
  const { drivers } = useApp();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'badges' | 'rewards' | 'levels'>('leaderboard');
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  const sorted = [...drivers].sort((a, b) => b.gamification.points - a.gamification.points);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const TABS = [
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'rewards', label: 'Reward Engine', icon: Gift },
    { id: 'levels', label: 'Level System', icon: Crown },
  ] as const;

  return (
    <div className="space-y-6 font-sans text-slate-100">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-100 flex items-center space-x-3">
            <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <span>Driver Gamification League</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 ml-14">Safety rankings · Reward engine · Badge achievements · Level progression</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 glass-panel px-4 py-2 rounded-xl border border-slate-800">
          <Users className="w-3.5 h-3.5" />
          <span>{drivers.length} Active Drivers</span>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex items-center space-x-1 glass-panel p-1.5 rounded-2xl border border-slate-800 w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/25' : 'text-slate-500 hover:text-slate-300'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>

          {/* ═══════════════════ LEADERBOARD ═══════════════════ */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              {/* Podium */}
              {top3.length >= 3 && (
                <div className="glass-panel p-8 rounded-2xl border border-slate-800/80">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest text-center mb-8">🏆 Monthly Champions Podium</h3>
                  <div className="flex items-end justify-center gap-4 mb-2">
                    {top3.map((d, i) => <PodiumBlock key={d.id} driver={d} rank={i + 1} />)}
                  </div>
                </div>
              )}

              {/* Full Rankings */}
              <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-900/20 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-200">Full Safety Leaderboard</h3>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Monthly Rankings</span>
                </div>
                <div className="divide-y divide-slate-800/40">
                  {sorted.map((driver, i) => {
                    const tier = getTier(driver.gamification.points);
                    const earnedBadges = ALL_BADGES.filter(b => b.req(driver)).slice(0, 3);
                    return (
                      <motion.div key={driver.id}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        onClick={() => setSelectedDriver(selectedDriver === driver.id ? null : driver.id)}
                        className={`px-6 py-4 hover:bg-slate-900/20 cursor-pointer transition-all ${tier.glow}`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          {/* Rank + Avatar */}
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border ${
                              i < 3 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-slate-900 border-slate-800 text-slate-500'
                            }`}>#{i + 1}</div>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border ${tier.bg}`}>
                              <span className={tier.text}>{driver.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-200">{driver.name}</p>
                              <div className="flex items-center space-x-2 mt-0.5">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${tier.bg} ${tier.text}`}>
                                  {tier.icon} {tier.id}
                                </span>
                                <span className="text-[9px] text-slate-500">Streak: {driver.gamification.safeDrivingStreak}d</span>
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="hidden md:flex items-center space-x-8 text-xs font-mono">
                            <div className="text-center">
                              <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Safety</p>
                              <p className={`font-black text-base ${driver.safetyScore >= 90 ? 'text-emerald-400' : driver.safetyScore >= 75 ? 'text-amber-400' : 'text-rose-400'}`}>
                                {driver.safetyScore}%
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Rating</p>
                              <p className="font-black text-base text-yellow-400">{driver.rating.toFixed(1)}★</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Points</p>
                              <p className="font-black text-base text-blue-400">{driver.gamification.points.toLocaleString()}</p>
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="flex items-center space-x-1.5">
                            {earnedBadges.map(b => {
                              const Icon = b.icon;
                              return (
                                <div key={b.id} title={b.label} className={`p-1.5 rounded-lg border ${b.color}`}>
                                  <Icon className="w-3 h-3" />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Expanded driver card */}
                        <AnimatePresence>
                          {selectedDriver === driver.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="pt-4 mt-4 border-t border-slate-800/40 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">Active Hours</p>
                                  <p className="font-bold text-slate-300 text-sm">{driver.activeHoursToday}h today</p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">Total Mileage</p>
                                  <p className="font-bold text-slate-300 text-sm font-mono">{driver.totalMiles.toFixed(0)} mi</p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">License</p>
                                  <p className="font-bold text-slate-300 text-sm font-mono">{driver.licenseNumber}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">Status</p>
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${
                                    driver.status === 'available' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                                    driver.status === 'driving' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                                    'text-slate-400 bg-slate-700/10 border-slate-600/20'
                                  }`}>{driver.status}</span>
                                </div>
                              </div>
                              {/* Progress to next tier */}
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-[10px] mb-1">
                                  <span className="text-slate-500">Progress to next tier</span>
                                  <span className="text-blue-400 font-bold">{driver.gamification.points} pts</span>
                                </div>
                                {(() => {
                                  const nextTier = TIERS[Math.max(0, TIERS.findIndex(t => driver.gamification.points >= t.min) - 1)];
                                  const pct = nextTier ? Math.min(100, Math.round((driver.gamification.points / nextTier.min) * 100)) : 100;
                                  return (
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full bg-gradient-to-r ${tier.color}`} style={{ width: `${pct}%` }} />
                                    </div>
                                  );
                                })()}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ BADGES ═══════════════════ */}
          {activeTab === 'badges' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
                <h3 className="text-sm font-bold text-slate-200 mb-5 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>Achievement Badge Catalog</span>
                  <span className="text-[10px] text-slate-500 font-medium">(Auto-awarded based on performance)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ALL_BADGES.map((badge, i) => {
                    const Icon = badge.icon;
                    const earnedBy = drivers.filter(d => badge.req(d));
                    return (
                      <motion.div key={badge.id}
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                        className={`p-4 rounded-xl border ${badge.color} bg-opacity-5 hover:brightness-110 transition-all`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2.5 rounded-xl border ${badge.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">{badge.label}</p>
                            <p className="text-[9px] text-slate-500 mt-0.5">{earnedBy.length} drivers earned</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{badge.desc}</p>
                        {earnedBy.length > 0 && (
                          <div className="flex items-center space-x-1.5 mt-2">
                            {earnedBy.slice(0, 3).map(d => (
                              <div key={d.id} className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-400">
                                {d.name.charAt(0)}
                              </div>
                            ))}
                            {earnedBy.length > 3 && <span className="text-[9px] text-slate-600">+{earnedBy.length - 3}</span>}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ REWARD ENGINE ═══════════════════ */}
          {activeTab === 'rewards' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
                <h3 className="text-sm font-bold text-slate-200 mb-5 flex items-center space-x-2">
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span>Reward Points Engine</span>
                </h3>
                <div className="space-y-2.5">
                  {REWARD_EVENTS.map((ev, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900/30 border border-slate-800/40 hover:border-slate-700/60 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-base">{ev.icon}</span>
                        <span className="text-xs font-semibold text-slate-300">{ev.label}</span>
                      </div>
                      <span className={`text-sm font-black font-mono ${ev.color}`}>
                        {ev.pts > 0 ? '+' : ''}{ev.pts} pts
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recent Rewards Feed */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
                <h3 className="text-sm font-bold text-slate-200 mb-5 flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Recent Reward Activity</span>
                </h3>
                <div className="space-y-3">
                  {sorted.slice(0, 5).map((driver, i) => {
                    const event = REWARD_EVENTS[i % REWARD_EVENTS.filter(e => e.pts > 0).length];
                    return (
                      <motion.div key={driver.id}
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/20 border border-slate-800/40"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-slate-400">
                            {driver.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">{driver.name.split(' ')[0]}</p>
                            <p className="text-[9px] text-slate-500">{REWARD_EVENTS.filter(e => e.pts > 0)[i % REWARD_EVENTS.filter(e => e.pts > 0).length].label}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-400 font-black text-sm">+{REWARD_EVENTS.filter(e => e.pts > 0)[i % REWARD_EVENTS.filter(e => e.pts > 0).length].pts}</span>
                          <span className="text-[9px] text-slate-600">{['2m', '8m', '22m', '1h', '3h'][i]} ago</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ LEVEL SYSTEM ═══════════════════ */}
          {activeTab === 'levels' && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
              <h3 className="text-sm font-bold text-slate-200 mb-6 flex items-center space-x-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span>8-Tier Driver Level System</span>
              </h3>
              <div className="space-y-4">
                {TIERS.map((tier, i) => {
                  const driversAtTier = drivers.filter(d => {
                    const dt = getTier(d.gamification.points);
                    return dt.id === tier.id;
                  });
                  return (
                    <motion.div key={tier.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      className={`p-5 rounded-xl border transition-all hover:brightness-105 ${tier.bg} ${tier.glow}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{tier.icon}</div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className={`text-sm font-black ${tier.text}`}>{tier.id}</p>
                              <span className="text-[9px] text-slate-500 font-bold">{tier.min.toLocaleString()}+ pts</span>
                            </div>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-[10px] text-slate-500">Unlocks: </span>
                              {['Certificate', 'Bonus', 'Badge', 'Leaderboard', 'Priority Routes'].slice(0, 3 - Math.min(2, i / 3 | 0)).map((perk, j) => (
                                <span key={j} className="text-[9px] font-bold text-slate-400 bg-slate-800/60 border border-slate-700/40 px-1.5 py-0.5 rounded">
                                  {perk}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-200">{driversAtTier.length}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Drivers</p>
                        </div>
                      </div>
                      {driversAtTier.length > 0 && (
                        <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-slate-800/30">
                          {driversAtTier.slice(0, 5).map(d => (
                            <div key={d.id} className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-400" title={d.name}>
                              {d.name.charAt(0)}
                            </div>
                          ))}
                          {driversAtTier.length > 5 && <span className="text-[9px] text-slate-600">+{driversAtTier.length - 5} more</span>}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DriverGamification;
