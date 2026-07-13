import React, { useState, useEffect } from 'react';
import { 
  FileText, FolderHeart, Calendar, FileUp, Sparkles, Plus, 
  ArrowRight, BookOpen, Clock, CheckCircle2, TrendingUp, AlertCircle 
} from 'lucide-react';
import { DashboardMetrics, Folder, Paper, User } from '../types';

interface DashboardProps {
  user: User;
  onOpenPaper: (paperId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function Dashboard({ user, onOpenPaper, onNavigateToTab }: DashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  
  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAuthors, setUploadAuthors] = useState('');
  const [uploadJournal, setUploadJournal] = useState('');
  const [uploadYear, setUploadYear] = useState(2026);
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [uploadTextContent, setUploadTextContent] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [metRes, folRes, papRes] = await Promise.all([
        fetch('/api/metrics'),
        fetch('/api/folders'),
        fetch('/api/papers')
      ]);
      if (metRes.ok && folRes.ok && papRes.ok) {
        setMetrics(await metRes.json());
        setFolders(await folRes.json());
        setPapers(await papRes.json());
      }
    } catch (err) {
      console.error('Failed to retrieve dashboard metrics.', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadTitle(file.name.replace(/\.[^/.]+$/, "")); // Strip extension
      setUploadError('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
      setUploadError('');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      setUploadError('Please provide a document title.');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const res = await fetch('/api/papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle,
          authors: uploadAuthors || 'Anonymous Researcher',
          journal: uploadJournal || 'University Capstone Proceedings',
          year: uploadYear,
          folderId: selectedFolderId || null,
          rawContent: uploadTextContent, // If empty, server generates text automatically
          fileType: 'application/pdf',
          size: '1.5 MB',
          userId: user.id
        })
      });

      if (res.ok) {
        const newPaper = await res.json();
        setUploadSuccess(`Successfully ingested "${newPaper.title}"!`);
        // Clear form
        setUploadTitle('');
        setUploadAuthors('');
        setUploadJournal('');
        setUploadYear(2026);
        setUploadTextContent('');
        setSelectedFolderId('');
        
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        const errData = await res.json();
        setUploadError(errData.error || 'Failed to upload paper.');
      }
    } catch (err) {
      setUploadError('Network error uploading paper.');
    } finally {
      setIsUploading(false);
    }
  };

  // SVG bar chart parameters
  const maxWeeklyMinutes = metrics ? Math.max(...metrics.weeklyProgress.map(d => d.minutes), 60) : 60;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto" id="dashboard_root">
      {/* CAPSTONE ADVISORY NOTICE BANNER */}
      <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden" id="dashboard_welcome_banner">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center pointer-events-none">
          <Sparkles className="w-64 h-64 translate-x-12 translate-y-12" />
        </div>
        <div className="space-y-2 relative z-10 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            Adaptive AI Recommender
          </div>
          <h3 className="font-display font-black text-2xl">
            Welcome back, {user.name}!
          </h3>
          <p className="text-sm text-blue-100 max-w-2xl font-medium">
            Based on your role as <span className="underline font-bold">{user.role}</span>, we recommend conducting a comparative review on <strong className="text-white font-bold">RAG Formulations</strong> today. You have a study assessment due on Attention mechanisms!
          </p>
        </div>
        <button 
          onClick={() => onNavigateToTab('library')}
          className="bg-white hover:bg-slate-100 text-blue-700 font-bold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all relative z-10 shrink-0 self-start md:self-center"
          id="banner_action_btn"
        >
          Enter Library
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard_stats_grid">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 glow-card transition-all text-left">
          <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider font-semibold">Total Documents</span>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics?.totalPapers || 0}</h4>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
              <span>+100% cloud backup</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 glow-card transition-all text-left">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl flex items-center justify-center shrink-0">
            <FolderHeart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider font-semibold">Library Folders</span>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics?.totalFolders || 0}</h4>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">Segmented categories</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 glow-card transition-all text-left">
          <div className="bg-amber-50 text-amber-600 p-4 rounded-2xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider font-semibold">Quizzes Taken</span>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics?.quizzesCompleted || 0}</h4>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold">100% factual accuracy</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 glow-card transition-all text-left">
          <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider font-semibold">Study Hours</span>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{metrics?.readingHours || 0}h</h4>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">Logged efficiency rate</p>
          </div>
        </div>
      </div>

      {/* MID SECTION: CHART & INGESTION BOX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="dashboard_mid_grid">
        {/* Left Column: Custom SVG Weekly Reading Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between text-left">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="font-display font-black text-lg text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Weekly Ingestion Metrics
              </h4>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-mono font-bold uppercase tracking-wider px-2 py-1 rounded">
                Minutes Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Shows active reader focus sessions monitored inside document workspaces.</p>
          </div>

          {/* SVG Custom Graph */}
          <div className="my-6 relative flex-1 min-h-[220px]" id="svg_chart_container">
            {metrics ? (
              <svg className="w-full h-full min-h-[220px]" viewBox="0 0 500 200" preserveAspectRatio="none">
                {/* Horizontal gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = 20 + ratio * 140;
                  const labelVal = Math.round(maxWeeklyMinutes * (1 - ratio));
                  return (
                    <g key={i}>
                      <line x1="35" y1={y} x2="490" y2={y} stroke="#F1F5F9" strokeWidth="1" />
                      <text x="5" y={y + 4} fill="#94A3B8" className="text-[9px] font-mono" textAnchor="start">
                        {labelVal}m
                      </text>
                    </g>
                  );
                })}

                {/* Draw active vertical bars */}
                {metrics.weeklyProgress.map((item, idx) => {
                  const spacing = 450 / 7;
                  const x = 50 + idx * spacing + (spacing - 30) / 2;
                  const barHeight = (item.minutes / maxWeeklyMinutes) * 140;
                  const y = 160 - barHeight;

                  return (
                    <g key={idx} className="group">
                      {/* Interactive hover background overlay */}
                      <rect 
                        x={x - 4} 
                        y="20" 
                        width="38" 
                        height="145" 
                        fill="transparent" 
                        className="hover:fill-slate-50/50 cursor-pointer transition-colors"
                      />
                      
                      {/* Actual vertical colored bar */}
                      <rect
                        x={x}
                        y={y}
                        width="30"
                        height={Math.max(barHeight, 4)}
                        rx="6"
                        fill={idx === 5 ? '#3B82F6' : '#94A3B8'} // Highlight weekend/highest
                        className="transition-all duration-300 hover:fill-blue-500"
                      />
                      
                      {/* Hover label */}
                      <text
                        x={x + 15}
                        y={y - 8}
                        fill="#3B82F6"
                        className="text-[10px] font-mono font-bold text-center opacity-0 group-hover:opacity-100 transition-opacity"
                        textAnchor="middle"
                      >
                        {item.minutes}m
                      </text>

                      {/* X Axis text label */}
                      <text
                        x={x + 15}
                        y="180"
                        fill="#64748B"
                        className="text-[10px] font-semibold text-center"
                        textAnchor="middle"
                      >
                        {item.day}
                      </text>
                    </g>
                  );
                })}
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400 font-mono">
                Calculating metrics...
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-4" id="chart_summary">
            <span className="text-slate-500">Avg Session Duration: <strong>42 mins/day</strong></span>
            <button 
              onClick={() => onNavigateToTab('analytics')}
              className="text-blue-600 font-bold hover:underline flex items-center gap-1.5"
            >
              Analyze Study Patterns
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: SaaS Document Ingest Dropzone Form (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-left flex flex-col justify-between">
          <div>
            <h4 className="font-display font-black text-lg text-slate-900 flex items-center gap-2">
              <FileUp className="w-5 h-5 text-blue-600" />
              SaaS Ingestion Portal
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Drag PDFs/files or type parameters to synthesize complete mock files with real semantic text vectors.
            </p>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-4 mt-4" id="upload_portal_form">
            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {uploadError}
              </div>
            )}
            {uploadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {uploadSuccess}
              </div>
            )}

            {/* Drag and Drop Box */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-4 text-center transition-colors relative cursor-pointer ${
                dragActive ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input 
                type="file" 
                onChange={handleFileChange}
                accept=".pdf,.txt,.md"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file_input_field"
              />
              <FileUp className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-700">
                {uploadTitle ? `Selected: ${uploadTitle.substring(0, 30)}...` : 'Drag & drop research paper PDF'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">or click to browse local files</p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Document Title</label>
              <input 
                type="text" 
                value={uploadTitle}
                onChange={e => { setUploadTitle(e.target.value); setUploadError(''); }}
                placeholder="e.g. Attention Is All You Need"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                id="upload_title_field"
              />
            </div>

            {/* Optional Metadata Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Authors</label>
                <input 
                  type="text" 
                  value={uploadAuthors}
                  onChange={e => setUploadAuthors(e.target.value)}
                  placeholder="e.g. Vaswani et al."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="upload_authors_field"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Publish Year</label>
                <input 
                  type="number" 
                  value={uploadYear}
                  onChange={e => setUploadYear(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="upload_year_field"
                />
              </div>
            </div>

            {/* Folder Destination & Text Input Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Assign Folder</label>
                <select 
                  value={selectedFolderId}
                  onChange={e => setSelectedFolderId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="upload_folder_field"
                >
                  <option value="">(None - Root)</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Journal Venue</label>
                <input 
                  type="text" 
                  value={uploadJournal}
                  onChange={e => setUploadJournal(e.target.value)}
                  placeholder="e.g. NeurIPS, arXiv"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="upload_journal_field"
                />
              </div>
            </div>

            {/* Optional text area */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Optional Plain Text Copy</label>
              <textarea
                value={uploadTextContent}
                onChange={e => setUploadTextContent(e.target.value)}
                placeholder="Paste paper text here. If left empty, Gemini will auto-generate complete scholarly paper chapters for you based on the title!"
                className="w-full h-16 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                id="upload_raw_content_field"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl shadow-md transition-colors text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              id="upload_submit_btn"
            >
              {isUploading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Synthesizing & Parsing PDF Vectors...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Ingest Scholarly Paper
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* FOOTER SECTION: RECENT ACTIVITIES & PRE-SEEDED FOLDERS QUICK ENTRY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="dashboard_lower_grid">
        {/* Left Column: Recent Activities */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-left">
          <h4 className="font-display font-black text-lg text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Study Log Stream
          </h4>
          <div className="space-y-4" id="activity_feed">
            {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
              metrics.recentActivity.map((act) => (
                <div key={act.id} className="flex gap-3 text-xs pb-3 border-b border-slate-100 last:border-b-0">
                  <div className={`p-2 rounded-xl shrink-0 h-8 w-8 flex items-center justify-center ${
                    act.type === 'read' ? 'bg-blue-50 text-blue-600' :
                    act.type === 'chat' ? 'bg-purple-50 text-purple-600' :
                    act.type === 'quiz' ? 'bg-amber-50 text-amber-600' :
                    act.type === 'note' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
                  }`}>
                    {act.type === 'read' && <FileText className="w-4 h-4" />}
                    {act.type === 'chat' && <Sparkles className="w-4 h-4" />}
                    {act.type === 'quiz' && <CheckCircle2 className="w-4 h-4" />}
                    {act.type === 'note' && <BookOpen className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{act.detail}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                      <span className="font-mono text-slate-500">{act.paperTitle}</span>
                      <span>•</span>
                      <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-mono">No activities logged yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Folders grid */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-left flex flex-col justify-between">
          <div>
            <h4 className="font-display font-black text-lg text-slate-900 mb-2 flex items-center gap-2">
              <FolderHeart className="w-5 h-5 text-blue-600" />
              Categorized Directories
            </h4>
            <p className="text-xs text-slate-500 mb-4">Click to jump into specific folder structures inside your Library.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 flex-1 my-2" id="dashboard_folders_grid">
            {folders.length > 0 ? (
              folders.slice(0, 4).map(fol => {
                const count = papers.filter(p => p.folderId === fol.id).length;
                return (
                  <button
                    key={fol.id}
                    onClick={() => onNavigateToTab('library')}
                    className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50/50 text-left transition-all"
                    id={`folder_card_${fol.id}`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mb-3" 
                      style={{ backgroundColor: fol.color }}
                    />
                    <h5 className="font-bold text-slate-800 text-sm truncate">{fol.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">{count} paper{count !== 1 ? 's' : ''}</p>
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 font-mono col-span-2">No folders categorized.</p>
            )}
          </div>

          <button 
            onClick={() => onNavigateToTab('library')}
            className="w-full text-center py-2.5 text-xs text-blue-600 font-bold hover:bg-blue-50 rounded-xl border border-blue-100 transition-colors"
            id="all_folders_btn"
          >
            Manage Folders inside Library
          </button>
        </div>
      </div>
    </div>
  );
}
