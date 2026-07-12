import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key, Phone, Lock, Eye, EyeOff, ArrowLeft,
  Truck, AlertTriangle, Shield, TrendingUp, MapPin,
  ChevronRight, CheckCircle2, Zap, Sparkles
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (username: string, password?: string) => Promise<void>;
  onBackToLanding: () => void;
}

const ROLES = [
  { value: 'admin',      label: 'System Administrator',      subtitle: 'Full access · All modules',       icon: Shield,     color: 'text-blue-400',    dot: 'bg-blue-400' },
  { value: 'dispatcher', label: 'Dispatch Operations Lead',   subtitle: 'Trip management · Routes',         icon: Truck,      color: 'text-emerald-400', dot: 'bg-emerald-400' },
  { value: 'driver',     label: 'Field Driver Portal',        subtitle: 'Trip updates · POD submit',        icon: MapPin,     color: 'text-amber-400',   dot: 'bg-amber-400' },
  { value: 'safety',     label: 'Safety Compliance Officer',  subtitle: 'Incident monitoring · Alerts',     icon: AlertTriangle, color: 'text-orange-400', dot: 'bg-orange-400' },
  { value: 'finance',    label: 'Lead Financial Analyst',     subtitle: 'Expenses · Billing · Reports',     icon: TrendingUp, color: 'text-purple-400',  dot: 'bg-purple-400' },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToLanding }) => {
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [password, setPassword] = useState('password');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (loginMethod === 'otp' && otpCode !== '882019') {
      setErrorMsg('Invalid OTP. Demo code is "882019".');
      return;
    }
    setSubmitting(true);
    try {
      await onLoginSuccess(selectedRole.value, password);
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection error. Check backend server.');
    } finally {
      setSubmitting(false);
    }
  };

  const RoleIcon = selectedRole.icon;

  return (
    <div className="min-h-screen bg-[#020812] flex items-center justify-center px-4 py-12 relative overflow-hidden font-sans">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-600/[0.06] rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-indigo-600/[0.07] rounded-full blur-[90px]" />
        {[...Array(8)].map((_, i) => (
          <motion.div key={i}
            className="absolute w-[3px] h-[3px] rounded-full bg-blue-400/20"
            style={{ left: `${8 + i * 12}%`, top: `${12 + (i % 4) * 22}%` }}
            animate={{ y: [0, -18, 0], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </div>

      {/* Back button */}
      <button
        onClick={onBackToLanding}
        className="absolute top-6 left-6 flex items-center space-x-1.5 text-slate-500 hover:text-slate-300 text-[11px] font-black uppercase tracking-widest transition-all group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back</span>
      </button>

      {/* Auth card */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 90 }}
        className="relative w-full max-w-md"
      >
        {/* Glow ring behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-violet-600/20 rounded-3xl blur-xl opacity-60" />

        <div className="relative bg-[#080f1e]/90 border border-slate-700/40 rounded-3xl p-8 xl:p-10 backdrop-blur-xl shadow-2xl shadow-black/60 space-y-7">

          {/* Logo + title */}
          <div className="space-y-5">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-blue-500/30">
                  T+
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#080f1e]" />
              </div>
              <div>
                <p className="font-extrabold text-[15px] text-white tracking-tight">TransitOps<span className="text-blue-400">+</span></p>
                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Enterprise Fleet Intelligence</p>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Welcome back</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Sign in to your fleet operations workspace.</p>
            </div>
          </div>

          {/* Method tabs */}
          <div className="flex rounded-xl bg-slate-900/60 border border-slate-800/50 p-1">
            {(['password', 'otp'] as const).map((m) => (
              <button key={m} type="button"
                onClick={() => { setLoginMethod(m); setErrorMsg(''); setOtpSent(false); }}
                className={`flex-1 py-2.5 rounded-lg text-[11px] font-bold transition-all ${
                  loginMethod === m
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {m === 'password' ? '🔑  Password' : '📱  OTP / SMS'}
              </button>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div key="err"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 text-xs font-semibold"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Role selector */}
            <div className="space-y-2">
              <label className="block text-[9px] text-slate-500 font-black uppercase tracking-widest">Access Role</label>
              <div ref={roleRef} className="relative">
                <button type="button" onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="w-full flex items-center space-x-3.5 bg-slate-900/50 border border-slate-700/50 hover:border-slate-600/60 rounded-xl px-4 py-3.5 transition-all text-left"
                >
                  <div className={`p-2 rounded-lg bg-slate-800/70`}>
                    <RoleIcon className={`w-4 h-4 ${selectedRole.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-100 truncate">{selectedRole.label}</p>
                    <p className="text-[9px] text-slate-500 truncate mt-0.5">{selectedRole.subtitle}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${roleMenuOpen ? 'rotate-90' : ''}`} />
                </button>

                <AnimatePresence>
                  {roleMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#080f1e] border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 backdrop-blur-xl"
                    >
                      {ROLES.map((role) => {
                        const RIcon = role.icon;
                        const isActive = role.value === selectedRole.value;
                        return (
                          <button key={role.value} type="button"
                            onClick={() => { setSelectedRole(role); setRoleMenuOpen(false); }}
                            className={`w-full flex items-center space-x-3 px-4 py-3.5 transition-all text-left hover:bg-slate-800/40
                              ${isActive ? 'bg-blue-600/8 border-l-2 border-blue-500' : 'border-l-2 border-transparent'}`}
                          >
                            <div className="p-1.5 rounded-lg bg-slate-800/50">
                              <RIcon className={`w-3.5 h-3.5 ${role.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-bold truncate ${isActive ? 'text-blue-300' : 'text-slate-200'}`}>{role.label}</p>
                              <p className="text-[9px] text-slate-500 truncate">{role.subtitle}</p>
                            </div>
                            {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {loginMethod === 'password' ? (
                <motion.div key="pwd" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-2">
                  <label className="block text-[9px] text-slate-500 font-black uppercase tracking-widest">Security Passcode</label>
                  <div className="relative flex items-center bg-slate-900/50 border border-slate-700/50 hover:border-slate-600/60 focus-within:border-blue-500/40 rounded-xl px-4 py-3.5 transition-all">
                    <Lock className="w-4 h-4 text-slate-500 shrink-0 mr-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-slate-100 font-semibold placeholder-slate-600 focus:outline-none"
                      placeholder="Enter your password..."
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-500 hover:text-slate-300 transition-colors ml-2">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-600 font-semibold pl-1">
                    Demo passcode: <code className="bg-slate-900 border border-slate-800 text-blue-400 px-1.5 py-0.5 rounded font-mono">password</code>
                  </p>
                </motion.div>
              ) : (
                <motion.div key="otp" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[9px] text-slate-500 font-black uppercase tracking-widest">Mobile Number</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1 flex items-center bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3.5">
                        <Phone className="w-4 h-4 text-slate-500 shrink-0 mr-3" />
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                          className="bg-transparent text-sm text-slate-100 font-semibold placeholder-slate-600 focus:outline-none w-full"
                          placeholder="+91 98765 43210" />
                      </div>
                      <button type="button" onClick={() => { setOtpSent(true); setTimeout(() => setOtpCode('882019'), 1200); }}
                        className="px-4 bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 font-bold border border-blue-500/20 rounded-xl text-xs transition-all whitespace-nowrap">
                        Send OTP
                      </button>
                    </div>
                  </div>
                  {otpSent && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                      <label className="block text-[9px] text-slate-500 font-black uppercase tracking-widest">Verification Code</label>
                      <div className="relative flex items-center bg-slate-900/50 border border-slate-700/50 focus-within:border-blue-500/40 rounded-xl px-4 py-3.5">
                        <Key className="w-4 h-4 text-slate-500 shrink-0 mr-3" />
                        <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)}
                          className="flex-1 bg-transparent text-sm text-slate-100 font-mono tracking-widest font-semibold placeholder-slate-600 focus:outline-none"
                          placeholder="• • • • • •" maxLength={6} />
                      </div>
                      <p className="text-[9px] text-slate-600 font-semibold pl-1">Demo OTP: <code className="text-blue-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-mono">882019</code></p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remember me */}
            <div className="flex items-center space-x-2.5">
              <input type="checkbox" defaultChecked id="remember"
                className="w-4 h-4 rounded accent-blue-500 cursor-pointer" />
              <label htmlFor="remember" className="text-xs text-slate-400 font-semibold cursor-pointer select-none">
                Keep me signed in for 30 days
              </label>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={submitting || success}
              whileTap={{ scale: 0.99 }}
              className="relative w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2.5 transition-all overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {!submitting && !success && (
                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                  animate={{ x: ['-200%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                />
              )}
              {success ? (
                <><CheckCircle2 className="w-4.5 h-4.5" /><span>Authenticated!</span></>
              ) : submitting ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /><span>Verifying...</span></>
              ) : (
                <><Zap className="w-4 h-4" /><span>Access Workspace</span><ChevronRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-slate-800/50" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#080f1e] px-4 text-[9px] text-slate-600 uppercase font-black tracking-widest">or continue with</span>
            </div>
          </div>

          {/* SSO buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button"
              onClick={async () => { setSubmitting(true); try { await onLoginSuccess('admin', 'password'); setSuccess(true); } catch (err: any) { setErrorMsg(err.message); } finally { setSubmitting(false); } }}
              className="flex items-center justify-center space-x-2 py-3 bg-slate-900/40 hover:bg-slate-800/60 text-slate-200 border border-slate-800/50 hover:border-slate-700 rounded-xl transition-all text-xs font-bold"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.72 14.9 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.6 2.8C6.01 7.07 8.78 5.04 12 5.04z"/>
                <path fill="#4285F4" d="M23.5 12.25c0-.82-.07-1.6-.21-2.35H12v4.45h6.45c-.28 1.48-1.12 2.73-2.38 3.58l3.68 2.85c2.15-1.98 3.39-4.9 3.39-8.53z"/>
                <path fill="#FBBC05" d="M5.1 14.8c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.5 7.4C.54 9.3 0 11.58 0 14s.54 4.7 1.5 6.6l3.6-2.8z"/>
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.68-2.85c-1.02.68-2.33 1.09-3.92 1.09-3.22 0-5.99-2.03-6.9-4.8l-3.6 2.8C3.4 20.35 7.35 23 12 23z"/>
              </svg>
              <span>Google SSO</span>
            </button>
            <button type="button"
              onClick={async () => { setSubmitting(true); try { await onLoginSuccess('dispatcher', 'password'); setSuccess(true); } catch (err: any) { setErrorMsg(err.message); } finally { setSubmitting(false); } }}
              className="flex items-center justify-center space-x-2 py-3 bg-slate-900/40 hover:bg-slate-800/60 text-slate-200 border border-slate-800/50 hover:border-slate-700 rounded-xl transition-all text-xs font-bold"
            >
              <svg className="w-4 h-4" viewBox="0 0 23 23">
                <path fill="#F25022" d="M0 0h11v11H0z"/>
                <path fill="#7FBA00" d="M12 0h11v11H12z"/>
                <path fill="#00A4EF" d="M0 12h11v11H0z"/>
                <path fill="#FFB900" d="M12 12h11v11H12z"/>
              </svg>
              <span>Microsoft AD</span>
            </button>
          </div>

          {/* Security note */}
          <div className="flex items-center justify-center space-x-2 pt-1">
            <Sparkles className="w-3 h-3 text-slate-600" />
            <p className="text-center text-[9px] text-slate-600 font-semibold">
              AES-256 encrypted · SOC 2 Type II · VAHAN Compliant
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
