import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Key, Mail, Phone, Lock, Eye, EyeOff, Info, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (username: string) => void;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMethod === 'password' && password !== 'password') {
      setErrorMsg('Invalid demo credentials. The passcode is "password".');
      return;
    }
    if (loginMethod === 'otp' && (!otpCode || otpCode !== '882019')) {
      setErrorMsg('Invalid validation code. Enter "882019" to authenticate.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      onLoginSuccess(username);
    }, 700);
  };

  const handleSendOtp = () => {
    setErrorMsg('');
    setOtpSent(true);
    // Auto-fill code after 1 second for supreme UX
    setTimeout(() => {
      setOtpCode('882019');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      {/* Background Neon Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-3xl -z-10 animate-pulse" />

      {/* Spring-animated Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl p-8 rounded-[36px] border border-white/5 shadow-2xl relative"
      >
        
        {/* Glow border ring effect */}
        <div className="absolute inset-0 rounded-[36px] border border-gradient-to-r from-blue-500/20 to-emerald-500/20 pointer-events-none" />

        {/* Back Link */}
        <button 
          onClick={onBackToLanding}
          className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center space-x-1.5 text-[10px] font-extrabold uppercase tracking-widest transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        {/* Logo and Greeting */}
        <div className="text-center mb-6.5 mt-2">
          <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 font-bold text-white shadow-xl shadow-blue-500/20 mb-4.5">
            T+
          </div>
          <h2 className="text-2xl font-black text-slate-100 tracking-wide">TransitOps+ Console</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">Smart AI Fleet Operations Center</p>
        </div>

        {/* Demo Credentials Helper Box (User Friendly Modify) */}
        <div className="mb-6 p-4.5 rounded-2xl bg-blue-950/20 border border-blue-500/20 text-xs flex items-start space-x-3 text-slate-300">
          <Info className="w-4.5 h-4.5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold text-blue-300">Demo Access Credentials</span>
            <p className="text-[11px] leading-relaxed text-slate-350">
              Select any operational role from the list. The passcode is <code className="bg-slate-950 px-1.5 py-0.5 rounded font-mono text-blue-400">password</code>. If using OTP, verify to auto-receive code.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-[11px] font-bold text-red-400 text-center animate-shake">
            {errorMsg}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {loginMethod === 'password' ? (
            <>
              {/* Username Selector */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">Select Demo Account Role</label>
                <div className="relative flex items-center bg-slate-950/90 border border-white/5 focus-within:border-blue-500/40 rounded-xl overflow-hidden px-4 py-3 transition-colors">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0 mr-3" />
                  <select 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 bg-transparent border-none text-slate-200 focus:outline-none font-bold cursor-pointer"
                  >
                    <option value="admin">System Administrator (Admin View)</option>
                    <option value="dispatcher">Dispatch Operations Lead (Dispatcher View)</option>
                    <option value="driver">Field Driver (Driver Mobile App)</option>
                    <option value="safety">Safety Compliance Officer (Safety View)</option>
                    <option value="finance">Lead Financial Analyst (Finance View)</option>
                  </select>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enter Security Key</label>
                </div>
                <div className="relative flex items-center bg-slate-950/90 border border-white/5 focus-within:border-blue-500/40 rounded-xl overflow-hidden px-4 py-3 transition-colors">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0 mr-3" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 bg-transparent border-none text-slate-200 focus:outline-none font-bold"
                    placeholder="password"
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
              {/* Phone / OTP Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">Register Phone Number</label>
                <div className="flex space-x-2">
                  <div className="relative flex-1 flex items-center bg-slate-950/90 border border-white/5 rounded-xl overflow-hidden px-4 py-3">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0 mr-3" />
                    <input 
                      type="text"
                      className="bg-transparent border-none text-slate-200 focus:outline-none"
                      placeholder="+1 (555) 012-9988"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleSendOtp}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-blue-400 hover:text-blue-300 font-bold border border-slate-750 rounded-xl transition-all"
                  >
                    Get Code
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enter verification pin</label>
                  <div className="relative flex items-center bg-slate-950/90 border border-white/5 focus-within:border-blue-500/40 rounded-xl overflow-hidden px-4 py-3">
                    <Key className="w-4 h-4 text-slate-500 shrink-0 mr-3" />
                    <input 
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="flex-1 bg-transparent border-none text-slate-200 focus:outline-none font-bold"
                      placeholder="6-digit code (e.g. 882019)"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Remember Me */}
          <div className="flex items-center space-x-2.5 pt-1 pb-2 text-slate-500">
            <input type="checkbox" defaultChecked id="remember-me" className="w-3.5 h-3.5 bg-slate-950 border border-slate-850 rounded cursor-pointer accent-blue-500" />
            <label htmlFor="remember-me" className="cursor-pointer select-none font-medium">Keep me authenticated on this workstation</label>
          </div>

          {/* Connect button */}
          <button 
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            {submitting ? (
              <div className="w-4.5 h-4.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            ) : (
              <span>Authenticate and Connect</span>
            )}
          </button>
        </form>

        {/* SSO Options */}
        <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
          <div className="relative text-center">
            <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase font-black tracking-widest relative z-10">Alternative SSO Portals</span>
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5 -z-0" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-[10px] font-extrabold">
            <button 
              onClick={() => onLoginSuccess('admin')}
              className="flex items-center justify-center space-x-2 py-3 bg-slate-950 hover:bg-slate-900 text-slate-200 border border-white/5 rounded-xl transition-all hover:border-slate-800"
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
              onClick={() => onLoginSuccess('dispatcher')}
              className="flex items-center justify-center space-x-2 py-3 bg-slate-950 hover:bg-slate-900 text-slate-200 border border-white/5 rounded-xl transition-all hover:border-slate-800"
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

          {/* Login Mode Toggle */}
          <div className="text-center pt-2">
            <button 
              onClick={() => {
                setLoginMethod(loginMethod === 'password' ? 'otp' : 'password');
                setOtpSent(false);
              }}
              className="text-[10px] text-slate-400 hover:text-blue-400 font-extrabold uppercase tracking-widest transition-colors"
              type="button"
            >
              Use {loginMethod === 'password' ? 'Mobile SMS Verification (OTP)' : 'Passcode Sign In'}
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
export default LoginPage;
