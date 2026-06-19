import React from 'react';
import { Shield, LayoutDashboard, History, Settings, LogOut, User, Sun, Moon } from 'lucide-react';
import { ActiveTab } from '../types';
import contentData from '../data/contentData.json';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  userEmail: string;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Sidebar({ activeTab, onTabChange, userEmail, onLogout, theme, onToggleTheme }: SidebarProps) {
  const { app } = contentData;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard':
        return <LayoutDashboard className="w-5 h-5" />;
      case 'History':
        return <History className="w-5 h-5" />;
      case 'Settings':
        return <Settings className="w-5 h-5" />;
      default:
        return <LayoutDashboard className="w-5 h-5" />;
    }
  };

  return (
    <aside id="sidebar-panel" className="w-[280px] glass-panel border-r border-cyber-border/80 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-20 shadow-lg">
      <div className="flex flex-col">
        {/* Sidebar Header Brand Logo */}
        <div className="p-6 border-b border-cyber-border/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Shield className="w-6 h-6 text-cyber-blue" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-display tracking-tight text-cyber-text-main leading-none">
              {app.title}
            </h2>
            <span className="text-[10px] font-mono tracking-widest text-cyber-blue/80 uppercase mt-1 block font-bold">
              SECURE ENGINE
            </span>
          </div>
        </div>

        {/* User Greeting Block */}
        <div id="sidebar-user-block" className="px-6 py-5 border-b border-cyber-border/80 bg-cyber-card-light dark:bg-[#0a0e1b]/30">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-cyber-bg border border-cyber-border flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-cyber-text-muted" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-cyber-text-muted font-semibold tracking-wide uppercase">Xin chào,</p>
                <p className="text-xs text-cyber-text-main font-mono truncate font-semibold" title={userEmail}>
                  {userEmail}
                </p>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg border border-cyber-border/80 hover:border-cyber-blue/40 bg-cyber-card-light text-cyber-text-main transition-all duration-300 cursor-pointer hover:scale-110 active:scale-90 hover:rotate-45"
              title={theme === 'light' ? 'Chuyển sang nền tối' : 'Chuyển sang nền sáng'}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-violet-600 stroke-[2] transition-transform duration-300" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 stroke-[2] transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav id="sidebar-nav" className="p-4 space-y-1.5 mt-4">
          {contentData.navigation.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}-btn`}
                onClick={() => onTabChange(item.id as ActiveTab)}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                  isActive
                    ? 'bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue shadow-[0_4px_15px_rgba(59,130,246,0.15)] dark:shadow-[0_4px_20px_rgba(59,130,246,0.08)]'
                    : 'text-cyber-text-muted border border-transparent hover:text-cyber-text-main hover:bg-cyber-blue/5 dark:hover:bg-slate-800/40'
                }`}
              >
                {getIcon(item.icon)}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout triggers */}
      <div className="p-4 border-t border-cyber-border/80">
        <button
          id="logout-btn"
          onClick={onLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold text-red-500 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
