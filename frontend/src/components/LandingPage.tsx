import React from 'react';
import { Shield, Zap, Search, Lock, Server, ArrowRight, Sun, Moon } from 'lucide-react';
import Logo from './Logo';

interface LandingPageProps {
  onLoginClick: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function LandingPage({ onLoginClick, theme, onToggleTheme }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-cyber-bg text-cyber-text-main selection:bg-cyber-blue/30 relative overflow-x-hidden transition-colors duration-200">
      {/* Background Container - prevents scroll overflow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Decorative Background Layers */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 h-20 z-50 glass-panel border-b border-cyber-border/40 flex items-center justify-between px-6 md:px-12 backdrop-blur-xl bg-cyber-bg/70 dark:bg-cyber-bg/50">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <h2 className="text-xl font-bold font-display tracking-tight text-cyber-text-main leading-none">
              WebSec
            </h2>
            <span className="text-[10px] font-mono tracking-widest text-cyber-blue/80 uppercase mt-1 block font-bold">
              Secure Engine
            </span>
          </div>
        </div>

        {/* Quick Navigation - Desktop Only */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-cyber-text-muted">
          <a href="#home" className="hover:text-cyber-text-main transition-colors">Trang chủ</a>
          <a href="#features" className="hover:text-cyber-text-main transition-colors">Tính năng</a>
          <a href="#about" className="hover:text-cyber-text-main transition-colors">Giới thiệu</a>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full hover:bg-cyber-card transition-colors text-cyber-text-muted hover:text-cyber-text-main flex-shrink-0"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button 
            onClick={onLoginClick}
            className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm tracking-wide overflow-hidden transition-all duration-300 active:scale-95 bg-cyber-card-light/50 border border-cyber-border text-cyber-text-main shadow-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:border-cyber-blue/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-300">
              Đăng nhập <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
            </span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-32 pb-20 px-6 md:px-12 w-full max-w-7xl mx-auto flex-1 flex flex-col items-center">
        
        {/* Hero Section - Split Layout */}
        <section id="home" className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center mt-8 md:mt-16 mb-24 scroll-mt-32">
          
          {/* Left: Copy */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border-cyber-blue/30 text-cyber-blue text-sm font-medium mb-6 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-blue"></span>
              </span>
              WebSec Engine v2.0 Đã Ra Mắt
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold font-display tracking-tight mb-6 leading-[1.1] text-cyber-text-main drop-shadow-sm">
              Phát Hiện Rủi Ro <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-blue-500 to-purple-500">Tự Động Bằng AI</span>
            </h1>
            
            <p className="text-lg md:text-xl text-cyber-text-muted mb-10 max-w-xl leading-relaxed">
              Bảo vệ toàn diện hệ thống web của bạn. Thuật toán Machine Learning độc quyền giúp truy quét và ngăn chặn Zero-day chưa từng có, với tốc độ dưới 1 giây.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button 
                onClick={onLoginClick}
                className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cyber-blue to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg transition-all active:scale-95 shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:shadow-[0_0_35px_rgba(59,130,246,0.6)]"
              >
                <span>Bắt đầu miễn phí</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right: 3D Mockup / Graphic */}
          <div className="relative w-full h-[400px] lg:h-[500px] hidden md:block perspective-1000 z-10" style={{ perspective: '1000px' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/30 to-purple-500/30 rounded-3xl blur-[80px] transform -rotate-6 scale-105 pointer-events-none" />
            
            <div className="absolute inset-x-4 lg:inset-x-0 inset-y-8 glass-panel rounded-2xl border-cyber-blue/30 shadow-2xl transform rotate-[4deg] hover:rotate-0 hover:scale-[1.02] transition-all duration-700 overflow-hidden flex flex-col bg-cyber-bg/80 dark:bg-cyber-card/90">
              {/* Mockup Header */}
              <div className="h-10 border-b border-cyber-border/50 bg-cyber-card-light/50 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <div className="ml-4 h-4 w-32 bg-cyber-border/40 rounded-full" />
              </div>
              {/* Mockup Body */}
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

                <div className="flex-1 rounded-xl bg-cyber-card border border-cyber-border mt-2 p-4">
                  <div className="h-3 w-1/3 bg-cyber-text-muted/20 rounded-full mb-6" />
                  <div className="space-y-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div className="h-2 w-full bg-cyber-border/60 rounded-full" />
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div className="h-2 w-5/6 bg-cyber-border/60 rounded-full" />
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div className="h-2 w-4/6 bg-cyber-border/60 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges Section */}
        <section className="w-[100vw] relative left-1/2 -translate-x-1/2 border-y border-cyber-border/40 bg-cyber-card-light/30 backdrop-blur-sm py-10 mb-32 flex flex-col items-center justify-center">
          <p className="text-sm font-semibold text-cyber-text-muted uppercase tracking-widest mb-8">Được tin dùng bởi các chuyên gia bảo mật hàng đầu</p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-700 max-w-7xl px-6">
            <div className="text-2xl font-display font-bold flex items-center gap-2"><Shield className="w-6 h-6"/> TechCorp</div>
            <div className="text-2xl font-display font-bold italic flex items-center gap-2"><Server className="w-6 h-6"/> GlobalSec</div>
            <div className="text-2xl font-display font-bold flex items-center gap-2"><Lock className="w-6 h-6"/> FinBank</div>
            <div className="text-2xl font-display font-bold tracking-widest flex items-center gap-2"><Zap className="w-6 h-6"/> AETHER</div>
          </div>
        </section>

        {/* Features Section - Bento Box */}
        <section id="features" className="w-full scroll-mt-32 mb-32 z-10 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display mb-4 text-cyber-text-main">Hệ Sinh Thái <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Tính Năng</span></h2>
            <p className="text-cyber-text-muted max-w-2xl mx-auto text-lg">Kiến trúc bảo mật toàn diện được thiết kế chuyên biệt để đối phó với các cuộc tấn công Zero-day thế hệ mới.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
            {/* Box 1: Large Feature */}
            <div className="md:col-span-2 md:row-span-2 rounded-3xl glass-panel bg-cyber-card/40 border-cyber-border/60 p-8 md:p-12 relative overflow-hidden group hover:border-cyber-blue/50 transition-all duration-500 flex flex-col hover:shadow-[0_0_40px_rgba(59,130,246,0.1)]">
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/30 transition-colors duration-500" />
              
              <div className="flex-1 relative z-10 flex flex-col justify-end">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30 text-white group-hover:scale-110 transition-transform duration-500">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold font-display mb-4 text-cyber-text-main">Siêu Tốc Độ Đa Luồng</h3>
                <p className="text-cyber-text-muted text-lg max-w-md leading-relaxed">
                  Thuật toán nội suy Deep Crawler quét song song hàng ngàn Endpoints cùng lúc. Phát hiện 90% lỗ hổng trong vòng chưa tới 1 giây mà không gây nghẽn máy chủ.
                </p>
              </div>
            </div>

            {/* Box 2 */}
            <div className="md:col-span-1 md:row-span-1 rounded-3xl glass-panel bg-cyber-card/40 border-cyber-border/60 p-8 relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-500 flex flex-col justify-end hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <div className="absolute top-0 right-0 p-6 text-emerald-500/10 group-hover:text-emerald-500/20 group-hover:scale-110 transition-all duration-500"><Shield className="w-24 h-24" /></div>
              <h3 className="text-2xl font-bold font-display mb-3 text-cyber-text-main relative z-10">Báo Cáo Thông Minh</h3>
              <p className="text-cyber-text-muted text-sm relative z-10">Xuất PDF báo cáo rủi ro chi tiết kèm hướng dẫn khắc phục tức thì.</p>
            </div>

            {/* Box 3 */}
            <div className="md:col-span-1 md:row-span-1 rounded-3xl glass-panel bg-cyber-card/40 border-cyber-border/60 p-8 relative overflow-hidden group hover:border-purple-500/50 transition-all duration-500 flex flex-col justify-end hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent pointer-events-none" />
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500"><Server className="w-6 h-6" /></div>
              <h3 className="text-2xl font-bold font-display mb-3 text-cyber-text-main relative z-10">AI Classification</h3>
              <p className="text-cyber-text-muted text-sm relative z-10">Động cơ phân tích hành vi bất thường bằng mô hình Random Forest & SVM.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full mb-32 z-10 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-cyber-text-main">Vận Hành <span className="text-emerald-500">Tối Giản</span></h2>
            <p className="text-cyber-text-muted max-w-2xl mx-auto text-lg">Bảo mật hệ thống của bạn chỉ qua 3 bước hoàn toàn tự động.</p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-4 relative max-w-5xl mx-auto">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-24 right-24 h-0.5 bg-gradient-to-r from-blue-500/0 via-cyber-blue to-purple-500/0 opacity-30" />
            
            {/* Step 1 */}
            <div className="flex-1 flex flex-col items-center text-center relative group">
              <div className="w-24 h-24 rounded-full glass-panel bg-cyber-card border-cyber-border mb-6 flex items-center justify-center relative z-10 group-hover:border-cyber-blue group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-500">
                <div className="absolute inset-2 rounded-full border border-cyber-blue/30 border-dashed animate-[spin_10s_linear_infinite]" />
                <span className="text-3xl font-display font-bold text-cyber-text-main">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Nhập URL Mục tiêu</h3>
              <p className="text-cyber-text-muted text-sm px-4">Cung cấp địa chỉ website cần kiểm tra mà không cần cài đặt agent rườm rà.</p>
            </div>
            
            {/* Step 2 */}
            <div className="flex-1 flex flex-col items-center text-center relative group">
              <div className="w-24 h-24 rounded-full glass-panel bg-cyber-card border-cyber-border mb-6 flex items-center justify-center relative z-10 group-hover:border-emerald-500 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-500">
                <div className="absolute inset-2 rounded-full border border-emerald-500/30 border-dashed animate-[spin_8s_linear_infinite]" />
                <Zap className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Tự Động Quét</h3>
              <p className="text-cyber-text-muted text-sm px-4">Engine kết hợp Crawler và Machine Learning truy quét toàn bộ ngóc ngách hệ thống.</p>
            </div>
            
            {/* Step 3 */}
            <div className="flex-1 flex flex-col items-center text-center relative group">
              <div className="w-24 h-24 rounded-full glass-panel bg-cyber-card border-cyber-border mb-6 flex items-center justify-center relative z-10 group-hover:border-purple-500 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-500">
                <div className="absolute inset-2 rounded-full border border-purple-500/30 border-dashed animate-[spin_12s_linear_infinite]" />
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Nhận Báo Cáo</h3>
              <p className="text-cyber-text-muted text-sm px-4">Báo cáo mức độ rủi ro chi tiết kèm giải pháp khắc phục triệt để.</p>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="w-full scroll-mt-32 mb-32 z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">Về Chúng Tôi</h2>
            <div className="glass-panel p-8 md:p-12 rounded-3xl border-cyber-blue/20 bg-cyber-card/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-blue/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
              
              <p className="text-lg text-cyber-text-main max-w-4xl mx-auto leading-relaxed relative z-10">
                <strong className="text-cyber-blue">WebSec Engine</strong> được phát triển bởi đội ngũ kỹ sư An toàn Thông tin với sứ mệnh tạo ra một môi trường Internet an toàn hơn. Chúng tôi tiên phong ứng dụng công nghệ <span className="text-purple-400 font-semibold">Trí Tuệ Nhân Tạo (AI)</span> và <span className="text-purple-400 font-semibold">Machine Learning</span> vào việc rà soát, phát hiện tự động các điểm yếu bảo mật phức tạp nhất, giúp doanh nghiệp bảo vệ dữ liệu một cách toàn diện.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full mb-12 relative z-10">
          <div className="glass-panel rounded-[3rem] p-12 md:p-20 border-cyber-blue/30 bg-cyber-card/60 relative overflow-hidden text-center flex flex-col items-center hover:border-cyber-blue/60 transition-colors duration-700">
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/10 to-purple-600/10 pointer-events-none" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
            
            <Shield className="w-16 h-16 text-cyber-text-main mb-6" />
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight mb-6 text-cyber-text-main relative z-10">
              Sẵn sàng bảo vệ <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-purple-500">hệ thống</span> của bạn?
            </h2>
            <p className="text-xl text-cyber-text-muted mb-10 max-w-2xl relative z-10">
              Tham gia cùng hàng ngàn doanh nghiệp đang sử dụng WebSec Engine để xây dựng một môi trường Internet an toàn hơn.
            </p>
            <button 
              onClick={onLoginClick}
              className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-cyber-text-main text-cyber-bg hover:bg-opacity-90 font-bold text-lg transition-all active:scale-95 shadow-xl hover:shadow-2xl hover:-translate-y-1 z-10"
            >
              <span>Khởi tạo Quét Ngay</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full mt-auto border-t border-cyber-border/40 py-8 bg-cyber-card/30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
          <div className="flex items-center gap-3 opacity-90">
            <Logo />
            <div>
              <span className="font-bold font-display text-lg text-cyber-text-main block">WebSec Engine</span>
              <span className="text-xs text-cyber-text-muted">Nền tảng Quét Lỗ Hổng Bảo Mật</span>
            </div>
          </div>
          <p className="text-sm text-cyber-text-muted">© 2026 WebSec Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

