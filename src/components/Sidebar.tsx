import React from 'react';
import { 
  LayoutDashboard, Library, Brain, TrendingUp, User as UserIcon, Settings, 
  LogOut
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'My Library', icon: Library },
    { id: 'workspace', label: 'AI Workspace', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 shrink-0" id="sidebar_root">
      {/* Brand Section */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h2 className="font-display font-bold text-base tracking-tight text-white truncate">ResearchMind AI</h2>
            <p className="text-[10px] text-blue-400 font-mono tracking-widest uppercase mt-0.5">V1.0 Capstone</p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" id="sidebar_nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group text-left ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
              id={`sidebar_tab_${item.id}`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info / Logout Section */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40" id="sidebar_user_footer">
        <div className="flex items-center gap-3 mb-4">
          <img 
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'} 
            alt={user.name} 
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800"
          />
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-white truncate leading-snug">{user.name}</h4>
            <p className="text-[10px] text-slate-400 capitalize font-medium">{user.role}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-left"
          id="logout_btn"
        >
          <LogOut className="w-3.5 h-3.5" />
          Terminate Session
        </button>
      </div>
    </aside>
  );
}
