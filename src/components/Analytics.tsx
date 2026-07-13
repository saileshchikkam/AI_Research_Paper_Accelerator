import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, BarChart4, Clock, HelpCircle, Activity, Award, Flame, Calendar, RefreshCw
} from 'lucide-react';

interface ActivityLog {
  id: string;
  userId: string;
  type: 'read' | 'chat' | 'quiz' | 'note';
  paperTitle: string;
  paperId?: string;
  detail: string;
  timestamp: string;
}

export default function Analytics() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/activities');
      if (res.ok) {
        setActivities(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  // Static mock aggregates for display curves
  const monthlyData = [
    { month: 'Jan', hours: 12 },
    { month: 'Feb', hours: 25 },
    { month: 'Mar', hours: 18 },
    { month: 'Apr', hours: 32 },
    { month: 'May', hours: 45 },
    { month: 'Jun', hours: 58 }
  ];

  const maxHours = Math.max(...monthlyData.map(d => d.hours));

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto text-left" id="analytics_root">
      
      {/* OVERVIEW STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="analytics_agg_cards">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Average Study Pace</span>
            <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">42 mins/day</h4>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">▲ 14% vs last week</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 text-amber-600 p-4 rounded-2xl flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Assessment Passing Rate</span>
            <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">85.4% Avg</h4>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">Excellent comprehension</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-orange-50 text-orange-600 p-4 rounded-2xl flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Streaks Maintained</span>
            <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">5 active days</h4>
            <p className="text-[10px] text-orange-500 font-bold mt-1">Nearing milestone badge</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">Workspace Operations</span>
            <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">{activities.length} completed</h4>
            <p className="text-[10px] text-slate-500 font-medium mt-1">100% active cloud sync</p>
          </div>
        </div>
      </div>

      {/* VISUAL CHARTS ROW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="analytics_charts_grid">
        
        {/* Chart A: Reading Progress Trend Curve */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-display font-black text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Monthly Reading Hour Aggregations
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Displays total active paper hours logged over the last 6 months.</p>
          </div>

          <div className="my-6 relative h-[180px]" id="synthesis_reading_curve">
            <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
              {/* Gridlines */}
              {[0, 0.5, 1].map((ratio, i) => {
                const y = 10 + ratio * 120;
                const labelVal = Math.round(maxHours * (1 - ratio));
                return (
                  <g key={i}>
                    <line x1="30" y1={y} x2="390" y2={y} stroke="#F1F5F9" strokeWidth="1" />
                    <text x="5" y={y + 3} fill="#94A3B8" className="text-[8px] font-mono">{labelVal}h</text>
                  </g>
                );
              })}

              {/* Draw connected Polyline curve path */}
              {(() => {
                const points = monthlyData.map((d, idx) => {
                  const spacing = 360 / 5;
                  const x = 35 + idx * spacing;
                  const y = 130 - (d.hours / maxHours) * 110;
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <>
                    {/* Area under curve fill */}
                    <polygon
                      points={`35,130 ${points} 395,130`}
                      fill="url(#grad-blue)"
                      className="opacity-15"
                    />
                    
                    {/* Actual path stroke line */}
                    <polyline
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                      points={points}
                    />

                    {/* Coordinates node dots */}
                    {monthlyData.map((d, idx) => {
                      const spacing = 360 / 5;
                      const x = 35 + idx * spacing;
                      const y = 130 - (d.hours / maxHours) * 110;
                      return (
                        <g key={idx} className="group">
                          <circle
                            cx={x}
                            cy={y}
                            r="4.5"
                            fill="#FFFFFF"
                            stroke="#2563EB"
                            strokeWidth="2.5"
                            className="cursor-pointer transition-transform hover:scale-125"
                          />
                          <text
                            x={x}
                            y={y - 10}
                            fill="#1E293B"
                            className="text-[9px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                            textAnchor="middle"
                          >
                            {d.hours}h
                          </text>
                          <text
                            x={x}
                            y="145"
                            fill="#64748B"
                            className="text-[9px] font-semibold"
                            textAnchor="middle"
                          >
                            {d.month}
                          </text>
                        </g>
                      );
                    })}

                    {/* Gradient definition block */}
                    <defs>
                      <linearGradient id="grad-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#2563EB" />
                        <stop offset="100%" stopColor="#FFFFFF" />
                      </linearGradient>
                    </defs>
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Chart B: Distribution scores */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-display font-black text-slate-900 text-sm flex items-center gap-2">
              <BarChart4 className="w-4 h-4 text-blue-600" />
              Comprehension Quizzes distribution
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Averages segmented by academic topics in research folders.</p>
          </div>

          <div className="my-6 relative h-[180px]" id="compr_quiz_scores">
            <div className="space-y-4 pt-2">
              {[
                { name: 'Neural Networks & Transformers', score: 92, count: 4 },
                { name: 'Retrieval Augmented RAG Pipelines', score: 81, count: 3 },
                { name: 'Natural Language Processing Baselines', score: 88, count: 2 },
                { name: 'Evaluation Benchmarks & Matrices', score: 70, count: 1 }
              ].map((topic, tIdx) => (
                <div key={tIdx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 truncate max-w-[280px]">{topic.name}</span>
                    <span className="font-mono text-slate-500 font-bold">{topic.score}% avg</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        topic.score >= 85 ? 'bg-emerald-500' :
                        topic.score >= 75 ? 'bg-blue-500' :
                        'bg-amber-500'
                      }`}
                      style={{ width: `${topic.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* FULL CHRONOLOGICAL ACTIVITY LOG TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h4 className="font-display font-black text-slate-900 text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Comprehensive System Audit Trail
          </h4>
          <button 
            onClick={fetchActivities}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh logs"
            id="refresh_logs_btn"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400 font-mono text-center p-6">Loading audit trails...</p>
        ) : activities.length > 0 ? (
          <div className="overflow-x-auto" id="audit_trail_table">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <th className="p-3 w-1/4">Date & Time</th>
                  <th className="p-3 w-1/6">Audit Category</th>
                  <th className="p-3 w-1/4">Linked Paper Context</th>
                  <th className="p-3">Audit Details</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act) => (
                  <tr key={act.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3 text-slate-400 font-mono">
                      {new Date(act.timestamp).toLocaleDateString()} {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 uppercase font-mono tracking-wider text-[10px]">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        act.type === 'read' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        act.type === 'chat' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        act.type === 'quiz' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {act.type}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700 max-w-[200px] truncate" title={act.paperTitle}>
                      {act.paperTitle || 'All Library'}
                    </td>
                    <td className="p-3 text-slate-600 leading-relaxed font-medium">
                      {act.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-mono text-center p-6">No workspace activities logged in audit trail.</p>
        )}
      </div>
    </div>
  );
}
