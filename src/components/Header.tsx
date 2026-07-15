import React, { useState, useEffect } from 'react';
import { Bell, Flame, Sparkles, Search, Sun, Moon } from 'lucide-react';
import { User } from '../types';
import { useTheme } from '../ThemeContext';

interface HeaderProps {
  activeTab: string;
  user: User;
}

export default function Header({ activeTab, user }: HeaderProps) {
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
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-0 z-40" id="top_header_root">
      {/* Title & Greeting */}
      <div className="flex flex-col justify-center">
        <h2 className="font-display font-extrabold text-lg md:text-xl text-slate-950 dark:text-white tracking-tight leading-tight">{getPageTitle()}</h2>
        {activeTab === 'dashboard' ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1.5" id="user_greeting_header">
            {getGreeting()}
          </p>
        ) : (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal font-medium">{getPageSubtitle()}</p>
        )}
      </div>

      {/* Quick Metrics & Badges / Dashboard header content */}
      {activeTab === 'dashboard' ? (
        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs" id="dashboard_header_info">
          {/* Quick Search */}
          <div className="relative" id="quick_search_container">
            <input 
              type="text" 
              placeholder="Search documents..."
              className="pl-8 pr-3 py-1 w-36 focus:w-48 transition-all duration-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none rounded-full text-[11px] font-medium text-slate-700 dark:text-slate-200"
              id="quick_search_input"
            />
            <Search className="absolute left-2.5 top-1.5 w-3 h-3 text-slate-400" />
          </div>

          {/* Info Columns */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-left md:border-l md:border-slate-200 dark:md:border-slate-800 md:pl-4" id="dashboard_info_columns">
            <div>
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none">Last Login</span>
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 font-mono mt-0.5 block">{lastLogin}</span>
            </div>
            <div>
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none">Workspace</span>
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 mt-0.5 block">ResearchMind</span>
            </div>
            <div>
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none">AI Status</span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected
              </span>
            </div>
            <div>
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none">Documents</span>
              <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded mt-0.5 block text-center leading-none">{paperCount}</span>
            </div>
          </div>

          {/* Time & Notifications */}
          <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-3">
            <div className="text-left hidden lg:block">
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none">Local Time</span>
              <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 mt-0.5 block whitespace-nowrap">{currentTime}</span>
            </div>
            <button className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-800 rounded-full transition-all relative shrink-0" id="bell_btn" title="Notifications">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1 h-1 bg-blue-600 rounded-full"></span>
            </button>
            <button 
              onClick={toggleTheme}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-slate-800 rounded-full transition-all shrink-0 cursor-pointer" 
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
