import React, { useState, useEffect } from 'react';
import { Bell, Flame, Sparkles, Search, Sun, Moon, Menu } from 'lucide-react';
import { User } from '../types';
import { useTheme } from '../ThemeContext';

interface HeaderProps {
  activeTab: string;
  user: User;
  onToggleSidebar?: () => void;
}

export default function Header({ activeTab, user, onToggleSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [apiKeyOk, setApiKeyOk] = useState<boolean | null>(null);
  const [streakCount] = useState(5);
  const [paperCount, setPaperCount] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [lastLogin, setLastLogin] = useState<string>('');

  useEffect(() => {
    // Sync paper count and API status
    fetch('/api/papers')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        setApiKeyOk(true);
        if (Array.isArray(data)) {
          setPaperCount(data.length);
        }
      })
      .catch(() => {
        setApiKeyOk(false);
      });
  }, [activeTab]);

  useEffect(() => {
    // Setup last login timestamp
    let saved = localStorage.getItem('researchmind_last_login');
    if (!saved) {
      saved = '15 July 2026 • 10:15 AM';
      localStorage.setItem('researchmind_last_login', saved);
    }
    setLastLogin(saved);

    // Setup running clock
    const updateTime = () => {
      const now = new Date();
      const day = now.getDate();
      const month = now.toLocaleString('en-US', { month: 'long' });
      const year = now.getFullYear();
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      setCurrentTime(`${day} ${month} ${year} • ${time}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Academic Command Center';
      case 'library': return 'My Research Library';
      case 'workspace': return 'AI Workspace';
      case 'analytics': return 'Analytics';
      case 'profile': return 'Scholar Profile';
      case 'settings': return 'Settings';
      case 'synthesis': return 'Literature Synthesis Matrix Studio';
      default: return 'ResearchMind AI';
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Overview of your papers, assessments, and study metrics.';
      case 'library': return 'Create folders, browse literature, and open document workspaces.';
      case 'workspace': return 'Ground conversations, summaries, flashcards, and quizzes in your paper.';
      case 'analytics': return 'Track reading rates, study hours, and assessment results.';
      case 'profile': return 'Your academic achievements, milestones, and stats.';
      case 'settings': return 'Manage system themes, notification triggers, and model personas.';
      case 'synthesis': return 'Select publications to generate comparison grids, narratives, and gap analyses.';
      default: return 'AI Research Paper Accelerator';
    }
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    let timeGreeting = 'Welcome';
    if (hours < 12) timeGreeting = 'Good Morning';
    else if (hours < 18) timeGreeting = 'Good Afternoon';
    else timeGreeting = 'Good Evening';
    return `${timeGreeting}, ${user.name || 'Scholar'} 👋`;
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-40" id="top_header_root">
      {/* Title & Greeting */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 -ml-1 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-all shrink-0 cursor-pointer"
            id="mobile_sidebar_toggle"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col justify-center min-w-0">
          <h2 className="font-display font-extrabold text-base sm:text-lg md:text-xl text-slate-950 dark:text-white tracking-tight leading-tight truncate">{getPageTitle()}</h2>
          {activeTab === 'dashboard' ? (
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1.5 truncate" id="user_greeting_header">
              {getGreeting()}
            </p>
          ) : (
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal font-medium truncate">{getPageSubtitle()}</p>
          )}
        </div>
      </div>

      {/* Quick Metrics & Badges / Dashboard header content */}
      {activeTab === 'dashboard' ? (
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0" id="dashboard_header_info">
          {/* AI Status Indicator */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 shrink-0" id="header_ai_status">
            {apiKeyOk === true ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-sans">AI Online</span>
              </>
            ) : apiKeyOk === null ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                <span className="text-[10px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400 font-sans">Processing</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                <span className="text-[10px] sm:text-xs font-semibold text-red-600 dark:text-red-400 font-sans">AI Offline</span>
              </>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
            <button 
              className="p-1.5 sm:p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-800 rounded-xl transition-all relative shrink-0 cursor-pointer" 
              id="bell_btn" 
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            </button>
            <button 
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-slate-800 rounded-xl transition-all shrink-0 cursor-pointer" 
              id="theme_toggle_dashboard" 
              title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500 animate-pulse" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3" id="header_widgets">
          {/* Study Streak */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900/40 hover:scale-105 transition-transform cursor-default"
            title="Daily Study Streak Counter"
            id="streak_widget"
          >
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-bounce" />
            <div className="text-left leading-none">
              <span className="text-xs font-black block">{streakCount} Days</span>
            </div>
          </div>

          {/* Gemini Status Widget */}
          <div 
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border transition-all text-xs font-semibold ${
              apiKeyOk 
                ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/40' 
                : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/40'
            }`}
            id="gemini_status_widget"
          >
            <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" />
            <span className="font-sans">Gemini 2.5 Active</span>
          </div>

          {/* User Role Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="capitalize">{user.role}</span>
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-slate-800 rounded-full transition-all shrink-0 cursor-pointer" 
            id="theme_toggle_generic" 
            title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500 animate-pulse" />}
          </button>
        </div>
      )}
    </header>
  );
}
