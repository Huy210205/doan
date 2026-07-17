import React, { useEffect, useRef, useState } from 'react';
import {
  Shield, Zap, Search, Lock, Server, ArrowRight, Sun, Moon,
  FileText, Users, Activity, ChevronRight, CheckCircle
} from 'lucide-react';
import Logo from './Logo';

interface LandingPageProps {
  onLoginClick: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

/* ─── Intersection Observer hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── (counters are now static for performance) ─── */

/* ─── Feature Card with 3D tilt ─── */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    el.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) scale3d(1.02,1.02,1.02)`;
  };
  const reset = () => { if (cardRef.current) cardRef.current.style.transform = ''; };
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      className={`transition-transform duration-200 ease-out ${className}`}
      style={{ willChange: 'transform' }}
    >
      {children}
    </div>
  );
}

/* ─── Reveal wrapper ─── */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string; key?: React.Key }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
      }}
    >
      {children}
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function LandingPage({ onLoginClick, theme, onToggleTheme }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-cyber-bg text-cyber-text-main selection:bg-cyber-blue/30 relative overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>

      {/* ── Background ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-blue-600/8 dark:bg-blue-900/20 rounded-full blur-[140px]" />
        <div className="absolute top-[30%] right-[-15%] w-[45%] h-[45%] bg-purple-600/8 dark:bg-purple-900/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[40%] h-[30%] bg-cyan-600/5 dark:bg-cyan-900/10 rounded-full blur-[100px]" />
        {/* grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_60%,transparent_100%)]" />
      </div>

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 transition-all duration-300 ${scrolled ? 'h-16 glass-panel border-b border-cyber-border/50 shadow-lg backdrop-blur-2xl bg-cyber-bg/80' : 'h-20 bg-transparent'}`}>
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <h2 className="text-lg font-bold font-display tracking-tight text-cyber-text-main leading-none">WebSec</h2>
            <span className="text-[9px] font-mono tracking-widest text-cyber-blue/80 uppercase mt-0.5 block font-bold">Secure Engine</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-cyber-text-muted">
          {['#home', '#features', '#how-it-works', '#about'].map((href, i) => (
            <a key={href} href={href} className="hover:text-cyber-text-main transition-colors duration-200 cursor-pointer">
              {['Trang chủ', 'Tính năng', 'Cách hoạt động', 'Về chúng tôi'][i]}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onToggleTheme} className="p-2 rounded-full hover:bg-cyber-card transition-colors text-cyber-text-muted hover:text-cyber-text-main cursor-pointer" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
          <button
            onClick={onLoginClick}
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm tracking-wide overflow-hidden transition-all duration-300 active:scale-95 border border-cyber-blue/40 text-cyber-blue hover:text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
            <span className="relative z-10">Đăng nhập</span>
            <ArrowRight className="relative z-10 w-4 h-4 -ml-1 group-hover:translate-x-0.5 transition-transform duration-300" />
          </button>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="relative z-10 flex flex-col items-center w-full">

        {/* ── HERO ── */}
        <section id="home" className="w-full max-w-7xl mx-auto px-6 md:px-12 pt-36 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyber-blue/30 bg-cyber-blue/5 text-cyber-blue text-xs font-bold mb-7 animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-blue opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-blue" />
              </span>
              WebSec Engine v2.0 · Đang hoạt động
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold font-display tracking-tight mb-7 leading-[1.08] text-cyber-text-main">
              Phát Hiện Lỗ Hổng{' '}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500">Tự Động</span>
                <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
              </span>{' '}
              Bằng AI
            </h1>

            <p className="text-lg text-cyber-text-muted mb-10 max-w-lg leading-relaxed">
              Nền tảng quét bảo mật thế hệ mới — kết hợp <strong className="text-cyber-text-main font-semibold">Crawler đa luồng</strong> và mô hình <strong className="text-cyber-text-main font-semibold">Machine Learning</strong> để phát hiện SQLi, XSS, CSRF, LFI trong vài giây.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-12">
              <button
                onClick={onLoginClick}
                className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-base transition-all active:scale-95 shadow-[0_0_30px_rgba(59,130,246,0.35)] hover:shadow-[0_0_45px_rgba(59,130,246,0.55)] cursor-pointer"
              >
                <Zap className="w-5 h-5" />
                <span>Bắt đầu quét miễn phí</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 text-sm font-semibold text-cyber-text-muted hover:text-cyber-text-main transition-colors cursor-pointer"
              >
                Xem cách hoạt động <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mini stats - static for performance */}
            <div className="flex items-center gap-8 text-center">
              {[
                { label: 'Endpoint quét/lần', val: '100+' },
                { label: 'Độ chính xác AI', val: '99%' },
                { label: 'Loại lỗ hổng', val: '4' },
              ].map(({ label, val }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-2xl font-extrabold font-display text-cyber-text-main">{val}</span>
                  <span className="text-xs text-cyber-text-muted mt-0.5">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard Mockup (original style) */}
          <div className="relative w-full h-[400px] lg:h-[500px] hidden md:block" style={{ perspective: '1000px' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/30 to-purple-500/30 rounded-3xl blur-[80px] transform -rotate-6 scale-105 pointer-events-none" />
            <div className="absolute inset-x-4 lg:inset-x-0 inset-y-8 glass-panel rounded-2xl border-cyber-blue/30 shadow-2xl transform rotate-[4deg] hover:rotate-0 hover:scale-[1.02] transition-all duration-700 overflow-hidden flex flex-col bg-cyber-bg/80 dark:bg-cyber-card/90">
              {/* Browser chrome */}
              <div className="h-10 border-b border-cyber-border/50 bg-cyber-card-light/50 flex items-center px-4 gap-2 shrink-0">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <div className="ml-4 h-4 w-32 bg-cyber-border/40 rounded-full" />
              </div>
              {/* Mockup body */}
              <div className="p-6 flex-1 flex flex-col gap-4 relative overflow-hidden bg-cyber-bg/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-6 w-32 bg-cyber-border/50 rounded-md" />
                  <div className="h-6 w-24 bg-emerald-500/20 text-emerald-500 text-[10px] font-bold rounded flex items-center justify-center border border-emerald-500/30">100% SECURE</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-28 rounded-xl bg-cyber-card border border-cyber-border p-4 flex flex-col justify-end relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Shield className="w-10 h-10" /></div>
                    <div className="text-4xl font-display font-bold text-cyber-text-main mb-1">0</div>
                    <div className="text-xs font-medium text-cyber-text-muted">Lỗ hổng Nguy hiểm</div>
                  </div>
                  <div className="h-28 rounded-xl bg-cyber-card border border-cyber-blue/30 p-4 flex flex-col justify-end relative overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyber-blue/10 rounded-full blur-xl" />
                    <div className="absolute top-3 right-3 text-cyber-blue"><Zap className="w-5 h-5" /></div>
                    <div className="text-4xl font-display font-bold text-cyber-blue mb-1">99.9%</div>
                    <div className="text-xs font-medium text-cyber-text-muted">Độ chính xác AI</div>
                  </div>
                </div>
                <div className="flex-1 rounded-xl bg-cyber-card border border-cyber-border p-4">
                  <div className="h-3 w-1/3 bg-cyber-text-muted/20 rounded-full mb-5" />
                  <div className="space-y-4">
                    {[1, 0.83, 0.67].map((w, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <div className="h-2 bg-cyber-border/60 rounded-full" style={{ width: `${w * 100}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST BAR ── */}
        <div className="w-full border-y border-cyber-border/40 bg-cyber-card-light/20 backdrop-blur-sm py-8">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-[11px] font-bold tracking-widest text-cyber-text-muted uppercase mb-6">Bảo vệ bởi các chuẩn bảo mật hàng đầu</p>
            <div className="flex flex-wrap items-center justify-center gap-10 md:gap-20 opacity-40 hover:opacity-70 transition-opacity duration-500">
              {[
                { icon: <Shield className="w-5 h-5" />, name: 'OWASP Top 10' },
                { icon: <Lock className="w-5 h-5" />, name: 'JWT Auth' },
                { icon: <Server className="w-5 h-5" />, name: 'Docker Ready' },
                { icon: <Activity className="w-5 h-5" />, name: 'REST API' },
                { icon: <FileText className="w-5 h-5" />, name: 'PDF Reports' },
              ].map(({ icon, name }) => (
                <div key={name} className="flex items-center gap-2 text-sm font-bold font-display text-cyber-text-main">
                  {icon} {name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FEATURES BENTO ── */}
        <section id="features" className="w-full max-w-7xl mx-auto px-6 md:px-12 py-28 scroll-mt-20">
          <Reveal className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest text-cyber-blue uppercase mb-3 block">Tính năng</span>
            <h2 className="text-3xl md:text-5xl font-bold font-display text-cyber-text-main mb-4">
              Hệ Sinh Thái{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Bảo Mật</span>
            </h2>
            <p className="text-cyber-text-muted max-w-2xl mx-auto text-lg">Kiến trúc toàn diện được thiết kế để phát hiện mọi điểm yếu trên ứng dụng web của bạn.</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-auto">
            {/* Big card */}
            <Reveal delay={0} className="md:col-span-2 md:row-span-2">
              <TiltCard className="h-full">
                <div className="h-full min-h-[320px] rounded-3xl glass-panel border-cyber-border/60 bg-cyber-card/30 p-8 md:p-10 relative overflow-hidden group hover:border-blue-500/50 transition-all duration-500 flex flex-col hover:shadow-[0_0_60px_rgba(59,130,246,0.12)] cursor-default">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/15 rounded-full blur-[80px] group-hover:bg-blue-500/25 transition-colors duration-700" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px]" />
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30 text-white group-hover:scale-110 transition-transform duration-500">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div className="flex-1 relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-4">
                      Core Engine
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold font-display mb-4 text-cyber-text-main">Quét Đa Luồng Siêu Tốc</h3>
                    <p className="text-cyber-text-muted text-base max-w-md leading-relaxed">
                      ThreadPoolExecutor với 3 luồng song song, ưu tiên endpoint có form và tham số. Tự động crawl và kiểm tra tới 100 endpoint mỗi lần — nhanh, không gây sập server mục tiêu.
                    </p>
                  </div>
                  <div className="mt-8 flex flex-wrap gap-2 relative z-10">
                    {['SQLi', 'XSS', 'CSRF', 'LFI'].map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full text-[11px] font-bold bg-cyber-card border border-cyber-border text-cyber-text-muted">{tag}</span>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </Reveal>

            {/* Small cards */}
            {[
              {
                icon: <Shield className="w-6 h-6" />,
                color: 'emerald',
                label: 'AI Phân Loại',
                desc: 'Mô hình Random Forest + SVM tự động xác định mức độ nghiêm trọng: Critical / High / Medium / Low.',
                delay: 100,
              },
              {
                icon: <FileText className="w-6 h-6" />,
                color: 'purple',
                label: 'Báo Cáo PDF & HTML',
                desc: 'Xuất báo cáo chi tiết với danh sách lỗ hổng, payload, bằng chứng và hướng dẫn khắc phục.',
                delay: 200,
              },
              {
                icon: <Users className="w-6 h-6" />,
                color: 'amber',
                label: 'Admin Panel',
                desc: 'Quản lý toàn bộ người dùng, giám sát hoạt động quét theo ngày, phân quyền linh hoạt.',
                delay: 300,
              },
              {
                icon: <Lock className="w-6 h-6" />,
                color: 'cyan',
                label: 'Xác thực OTP',
                desc: 'Đăng ký, đặt lại mật khẩu qua mã OTP gửi Gmail thật. JWT bảo vệ mọi phiên đăng nhập.',
                delay: 400,
              },
            ].map(({ icon, color, label, desc, delay }) => {
              const colMap: Record<string, string> = {
                emerald: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]',
                purple: 'border-purple-500/40 text-purple-400 bg-purple-500/5 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]',
                amber: 'border-amber-500/40 text-amber-400 bg-amber-500/5 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]',
                cyan: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/5 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]',
              };
              return (
                <Reveal key={label} delay={delay}>
                  <TiltCard>
                    <div className={`rounded-3xl glass-panel border-cyber-border/50 p-7 relative overflow-hidden group hover:border-opacity-80 transition-all duration-500 flex flex-col cursor-default ${colMap[color]}`}>
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 border ${colMap[color]} group-hover:scale-110 transition-transform duration-400`}>
                        {icon}
                      </div>
                      <h3 className="text-lg font-bold font-display mb-2 text-cyber-text-main">{label}</h3>
                      <p className="text-cyber-text-muted text-sm leading-relaxed">{desc}</p>
                    </div>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="w-full py-28 border-y border-cyber-border/30 bg-cyber-card/10 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <Reveal className="text-center mb-20">
              <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-3 block">Quy trình</span>
              <h2 className="text-3xl md:text-5xl font-bold font-display text-cyber-text-main mb-4">
                3 Bước <span className="text-emerald-400">Đơn Giản</span>
              </h2>
              <p className="text-cyber-text-muted max-w-xl mx-auto text-lg">Không cần cài đặt agent, không cần kinh nghiệm bảo mật chuyên sâu.</p>
            </Reveal>

            <div className="relative flex flex-col md:flex-row justify-center gap-12 md:gap-6 max-w-5xl mx-auto">
              {/* connecting line */}
              <div className="hidden md:block absolute top-12 left-[calc(16.67%+48px)] right-[calc(16.67%+48px)] h-px bg-gradient-to-r from-blue-500/0 via-cyber-blue/50 to-purple-500/0" />

              {[
                { num: '01', icon: <Search className="w-8 h-8" />, color: 'blue', title: 'Nhập URL Mục tiêu', desc: 'Cung cấp địa chỉ website và tuỳ chỉnh độ sâu crawl, delay, và header xác thực.', delay: 0 },
                { num: '02', icon: <Zap className="w-8 h-8" />, color: 'emerald', title: 'AI Tự Động Quét', desc: 'Hệ thống crawl, phân tích và thử nghiệm payload trên toàn bộ endpoint phát hiện được.', delay: 150 },
                { num: '03', icon: <FileText className="w-8 h-8" />, color: 'purple', title: 'Nhận Báo Cáo Ngay', desc: 'Kết quả phân loại theo mức độ, kèm bằng chứng và đề xuất khắc phục chi tiết.', delay: 300 },
              ].map(({ num, icon, color, title, desc, delay }) => {
                const colorMap: Record<string, { ring: string; text: string; glow: string }> = {
                  blue: { ring: 'group-hover:border-blue-500 group-hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]', text: 'text-blue-400', glow: 'bg-blue-500/10' },
                  emerald: { ring: 'group-hover:border-emerald-500 group-hover:shadow-[0_0_40px_rgba(16,185,129,0.3)]', text: 'text-emerald-400', glow: 'bg-emerald-500/10' },
                  purple: { ring: 'group-hover:border-purple-500 group-hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]', text: 'text-purple-400', glow: 'bg-purple-500/10' },
                };
                return (
                  <Reveal key={title} delay={delay} className="flex-1 flex flex-col items-center text-center group cursor-default">
                    <div className={`relative w-24 h-24 rounded-full glass-panel border border-cyber-border flex items-center justify-center mb-6 transition-all duration-500 ${colorMap[color].ring}`}>
                      <div className={`absolute inset-2 rounded-full ${colorMap[color].glow}`} />
                      <div className={`absolute inset-2 rounded-full border border-dashed ${colorMap[color].text}/30 animate-[spin_12s_linear_infinite]`} />
                      <div className={`relative z-10 ${colorMap[color].text}`}>{icon}</div>
                      <span className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-cyber-bg border border-cyber-border flex items-center justify-center text-[10px] font-black ${colorMap[color].text}`}>{num}</span>
                    </div>
                    <h3 className="text-xl font-bold font-display mb-2 text-cyber-text-main">{title}</h3>
                    <p className="text-cyber-text-muted text-sm px-4 leading-relaxed">{desc}</p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CHECKLIST / ABOUT ── */}
        <section id="about" className="w-full max-w-7xl mx-auto px-6 md:px-12 py-28 scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <span className="text-xs font-bold tracking-widest text-purple-400 uppercase mb-3 block">Về chúng tôi</span>
              <h2 className="text-3xl md:text-4xl font-bold font-display text-cyber-text-main mb-6 leading-tight">
                Công cụ bảo mật dành cho <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">mọi nhà phát triển</span>
              </h2>
              <p className="text-cyber-text-muted leading-relaxed mb-8">
                <strong className="text-cyber-text-main">WebSec Engine</strong> được xây dựng bởi đội ngũ kỹ sư An toàn Thông tin với sứ mệnh giúp mọi lập trình viên có thể tự bảo vệ ứng dụng của mình — không cần phải là chuyên gia bảo mật.
              </p>
              <p className="text-cyber-text-muted leading-relaxed">
                Chúng tôi tiên phong ứng dụng <span className="text-purple-400 font-semibold">Trí tuệ nhân tạo</span> và <span className="text-purple-400 font-semibold">Machine Learning</span> vào rà soát tự động, phát hiện các điểm yếu bảo mật phức tạp nhất như SQLi, XSS, CSRF, LFI.
              </p>
            </Reveal>

            <div className="space-y-4">
              {[
                { title: 'Chuẩn OWASP Top 10', desc: 'Phủ đầy đủ 4/10 lỗ hổng phổ biến nhất theo chuẩn OWASP: SQLi, XSS, CSRF, LFI.' },
                { title: 'Báo cáo xuất được ngay', desc: 'PDF và HTML report với màu cảnh báo theo mức độ, sẵn sàng nộp cho khách hàng.' },
                { title: 'Quét có xác thực', desc: 'Hỗ trợ truyền Cookie / Authorization header để quét sâu vào các trang yêu cầu đăng nhập.' },
                { title: 'Dashboard quản trị', desc: 'Admin có thể xem tổng quan hoạt động của toàn hệ thống theo biểu đồ từng ngày.' },
                { title: 'Dừng quét linh hoạt', desc: 'Có thể dừng giữa chừng và giữ lại kết quả đã tìm được — không mất dữ liệu.' },
              ].map(({ title, desc }, i) => (
                <Reveal key={title} delay={i * 80}>
                  <div className="flex gap-4 p-4 rounded-xl border border-cyber-border/50 bg-cyber-card/20 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300 group cursor-default">
                    <div className="mt-0.5 shrink-0">
                      <CheckCircle className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <p className="font-semibold text-cyber-text-main text-sm mb-0.5">{title}</p>
                      <p className="text-cyber-text-muted text-xs leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="w-full max-w-7xl mx-auto px-6 md:px-12 pb-28">
          <Reveal>
            <div className="relative rounded-[2.5rem] overflow-hidden border border-cyber-blue/25 bg-cyber-card/40 backdrop-blur-xl p-12 md:p-20 text-center group hover:border-cyber-blue/50 transition-all duration-700">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 pointer-events-none" />
              <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-500/15 rounded-full blur-[100px] group-hover:bg-blue-500/25 transition-colors duration-700 pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-500/15 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-8 shadow-xl shadow-blue-500/30 mx-auto">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight mb-6 text-cyber-text-main">
                  Sẵn sàng bảo vệ{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">hệ thống</span>{' '}
                  của bạn?
                </h2>
                <p className="text-xl text-cyber-text-muted mb-10 max-w-2xl mx-auto">
                  Tham gia ngay và thực hiện lần quét đầu tiên trong vòng chưa đầy 1 phút — hoàn toàn miễn phí.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={onLoginClick}
                    className="group flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg transition-all active:scale-95 shadow-[0_0_35px_rgba(59,130,246,0.4)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Zap className="w-5 h-5" />
                    Khởi tạo Quét Ngay
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 w-full border-t border-cyber-border/40 py-10 bg-cyber-card/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <span className="font-bold font-display text-base text-cyber-text-main block">WebSec Engine</span>
              <span className="text-xs text-cyber-text-muted">Nền tảng Quét Lỗ Hổng Bảo Mật Web</span>
            </div>
          </div>
          <div className="flex items-center gap-8 text-sm text-cyber-text-muted">
            {['#features', '#how-it-works', '#about'].map((href, i) => (
              <a key={href} href={href} className="hover:text-cyber-text-main transition-colors cursor-pointer">
                {['Tính năng', 'Hoạt động', 'Giới thiệu'][i]}
              </a>
            ))}
          </div>
          <p className="text-xs text-cyber-text-muted">© 2026 WebSec Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
