import React, { useState, useEffect } from 'react';
import { User, DashboardMetrics, Paper } from '../types';
import { 
  Award, Clock, BookOpen, Brain, CheckCircle2, 
  Calendar, Mail, User as UserIcon, Shield, Star
} from 'lucide-react';

interface ProfileProps {
  user: User;
  onOpenPaper: (paperId: string) => void;
}

export default function Profile({ user, onOpenPaper }: ProfileProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [bookmarkedPapers, setBookmarkedPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [metRes, papRes] = await Promise.all([
          fetch('/api/metrics'),
          fetch('/api/papers')
        ]);
        if (metRes.ok && papRes.ok) {
          const metricsData = await metRes.json();
          const papersData = await papRes.json();
          setMetrics(metricsData);
          setBookmarkedPapers(papersData.filter((p: Paper) => p.isBookmarked));
        }
      } catch (err) {
        console.error('Failed to fetch profile metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Preset achievements with dynamic unlocking conditions
  const achievementsList = [
    {
      id: 'novice',
      title: 'Grounding Pioneer',
      description: 'Connected and conversed with Gemini regarding first index paper.',
      icon: MessageIcon,
      unlocked: metrics ? metrics.recentActivity.some(a => a.type === 'chat') : false,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100'
    },
    {
      id: 'scholar',
      title: 'Docu-Scribe',
      description: 'Logged active study hours over multiple papers.',
      icon: BookOpen,
      unlocked: metrics ? metrics.readingHours > 2 : false,
      color: 'bg-blue-50 text-blue-600 border-blue-100'
    },
    {
      id: 'quiz',
      title: 'Socratic Conqueror',
      description: 'Passed comprehension exams generated from paper structures.',
      icon: CheckCircle2,
      unlocked: metrics ? metrics.quizzesCompleted > 0 : false,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    },
    {
      id: 'flashcard',
      title: 'Perfect Recall',
      description: 'Conducted flashcard sessions for memory retention.',
      icon: Brain,
      unlocked: metrics ? metrics.flashcardsReviewed > 5 : false,
      color: 'bg-purple-50 text-purple-600 border-purple-100'
    }
  ];

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6" id="profile_loading_skeleton">
        <div className="h-40 bg-slate-100 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-100 rounded-3xl animate-pulse md:col-span-2" />
          <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto text-left" id="profile_root">
      {/* HEADER HERO CARD */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6" id="profile_hero_section">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img 
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=240'} 
            alt={user.name} 
            className="w-24 h-24 rounded-3xl object-cover ring-4 ring-slate-100"
            referrerPolicy="no-referrer"
          />
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-xs font-bold text-blue-700 capitalize">
              <Shield className="w-3.5 h-3.5" />
              {user.role}
            </div>
            <h2 className="font-display font-black text-2xl text-slate-900">{user.name}</h2>
            <div className="flex flex-col sm:flex-row items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Enrolled: {formatDate(user.enrolledAt || new Date().toISOString())}
              </span>
            </div>
          </div>
        </div>

        {/* METRICS SUMMARY STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-2xl w-full md:w-auto" id="profile_hero_stats">
          <div className="text-center md:text-left">
            <p className="text-[10px] uppercase font-mono text-slate-400 font-bold">Total Papers</p>
            <p className="text-xl font-display font-black text-slate-800 mt-1">{metrics?.totalPapers || 0}</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-[10px] uppercase font-mono text-slate-400 font-bold">Study Hours</p>
            <p className="text-xl font-display font-black text-slate-800 mt-1">{metrics?.readingHours || 0}h</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-[10px] uppercase font-mono text-slate-400 font-bold">Quizzes Done</p>
            <p className="text-xl font-display font-black text-slate-800 mt-1">{metrics?.quizzesCompleted || 0}</p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-[10px] uppercase font-mono text-slate-400 font-bold">Flashcards</p>
            <p className="text-xl font-display font-black text-slate-800 mt-1">{metrics?.flashcardsReviewed || 0}</p>
          </div>
        </div>
      </div>

      {/* CORE PROFILE CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="profile_content_grid">
        {/* LEFT COLUMN: Achievements & Bookmarked papers */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Achievements Subsection */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-black text-slate-900 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Academic Milestones & Badges
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievementsList.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div 
                    key={badge.id}
                    className={`p-4 rounded-2xl border flex gap-4 transition-all ${
                      badge.unlocked 
                        ? `${badge.color} shadow-sm opacity-100` 
                        : 'bg-slate-50/50 text-slate-400 border-slate-100 opacity-60'
                    }`}
                  >
                    <div className="shrink-0 flex items-center justify-center p-2 rounded-xl bg-white/85 shadow-sm border border-slate-100 h-10 w-10">
                      <Icon className={`w-5 h-5 ${badge.unlocked ? '' : 'text-slate-300'}`} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-sans text-slate-800 flex items-center gap-1">
                        {badge.title}
                        {badge.unlocked && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal">{badge.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bookmarked Papers */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-black text-slate-900 text-base flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600 fill-blue-600/10" />
              Pinned & Saved Bibliography ({bookmarkedPapers.length})
            </h3>

            {bookmarkedPapers.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                No pinned papers found in your collection. Star papers in My Library to pin them here.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bookmarkedPapers.map((paper) => (
                  <div 
                    key={paper.id}
                    onClick={() => onOpenPaper(paper.id)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-500/30 hover:shadow-md hover:shadow-blue-500/5 transition-all cursor-pointer text-left flex flex-col justify-between h-28"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1 leading-snug">{paper.title}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">{paper.authors}</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-50">
                      <span className="font-mono">{paper.journal}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 font-mono text-[9px] font-bold text-slate-600">
                        Progress: {paper.readingProgress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Activity List */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 h-fit">
          <h3 className="font-display font-black text-slate-900 text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-700" />
            Recent Activity Logs
          </h3>

          <div className="space-y-4">
            {!metrics || metrics.recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No recent learning activity logged.</p>
            ) : (
              metrics.recentActivity.map((activity) => (
                <div key={activity.id} className="text-xs flex gap-3 border-l-2 border-slate-100 pl-4 relative py-1 hover:bg-slate-50/50 rounded-r-xl pr-2 transition-colors">
                  <div className="absolute w-2 h-2 rounded-full bg-blue-500 -left-[5px] top-2.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-slate-800 text-[11px] leading-relaxed">
                      {activity.detail} <span className="font-mono font-bold text-slate-900">"{activity.paperTitle}"</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
