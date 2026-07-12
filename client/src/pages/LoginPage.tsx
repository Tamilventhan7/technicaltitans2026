import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Sparkles, Key, Mail, Phone, Lock, Eye, EyeOff, Info, ArrowLeft, Terminal } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (username: string) => Promise<void>;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToLanding }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (loginMethod === 'password' && password !== 'password') {
      setErrorMsg('Invalid security credentials. Passcode key is "password".');
      return;
    }
    if (loginMethod === 'otp' && (!otpCode || otpCode !== '882019')) {
      setErrorMsg('Invalid validation code. Enter "882019" to authenticate.');
      return;
    }

    setSubmitting(true);
    try {
      // Connects directly to backend API log session
      await onLoginSuccess(username);
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Connection failure. Please check backend server status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = () => {
    setErrorMsg('');
    setOtpSent(true);
    setTimeout(() => {
      setOtpCode('882019');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans overflow-hidden">
      
      {/* LEFT COLUMN: Interactive Telemetry Console Visuals (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900/30 border-r border-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-3xl" />

        {/* Top Header */}
        <div className="flex items-center space-x-3.5 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            T+
          </div>
          <div>
            <h3 className="font-extrabold text-sm tracking-tight">TransitOps+</h3>
            <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-widest">Enterprise SaaS System</span>
          </div>
        </div>

        {/* Middle Visual: Animated Network Hub & Active Telemetry Feed */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tight leading-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Intelligent Fleet Telemetry & Operations Command
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Powering global logistics dispatches, real-time safety indices, and predictive diagnostics using a live coordinated digital twin engine.
            </p>
          </div>

          {/* Animated Console Grid mock */}
          <div className="glass-panel p-5 rounded-2.5xl border border-slate-850 bg-slate-950/40 font-mono text-[10px] text-slate-400 space-y-3 shadow-inner">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <span className="flex items-center space-x-1.5 font-bold text-blue-400">
                <Terminal className="w-3.5 h-3.5 animate-pulse" />
                <span>twin-daemon-logger</span>
              </span>
              <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">ONLINE</span>
            </div>
            <div className="space-y-1.5 leading-normal">
              <p className="text-slate-500"><span className="text-slate-600">[15:19:10]</span> INITIATING digital twin simulation engine loop...</p>
              <p className="text-slate-400"><span className="text-slate-600">[15:19:11]</span> RESOLVED <span className="text-blue-400">8 active trips</span>, syncing client web-socket telemetry...</p>
              <p className="text-indigo-400"><span className="text-slate-600">[15:19:12]</span> SEEDED simulation compliance ledgers inside fallback database.</p>
              <p className="text-slate-500"><span className="text-slate-600">[15:19:13]</span> WAITING for admin auth token payload callback request...</p>
            </div>
            <div className="pt-2 flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[9.5px] text-slate-500 font-semibold tracking-wider uppercase">
          &copy; 2026 TransitOps Inc. All Rights Reserved.
        </div>
      </div>

      {/* RIGHT COLUMN: Minimal Modern Linear-style Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 md:px-12 bg-slate-950 relative overflow-hidden">
        {/* Mobile Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-3xl lg:hidden -z-10" />

        {/* Back Link */}
        <button 
          onClick={onBackToLanding}
          className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center space-x-1.5 text-[9.5px] font-black uppercase tracking-widest transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        {/* Form Container */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="w-full max-w-sm space-y-6"
        >
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">System Authenticator</h2>
            <p className="text-xs text-slate-500 font-medium">Verify your credentials to open the management workspace.</p>
          </div>

          {/* Credentials Helper Card */}
          <div className="glass-panel p-4 rounded-xl border border-slate-850 bg-slate-900/10 flex items-start space-x-3 text-slate-350 text-xs">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-extrabold text-blue-300">Connected System Logs</span>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Credentials verified via TransitOps+ backend. Choose a role and enter any password (default is <code className="bg-slate-950 px-1 py-0.5 rounded font-mono text-blue-400">password</code>).
              </p>
            </div>
          </div>

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-xs font-bold text-red-400 text-center"
            >
              {errorMsg}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4.5 text-xs">
            {loginMethod === 'password' ? (
              <>
                {/* Role select */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] text-slate-500 font-black uppercase tracking-wider">Select Demo Account Role</label>
                  <div className="relative flex items-center bg-slate-900/50 border border-slate-850 hover:border-slate-800 focus-within:border-blue-500/30 rounded-xl overflow-hidden px-3.5 py-3 transition-colors">
                    <Mail className="w-4 h-4 text-slate-500 shrink-0 mr-3" />
                    <select 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="flex-1 bg-transparent border-none text-slate-200 focus:outline-none font-bold cursor-pointer"
                    >
                      <option value="admin">System Administrator (Admin)</option>
                      <option value="dispatcher">Dispatch Operations Lead (Dispatcher)</option>
                      <option value="driver">Field Driver (Driver Portal)</option>
                      <option value="safety">Safety Compliance Officer (Safety)</option>
                      <option value="finance">Lead Financial Analyst (Finance)</option>
                    </select>
                  </div>
                </div>

                {/* Password input */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] text-slate-500 font-black uppercase tracking-wider">Security Access Passcode</label>
                  <div className="relative flex items-center bg-slate-900/50 border border-slate-850 hover:border-slate-800 focus-within:border-blue-500/30 rounded-xl overflow-hidden px-3.5 py-3 transition-colors">
                    <Lock className="w-4 h-4 text-slate-500 shrink-0 mr-3" />
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 bg-transparent border-none text-slate-200 focus:outline-none font-bold"
                      placeholder="Enter password..."
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-500 hover:text-slate-400 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* SMS OTP authentication */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] text-slate-500 font-black uppercase tracking-wider">Mobile Phone Number</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1 flex items-center bg-slate-900/50 border border-slate-850 rounded-xl overflow-hidden px-3.5 py-3">
                      <Phone className="w-4 h-4 text-slate-500 shrink-0 mr-3" />
                      <input 
                        type="text"
                        className="bg-transparent border-none text-slate-200 focus:outline-none w-full"
                        placeholder="+1 (555) 012-9988"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={handleSendOtp}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-blue-400 hover:text-blue-300 font-bold border border-slate-850 rounded-xl transition-all"
                    >
                      Send OTP
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1.5"
                  >
                    <label className="block text-[9px] text-slate-500 font-black uppercase tracking-wider">Verification Passcode</label>
                    <div className="relative flex items-center bg-slate-900/50 border border-slate-850 focus-within:border-blue-500/30 rounded-xl overflow-hidden px-3.5 py-3">
                      <Key className="w-4 h-4 text-slate-500 shrink-0 mr-3" />
                      <input 
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="flex-1 bg-transparent border-none text-slate-200 focus:outline-none font-bold"
                        placeholder="e.g. 882019"
                      />
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {/* Remember Me */}
            <div className="flex items-center space-x-2 pt-1 pb-1 text-slate-500 font-semibold">
              <input type="checkbox" defaultChecked id="remember-me" className="w-3.5 h-3.5 bg-slate-950 border border-slate-800 rounded cursor-pointer accent-blue-500" />
              <label htmlFor="remember-me" className="cursor-pointer select-none">Remember this device</label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center space-x-2 transition-all active:scale-98"
            >
              {submitting ? (
                <div className="w-4.5 h-4.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                <span>Authenticate Workspace</span>
              )}
            </button>
          </form>

          {/* Social Signin Alternates */}
          <div className="pt-4 border-t border-slate-900 space-y-4">
            <div className="relative text-center">
              <span className="bg-slate-950 px-3 text-[9px] text-slate-500 uppercase font-black tracking-widest relative z-10">Alternative Portals</span>
              <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-900 -z-0" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-[10px] font-extrabold">
              <button 
                onClick={async () => {
                  setSubmitting(true);
                  try { await onLoginSuccess('admin'); } catch (err: any) { setErrorMsg(err.message); } finally { setSubmitting(false); }
                }}
                className="flex items-center justify-center space-x-2 py-3 bg-slate-900/40 hover:bg-slate-900/80 text-slate-200 border border-slate-900 rounded-xl transition-all"
              >
                <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.72 14.9 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.6 2.8C6.01 7.07 8.78 5.04 12 5.04z"/>
                  <path fill="#4285F4" d="M23.5 12.25c0-.82-.07-1.6-.21-2.35H12v4.45h6.45c-.28 1.48-1.12 2.73-2.38 3.58l3.68 2.85c2.15-1.98 3.39-4.9 3.39-8.53z"/>
                  <path fill="#FBBC05" d="M5.1 14.8c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.5 7.4C.54 9.3 0 11.58 0 14s.54 4.7 1.5 6.6l3.6-2.8z"/>
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.68-2.85c-1.02.68-2.33 1.09-3.92 1.09-3.22 0-5.99-2.03-6.9-4.8l-3.6 2.8C3.4 20.35 7.35 23 12 23z"/>
                </svg>
                <span>Google SSO</span>
              </button>
              <button 
                onClick={async () => {
                  setSubmitting(true);
                  try { await onLoginSuccess('dispatcher'); } catch (err: any) { setErrorMsg(err.message); } finally { setSubmitting(false); }
                }}
                className="flex items-center justify-center space-x-2 py-3 bg-slate-900/40 hover:bg-slate-900/80 text-slate-200 border border-slate-900 rounded-xl transition-all"
              >
                <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 23 23">
                  <path fill="#F25022" d="M0 0h11v11H0z"/>
                  <path fill="#7FBA00" d="M12 0h11v11H12z"/>
                  <path fill="#00A4EF" d="M0 12h11v11H0z"/>
                  <path fill="#FFB900" d="M12 12h11v11H12z"/>
                </svg>
                <span>Microsoft AD</span>
              </button>
            </div>

            {/* Passcode Toggle */}
            <div className="text-center pt-2">
              <button 
                onClick={() => {
                  setLoginMethod(loginMethod === 'password' ? 'otp' : 'password');
                  setOtpSent(false);
                }}
                className="text-[9px] text-slate-500 hover:text-blue-400 font-extrabold uppercase tracking-widest transition-colors"
                type="button"
              >
                Sign In with {loginMethod === 'password' ? 'Sms Code' : 'Access Key'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};
export default LoginPage;
