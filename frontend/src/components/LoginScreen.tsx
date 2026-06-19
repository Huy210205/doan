import React, { useState } from 'react';
import { Shield, Mail, Lock, Loader2, ArrowRight, Key } from 'lucide-react';
import contentData from '../data/contentData.json';
import api from '../api';

interface LoginScreenProps {
  onLoginSuccess: (email: string, token: string) => void;
}

type AuthMode = 'login' | 'register' | 'otp';

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { auth } = contentData;
  const [mode, setMode] = useState<AuthMode>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!email) {
      setErrorMsg('Vui lòng nhập Email.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (!password || password.length < 6) {
          setErrorMsg('Mật khẩu tối thiểu 6 ký tự.');
          setIsLoading(false);
          return;
        }
        await api.post('/auth/register', { email, password });
        setSuccessMsg('Đăng ký thành công! Vui lòng kiểm tra email và nhập mã OTP.');
        setMode('otp');
      } else if (mode === 'otp') {
        if (!otp) {
          setErrorMsg('Vui lòng nhập mã OTP.');
          setIsLoading(false);
          return;
        }
        await api.post('/auth/verify', { email, otp });
        setSuccessMsg('Xác thực thành công! Vui lòng đăng nhập.');
        setMode('login');
        setOtp('');
      } else {
        if (!password) {
          setErrorMsg('Vui lòng nhập Mật khẩu.');
          setIsLoading(false);
          return;
        }
        const res = await api.post('/auth/login', { email, password });
        onLoginSuccess(res.data.email, res.data.access_token);
      }
    } catch (err: any) {
      if (err.response?.data?.detail) {
        setErrorMsg(err.response.data.detail);
      } else {
        setErrorMsg('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (mode === 'register') return auth.register_title;
    if (mode === 'otp') return 'XÁC THỰC EMAIL';
    return auth.login_title;
  };

  const getSubtitle = () => {
    if (mode === 'register') return auth.register_subtitle;
    if (mode === 'otp') return 'NHẬP MÃ BẢO MẬT TỪ HỘP THƯ';
    return auth.login_subtitle;
  };

  const getButtonText = () => {
    if (mode === 'register') return auth.register_button;
    if (mode === 'otp') return 'XÁC THỰC OTP';
    return auth.login_button;
  };

  return (
    <div id="login-container" className="min-h-screen w-full flex items-center justify-center bg-cyber-bg relative overflow-hidden px-4 transition-colors duration-200">
      {/* Decorative cybernetic lines & glows */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-500/5 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-purple-500/5 dark:bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Dynamic Grid Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 dark:opacity-30 pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 md:p-10 shadow-2xl relative z-10 transition-all duration-300 hover:border-cyber-blue/40 hover:shadow-[0_8px_32px_rgba(59,130,246,0.12)]">
        
        {/* Animated Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyber-blue to-transparent rounded-t-2xl" />

        {/* Brand Shield Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center mb-4 transition-transform duration-500 hover:rotate-12 group shadow-[0_4px_15px_rgba(59,130,246,0.1)]">
            <Shield className="w-8 h-8 text-cyber-blue stroke-[1.5] transition-all duration-300 group-hover:scale-110" />
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-cyber-text-main text-center">
            {getTitle()}
          </h1>
          <p className="text-xs text-cyber-text-muted font-mono tracking-wider mt-1.5 uppercase font-semibold">
            {getSubtitle()}
          </p>
        </div>

        {/* System messages */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-lg bg-red-500/10 dark:bg-red-950/40 border border-red-500/30 text-red-600 dark:text-red-200 text-sm animate-fadeIn font-semibold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-5 p-3 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-600 dark:text-emerald-200 text-sm animate-fadeIn font-semibold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-cyber-text-muted font-mono uppercase tracking-wider block">
              Địa chỉ Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email-input"
                type="email"
                required
                disabled={mode === 'otp'}
                className="w-full bg-cyber-input-bg border border-cyber-border text-cyber-text-main text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all placeholder-slate-400 dark:placeholder-slate-500 font-mono disabled:opacity-50"
                placeholder="example@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password input (Login / Register) */}
          {mode !== 'otp' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-cyber-text-muted font-mono uppercase tracking-wider block">
                Mật khẩu hệ thống
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password-input"
                  type="password"
                  required
                  className="w-full bg-cyber-input-bg border border-cyber-border text-cyber-text-main text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all placeholder-slate-400 dark:placeholder-slate-500 font-mono"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* OTP input */}
          {mode === 'otp' && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-xs font-semibold text-cyber-text-muted font-mono uppercase tracking-wider block">
                Mã OTP (6 chữ số)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  id="otp-input"
                  type="text"
                  required
                  maxLength={6}
                  className="w-full bg-cyber-input-bg border border-cyber-border text-cyber-text-main text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all placeholder-slate-400 dark:placeholder-slate-500 font-mono tracking-widest text-center"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>
          )}

          {/* Action button */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 relative overflow-hidden group py-3.5 px-4 bg-cyber-blue hover:bg-blue-600 text-white font-semibold text-sm rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_4px_20px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý thông tin...</span>
              </>
            ) : (
              <>
                <span>{getButtonText()}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-8 text-center border-t border-cyber-border/50 pt-5">
          {mode === 'otp' ? (
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-xs font-mono text-cyber-blue hover:text-blue-600 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors uppercase tracking-wider hover:underline"
            >
              Quay lại Đăng nhập
            </button>
          ) : (
            <button
              id="toggle-auth-view"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-xs font-mono text-cyber-blue hover:text-blue-600 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors uppercase tracking-wider hover:underline"
            >
              {mode === 'register' ? auth.login_link : auth.register_link}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
