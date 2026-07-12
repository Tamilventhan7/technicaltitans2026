import React from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, Award, Shield, Star, Leaf, Medal } from 'lucide-react';

export const DriverGamification: React.FC = () => {
  const { drivers } = useApp();

  const sortedDrivers = [...drivers].sort((a, b) => b.gamification.points - a.gamification.points);

  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'Diamond': return { text: 'text-cyan-400 bg-cyan-950/20 border-cyan-500/30', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.15)]' };
      case 'Gold': return { text: 'text-amber-400 bg-amber-950/20 border-amber-500/30', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]' };
      case 'Silver': return { text: 'text-slate-300 bg-slate-800/30 border-slate-700/30', glow: '' };
      default: return { text: 'text-amber-700 bg-amber-900/10 border-amber-900/20', glow: '' };
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'Eco-Warrior': return { icon: Leaf, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' };
      case 'Safety Champion': return { icon: Shield, color: 'text-blue-400 border-blue-500/20 bg-blue-500/5' };
      case 'Midnight Runner': return { icon: Award, color: 'text-purple-400 border-purple-500/20 bg-purple-500/5' };
      case 'Customer Favorite': return { icon: Star, color: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5' };
      default: return { icon: Trophy, color: 'text-slate-400 border-slate-700/20 bg-slate-700/5' };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500 animate-bounce" />
          <span>Driver Gamification & Safety League</span>
        </h2>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
          Safety Rankings, Rewards, and Eco challenges
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 3 Champion Display */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
            <Medal className="w-4 h-4 text-yellow-500" />
            <span>Active Performance Leaderboard</span>
          </h3>

          <div className="space-y-3.5">
            {sortedDrivers.map((driver, index) => {
              const config = getTierConfig(driver.gamification.tier);
              return (
                <div
                  key={driver.id}
                  className={`glass-panel p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 border-slate-800/80 bg-slate-900/10 hover:border-slate-700 ${config.glow}`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Rank Badge */}
                    <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-sm text-slate-400">
                      #{index + 1}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">{driver.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.text}`}>
                          {driver.gamification.tier}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Odometer: {driver.totalMiles.toFixed(0)} Miles
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Telematics Metrics */}
                  <div className="flex items-center space-x-8 text-xs font-mono">
                    <div className="text-center">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Safety Score</span>
                      <div className={`font-black text-base mt-0.5 ${
                        driver.safetyScore > 90 ? 'text-emerald-400' : driver.safetyScore > 80 ? 'text-yellow-400' : 'text-rose-400'
                      }`}>
                        {driver.safetyScore}%
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Safe Streak</span>
                      <div className="font-black text-slate-200 text-base mt-0.5">
                        {driver.gamification.safeDrivingStreak} Days
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">League Points</span>
                      <div className="font-black text-blue-400 text-base mt-0.5">
                        {driver.gamification.points.toLocaleString()} pts
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gamified Achievements / Badges Center */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-6 h-fit">
          <h3 className="text-sm font-extrabold text-slate-200 tracking-wider uppercase border-b border-slate-850 pb-3 mb-4">
            Achievements & Badges
          </h3>

          <div className="space-y-4">
            {[
              { id: 'Eco-Warrior', title: 'Eco-Warrior', description: 'Maintain fuel burn rate under 0.28 L/KM on heavy trucks for 5 consecutive trips.' },
              { id: 'Safety Champion', title: 'Safety Champion', description: 'Zero telemetry violations (speeding/braking) logged across 10 shifts.' },
              { id: 'Midnight Runner', title: 'Midnight Runner', description: 'Successfully complete 5 logistics deliveries scheduled between 10PM and 5AM.' },
              { id: 'Customer Favorite', title: 'Customer Favorite', description: 'Acquire maximum feedback metrics and 4.9+ average rating.' }
            ].map(achievement => {
              const badgeConfig = getBadgeIcon(achievement.id);
              const Icon = badgeConfig.icon;
              return (
                <div key={achievement.id} className="flex items-start space-x-3.5 p-3 rounded-xl bg-slate-950/20 border border-slate-900">
                  <div className={`p-2 rounded-xl border ${badgeConfig.color} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{achievement.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DriverGamification;
