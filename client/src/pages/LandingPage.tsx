import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Navigation, Zap, Award, BarChart3, ChevronDown, Check, ArrowRight, Activity, DollarSign } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: (presetRole?: string, targetTab?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    { icon: <Activity className="w-5 h-5 text-blue-400" />, title: "Digital Twin Engine", desc: "Simulate physics, fuel burn, traffic bottlenecks, and weather delays on a live ticking map.", presetRole: "dispatcher", targetTab: "dashboard" },
    { icon: <Sparkles className="w-5 h-5 text-emerald-400" />, title: "AI Dispatch Scoring", desc: "Algorithmically match vehicle capacity, driver ratings, and route risks to dispatch loads.", presetRole: "dispatcher", targetTab: "dispatch" },
    { icon: <Zap className="w-5 h-5 text-amber-400" />, title: "Natural Language Copilot", desc: "Ask questions, generate charts, and approve re-routings using Gemini AI operations summaries.", presetRole: "dispatcher", targetTab: "dashboard" },
    { icon: <Shield className="w-5 h-5 text-red-400" />, title: "SOS & Compliance Audit", desc: "Automated license validity reviews, vehicle fitness blockers, and emergency SOS response lines.", presetRole: "safety", targetTab: "dashboard" },
    { icon: <Award className="w-5 h-5 text-purple-400" />, title: "Driver Gamification", desc: "Motivate safe driving using ranking boards, badges, points streaks, and reward cashouts.", presetRole: "driver", targetTab: "driver-app" },
    { icon: <DollarSign className="w-5 h-5 text-indigo-400" />, title: "Financial Intelligence", desc: "Real-time fuel efficiency logs, expense approvals, profit analysis, and carbon accounting.", presetRole: "finance", targetTab: "dashboard" },
  ];

  const pricing = [
    { title: "Starter", price: "₹12,500", desc: "Ideal for local fleets managing up to 10 vehicles.", features: ["Real-time GPS Tracking", "Basic Telemetry Updates", "Excel Data Import", "Email support", "Standard routing logs"], popular: false, presetRole: "driver", targetTab: "driver-app" },
    { title: "Enterprise Pro", price: "₹42,000", desc: "AI-driven optimizations for regional transport networks.", features: ["Everything in Starter", "Digital Twin Live Simulator", "Smart Dispatching Rank Board", "Driver Gamification Tiers", "Gemini AI Assistant Drawer", "SMS/Email SOS notifications"], popular: true, presetRole: "dispatcher", targetTab: "dispatch" },
    { title: "Custom OEM", price: "Custom", desc: "API integrations and custom maps for national carriers.", features: ["Everything in Pro", "Multi-Tenant Org Controls", "Offline JSON Seeding", "API webhooks integration", "24/7 Dedicated Support", "SLA contract custom rules"], popular: false, presetRole: "admin", targetTab: "dashboard" }
  ];

  const faqs = [
    { q: "How does the Digital Twin simulator differ from standard GPS?", a: "Traditional systems only show historic or current positions. TransitOps+ runs a live ticking simulation calculating driver fatigue, highway friction, weather delays, and fuel efficiency in real-time." },
    { q: "What happens if our connection to MongoDB or the AI API goes offline?", a: "The platform is built with an enterprise-grade offline fallback. It automatically switches to a seeded local JSON store so dispatch logs and maps keep running without crashing." },
    { q: "How are driver reward points calculated?", a: "Points are awarded automatically upon completion of a trip, weighted by the driver's safe streak, route difficulty, and safe-driving indices." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            T+
          </div>
          <span className="font-extrabold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
            TransitOps<span className="text-blue-500">+</span>
          </span>
        </div>
        
        <div className="hidden md:flex space-x-8 text-xs font-semibold text-slate-400">
          <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-blue-400 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-blue-400 transition-colors">FAQs</a>
        </div>

        <button 
          onClick={() => onGetStarted()}
          className="px-4.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-1 hover:scale-105"
        >
          <span>Get Started</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-black uppercase text-blue-400 tracking-wider mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>The AI-Powered Fleet Intelligence & Digital Twin Platform</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black tracking-tight max-w-3xl leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
        >
          Replace spreadsheets. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Command your fleet in real-time.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 text-sm sm:text-base max-w-xl mt-6 leading-relaxed"
        >
          TransitOps+ connects predictive routing math, live telemetry streams, role-specific cockpits, and natural language Gemini AI helpers to automate your logistics pipeline.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center"
        >
          <button 
            onClick={() => onGetStarted()}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 group hover:scale-105"
          >
            <span>Launch Command Board</span>
            <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-slate-950 border-t border-slate-900 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100">Engineered for Enterprise Logistics</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-2 font-bold">Six roles, one unified digital twin framework</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div 
              key={i} 
              onClick={() => onGetStarted(feat.presetRole, feat.targetTab)}
              className="glass-panel p-6.5 rounded-3xl border border-slate-900 hover:border-blue-500/30 hover:bg-slate-900/40 cursor-pointer transition-all hover:scale-[1.02] duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 transition-colors group-hover:border-blue-500/40">
                  {feat.icon}
                </div>
                <h3 className="font-extrabold text-sm text-slate-200 group-hover:text-blue-400 transition-colors">{feat.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{feat.desc}</p>
              </div>
              
              <div className="mt-4 flex items-center text-[10px] font-black uppercase text-blue-500 group-hover:text-blue-400 tracking-wider transition-all">
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Ambient Hover Glow overlay */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-bl-full pointer-events-none transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t border-slate-900 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100">Flexible SaaS Pricing</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-2 font-bold">Transparent billing matched to your fleet scale</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {pricing.map((tier, i) => (
            <div 
              key={i} 
              onClick={() => onGetStarted(tier.presetRole, tier.targetTab)}
              className={`glass-panel p-8 rounded-3xl border flex flex-col relative cursor-pointer hover:scale-[1.01] hover:border-blue-500/30 transition-all duration-300 ${
                tier.popular 
                  ? 'border-blue-500/40 ring-1 ring-blue-500/20 bg-blue-950/5 shadow-[0_0_30px_rgba(59,130,246,0.1)]' 
                  : 'border-slate-900'
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full border border-blue-400">
                  Most Popular
                </span>
              )}
              <h3 className="font-black text-lg text-slate-200">{tier.title}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-black text-white">{tier.price}</span>
                <span className="text-xs text-slate-500 ml-1">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">{tier.desc}</p>
              
              <ul className="mt-6.5 space-y-3.5 flex-1 border-t border-slate-900 pt-6 text-xs text-slate-350">
                {tier.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start space-x-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`w-full py-3 font-extrabold text-xs rounded-xl mt-8 transition-colors ${
                  tier.popular 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                    : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800'
                }`}
              >
                Choose {tier.title}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-t border-slate-900 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-panel rounded-2xl border border-slate-900 overflow-hidden">
              <button 
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full px-6 py-4.5 text-left flex justify-between items-center text-slate-200 hover:text-white font-bold text-xs sm:text-sm"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === i && (
                <div className="px-6 pb-5 pt-1 text-slate-400 text-xs leading-relaxed border-t border-slate-950">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 px-6 text-center text-xs text-slate-500 max-w-7xl mx-auto">
        <div className="flex justify-center items-center space-x-2.5 mb-4">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center font-bold text-white text-[10px]">T</div>
          <span className="font-extrabold text-slate-350 tracking-wider">TransitOps+</span>
        </div>
        <p>© 2026 TransitOps+ AI Fleet Command Technologies Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};
export default LandingPage;
