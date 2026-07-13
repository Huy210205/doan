import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LoginScreen from './components/LoginScreen';
import DashboardView from './components/DashboardView';
import HistoryView from './components/HistoryView';
import ConfigView from './components/ConfigView';
import LandingPage from './components/LandingPage';
import { ScanHistoryItem, SystemConfig, ActiveTab, UserSession } from './types';
import contentData from './data/contentData.json';

export default function App() {
  const [session, setSession] = useState<UserSession>({
    email: '',
    isAuthenticated: false
  });

  const [showLogin, setShowLogin] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Theme state defaulting to light (nền sáng) as explicitly requested
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const cached = localStorage.getItem('websec_theme');
    return (cached as 'light' | 'dark') || 'light';
  });

  // History list persisted locally
  const [historyList, setHistoryList] = useState<ScanHistoryItem[]>([]);

  // Configurations persisted locally
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    crawler: {
      max_depth: contentData.system_config.default_crawler.max_depth,
      delay_ms: contentData.system_config.default_crawler.delay_ms
    },
    selected_model_id: 'rf',
    retrain_on_new_data: true,
    pdf_report_email: 'admin@company.com',
    auth_header: ''
  });

  // Handle document class modifications for Tailwind v4 selector adaptivity
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('websec_theme', next);
      return next;
    });
  };

  // Pull local-storage or preset defaults on mount
  useEffect(() => {
    // Session parsing
    const cachedSession = localStorage.getItem('websec_session');
    if (cachedSession) {
      try {
        setSession(JSON.parse(cachedSession));
      } catch (err) {
        console.error('Error parsing session cache', err);
      }
    }

    // Config parsing
    const cachedConfig = localStorage.getItem('websec_config');
    if (cachedConfig) {
      try {
        setSystemConfig(JSON.parse(cachedConfig));
      } catch (err) {
        console.error('Error parsing config cache', err);
      }
    }

    // Histories parsing
    const cachedHistory = localStorage.getItem('websec_history');
    if (cachedHistory) {
      try {
        setHistoryList(JSON.parse(cachedHistory));
      } catch (err) {
        console.error('Error parsing history cache', err);
      }
    } else {
      // Use sample default records to make UI spectacular initially!
      const defaults = contentData.sample_history as ScanHistoryItem[];
      setHistoryList(defaults);
      localStorage.setItem('websec_history', JSON.stringify(defaults));
    }
  }, []);

  const handleLoginSuccess = (sessionData: Omit<UserSession, 'isAuthenticated'>) => {
    const updatedSession = { ...sessionData, isAuthenticated: true };
    setSession(updatedSession);
    localStorage.setItem('websec_session', JSON.stringify(updatedSession));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    const updatedSession = { email: '', isAuthenticated: false };
    setSession(updatedSession);
    localStorage.removeItem('websec_session');
  };

  const handleSaveConfig = (updatedConfig: SystemConfig) => {
    setSystemConfig(updatedConfig);
    localStorage.setItem('websec_config', JSON.stringify(updatedConfig));
  };

  const handleAddHistoryItem = (newItem: ScanHistoryItem) => {
    setHistoryList((prev) => {
      const updated = [newItem, ...prev];
      localStorage.setItem('websec_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistoryList((prev) => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('websec_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Guard routing
  if (!session.isAuthenticated) {
    if (showLogin) {
      return <LoginScreen onLoginSuccess={handleLoginSuccess} onBack={() => setShowLogin(false)} />;
    }
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  return (
    <div id="app-root-frame" className="min-h-screen bg-cyber-bg flex text-cyber-text-main selection:bg-cyber-blue/30 transition-colors duration-200">
      {/* Decorative cyber backdrop canvas blur */}
      {theme === 'dark' && (
        <div className="fixed top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#0b1022] to-transparent opacity-40 pointer-events-none z-0" />
      )}

      {/* Navigation rails */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        session={session}
        onSessionUpdate={(newSession) => {
          setSession(newSession);
          localStorage.setItem('websec_session', JSON.stringify(newSession));
        }}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Primary content area */}
      <main id="main-content-panel" className="flex-1 min-w-0 min-h-screen relative z-10 overflow-y-auto">
        <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
          <DashboardView
            onAddHistoryItem={handleAddHistoryItem}
            systemConfig={systemConfig}
          />
        </div>

        <div className={activeTab === 'history' ? 'block' : 'hidden'}>
          <HistoryView
            activeTab={activeTab}
            onDeleteHistoryItem={handleDeleteHistoryItem}
          />
        </div>

        <div className={activeTab === 'config' ? 'block' : 'hidden'}>
          <ConfigView
            initialConfig={systemConfig}
            onSaveConfig={handleSaveConfig}
          />
        </div>
      </main>
    </div>
  );
}
