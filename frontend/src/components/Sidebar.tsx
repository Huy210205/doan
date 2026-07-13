import React, { useState, useRef } from 'react';
import { LayoutDashboard, History, Settings, LogOut, User, Sun, Moon, Camera, X, Loader2 } from 'lucide-react';
import { ActiveTab, UserSession } from '../types';
import contentData from '../data/contentData.json';
import api from '../api';
import Logo from './Logo';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  session: UserSession;
  onSessionUpdate: (session: UserSession) => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Sidebar({ activeTab, onTabChange, session, onSessionUpdate, onLogout, theme, onToggleTheme }: SidebarProps) {
  const { app } = contentData;
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editUsername, setEditUsername] = useState(session.username || '');
  const [editLogo, setEditLogo] = useState(session.logo || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File quá lớn, vui lòng chọn file dưới 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await api.put('/auth/update-profile', { username: editUsername, logo: editLogo }, {
        headers: { Authorization: `Bearer ${session.token}` }
      });
      onSessionUpdate({ ...session, username: editUsername, logo: editLogo });
      setIsProfileModalOpen(false);
    } catch (error) {
      alert('Không thể cập nhật cấu hình hồ sơ. Vui lòng thử lại.');
    } finally {
      setIsUpdating(false);
    }
  };

  const displayUser = session.username || session.email;

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
        <Logo />
          <div>
            <h2 className="text-lg font-bold font-display tracking-tight text-cyber-text-main leading-none">
              {app.title}
            </h2>
            <span className="text-[10px] font-mono tracking-widest text-cyber-blue/80 uppercase mt-1 block font-bold">
              SECURE ENGINE
            </span>
          </div>
        </div>

        <div
          id="sidebar-user-block"
          className="px-6 py-5 border-b border-cyber-border/60 group transition-all duration-300 user-block-bg"
        >
          <div className="flex items-center justify-between gap-2">
            <div 
              className="flex items-center gap-3 overflow-hidden cursor-pointer flex-1"
              onClick={() => {
                setEditUsername(session.username || '');
                setEditLogo(session.logo || '');
                setIsProfileModalOpen(true);
              }}
              title="Nhấn để chỉnh sửa hồ sơ"
            >
              <div className="w-9 h-9 rounded-full bg-white dark:bg-cyber-bg border-2 border-cyber-blue/30 dark:border-cyber-blue/20 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-cyber-blue/60 transition-all shadow-sm">
                {session.logo ? (
                  <img src={session.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-cyber-blue group-hover:text-cyber-blue transition-colors" />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] text-cyber-text-muted font-semibold tracking-wide uppercase">Xin chào,</p>
                <p className="text-xs text-cyber-text-main font-mono truncate font-semibold group-hover:text-cyber-blue transition-colors" title={session.email}>
                  {displayUser}
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
      
      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-cyber-bg border border-cyber-border rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <button 
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-4 right-4 text-cyber-text-muted hover:text-cyber-text-main"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold font-display text-cyber-text-main mb-6">Chỉnh sửa hồ sơ</h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex flex-col items-center gap-3 mb-6">
                <div 
                  className="w-20 h-20 rounded-full border-2 border-cyber-border flex items-center justify-center overflow-hidden relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {editLogo ? (
                    <img src={editLogo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-cyber-text-muted" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleLogoChange}
                />
                <p className="text-xs text-cyber-text-muted">Nhấn vào ảnh để thay đổi</p>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-cyber-text-muted font-mono uppercase tracking-wider block">Tên người dùng</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full bg-cyber-input-bg border border-cyber-border text-cyber-text-main text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all placeholder-slate-400 dark:placeholder-slate-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-cyber-text-muted font-mono uppercase tracking-wider block">Email</label>
                <input
                  type="text"
                  value={session.email}
                  disabled
                  className="w-full bg-cyber-input-bg/50 border border-cyber-border/50 text-cyber-text-muted text-sm rounded-xl px-4 py-3.5 focus:outline-none transition-all font-mono cursor-not-allowed"
                />
              </div>
              
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full mt-4 bg-cyber-blue hover:bg-blue-600 text-white font-semibold text-sm rounded-lg py-2.5 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Lưu thay đổi
              </button>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
