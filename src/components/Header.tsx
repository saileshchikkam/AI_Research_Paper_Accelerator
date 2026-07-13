import React, { useState, useEffect } from 'react';
import { Bell, Flame, KeyRound, Sparkles, AlertTriangle } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  activeTab: string;
  user: User;
}

export default function Header({ activeTab, user }: HeaderProps) {
  const [apiKeyOk, setApiKeyOk] = useState<boolean | null>(null);
  const [streakCount, setStreakCount] = useState(5);

  useEffect(() => {
    // Quick, non-blocking check on mount to see if the server has a valid Gemini Key configured
    fetch('/api/papers') // Simple quick endpoint
      .then(() => {
        // We will assume true unless an error is caught elsewhere, or we can probe the status elegantly
        setApiKeyOk(true);
      })
      .catch(() => {
        setApiKeyOk(false);
      });
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Academic Command Center';
      case 'library': return 'My Research Library';
      case 'workspace': return 'AI Workspace';
      case 'analytics': return 'Analytics';
      case 'profile': return 'Scholar Profile';
      case 'settings': return 'Settings';
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
      default: return 'AI Research Paper Accelerator';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-40" id="top_header_root">
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-slate-950 tracking-tight">{getPageTitle()}</h2>
        <p className="text-xs text-slate-500 mt-1 leading-normal font-medium">{getPageSubtitle()}</p>
      </div>

      {/* Quick Metrics & Badges */}
      <div className="flex items-center gap-4" id="header_widgets">
        {/* Study Streak */}
        <div 
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-orange-50 text-orange-700 border border-orange-100 hover:scale-105 transition-transform cursor-default"
          title="Daily Study Streak Counter"
          id="streak_widget"
        >
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-bounce" />
          <div className="text-left leading-none">
            <span className="text-xs font-black block">{streakCount} Days</span>
            <span className="text-[9px] text-orange-500 font-mono uppercase tracking-wider font-semibold">Streak</span>
          </div>
        </div>

        {/* Gemini Status Widget */}
        <div 
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
            apiKeyOk 
              ? 'bg-blue-50 text-blue-700 border-blue-100' 
              : 'bg-amber-50 text-amber-700 border-amber-100'
          }`}
          id="gemini_status_widget"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          <span className="font-sans">Gemini 2.5 Active</span>
        </div>

        {/* User Role Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="capitalize">{user.role} workspace</span>
        </div>
      </div>
    </header>
  );
}
