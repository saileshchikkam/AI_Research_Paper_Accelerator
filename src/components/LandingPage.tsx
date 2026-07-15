import React, { useState } from 'react';
import { BookOpen, Sparkles, Brain, Award, Shield, ArrowRight, LogIn, UserPlus, Sun, Moon } from 'lucide-react';
import { User } from '../types';
import { useTheme } from '../ThemeContext';

interface LandingPageProps {
  onLoginSuccess: (user: User) => void;
}

export default function LandingPage({ onLoginSuccess }: LandingPageProps) {
  const { theme, toggleTheme } = useTheme();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'professor' | 'researcher' | 'engineer'>('student');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick seed logins
  const seedAccounts = [
    { name: 'Aarav (Student)', email: 'aarav@university.edu', role: 'Student' },
    { name: 'Dr. Meera (Professor)', email: 'meera.iyer@university.edu', role: 'Professor' },
    { name: 'Rahul (ML Engineer)', email: 'rahul.ml@tech.co', role: 'Researcher' }
  ];

  const handleSeedLogin = async (seedEmail: string) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: seedEmail, password: 'password' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem('researchmind_token', data.token);
        }
        onLoginSuccess(data.user);
      } else {
        setError(data.message || data.error || 'Login failed');
      }
    } catch (err) {
      setError('Could not connect to full-stack server.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first to reset your password.');
      return;
    }
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(data.message || `A password reset link has been successfully sent to ${email}`);
      } else {
        setError(data.message || 'Could not send password reset email.');
      }
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError('Could not connect to full-stack server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isLoginTab) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          if (data.token) {
            localStorage.setItem('researchmind_token', data.token);
          }
          onLoginSuccess(data.user);
        } else {
          setError(data.message || data.error || 'Invalid credentials.');
        }
      } else {
        if (!name || !email || !password) {
          setError('Name, email, and password are required');
          setLoading(false);
          return;
        }
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          if (data.token) {
            localStorage.setItem('researchmind_token', data.token);
          }
          setSuccessMessage('Account created successfully!');
          onLoginSuccess(data.user);
        } else {
          setError(data.message || data.error || 'Registration failed.');
        }
      }
    } catch (err: any) {
      console.error("Auth error caught:", err);
      setError('Could not establish server database connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col justify-between transition-colors duration-300" id="landing_page_root">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between" id="landing_header">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-md shadow-blue-200 flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h1 className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white">ResearchMind AI</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase">Research Paper Accelerator</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-xs font-medium text-blue-700 dark:text-blue-300">
            <Sparkles className="w-3.5 h-3.5" />
            Empowered by Gemini 2.5
          </span>
          <button 
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-slate-800 rounded-xl transition-all shrink-0 cursor-pointer border border-slate-200 dark:border-slate-800" 
            id="theme_toggle_landing" 
            title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500 animate-pulse" />}
          </button>
        </div>
      </header>

      {/* Hero Body Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" id="landing_main">
        {/* Left column: Brand messaging */}
        <div className="lg:col-span-7 space-y-8 text-left animate-fade-in" id="landing_marketing_pane">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 shadow-sm">
            <Award className="w-4.5 h-4.5 text-amber-500 shrink-0" />
            Final Year B.Tech CSE (AI & ML) Capstone Project
          </div>
          
          <h2 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-950 dark:text-white tracking-tight leading-tight">
            Read research papers <span className="text-blue-600 dark:text-blue-400 relative inline-block">10x faster</span> with AI.
          </h2>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-normal">
            ResearchMind AI operates like <strong className="text-slate-900 dark:text-slate-100 font-bold">NotebookLM for researchers</strong>. 
            Upload papers, build automatic study matrices, test yourself with auto-generated quizzes, 
            and interact through a highly context-grounded AI Chat powered by server-side Gemini RAG.
          </p>

          {/* SaaS Core Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4" id="landing_features_grid">
            <div className="flex gap-4">
              <div className="bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 p-2.5 h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-blue-200 dark:border-blue-900/50">
                <Sparkles className="w-5.5 h-5.5" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">Retrieval-Augmented RAG</h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-normal">Responses are strictly grounded in paper contents, cited with source pages.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-2.5 h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-emerald-200 dark:border-emerald-900/50">
                <Brain className="w-5.5 h-5.5" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">Interactive Mind Mapping</h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-normal">Extract complex methodologies and conceptual connections instantly.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 p-2.5 h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-amber-200 dark:border-amber-900/50">
                <BookOpen className="w-5.5 h-5.5" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">Assessed Quizzes & Cards</h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-normal">Study smarter with dynamic spaced-repetition flashcards and assessors.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 p-2.5 h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-purple-200 dark:border-purple-900/50">
                <Shield className="w-5.5 h-5.5" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">Literature Review Studio</h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-normal">Compare multiple papers dynamically and extract synthesis grids.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Login / Register card & Quick seed buttons */}
        <div className="lg:col-span-5 w-full flex flex-col gap-6" id="landing_form_pane">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-300">
            {/* Tab selection */}
            <div className="flex border-b border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => { setIsLoginTab(true); setError(''); }}
                className={`flex-1 py-4.5 text-center font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${isLoginTab ? 'text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/10 border-b-2 border-blue-600 dark:border-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                id="tab_login"
              >
                <LogIn className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                Account Login
              </button>
              <button 
                onClick={() => { setIsLoginTab(false); setError(''); }}
                className={`flex-1 py-4.5 text-center font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${!isLoginTab ? 'text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/10 border-b-2 border-blue-600 dark:border-blue-400 font-extrabold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                id="tab_register"
              >
                <UserPlus className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                Create Account
              </button>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 rounded-xl text-xs sm:text-sm font-medium">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs sm:text-sm font-medium">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLoginTab && (
                  <>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-350 mb-1.5">Full Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Rahul Patel"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        id="reg_name_input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-350 mb-1.5">Your Role / Field</label>
                      <select 
                        value={role}
                        onChange={e => setRole(e.target.value as any)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-sm sm:text-base text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                        id="reg_role_select"
                      >
                        <option value="student">Undergraduate / PG Student</option>
                        <option value="professor">Research Professor</option>
                        <option value="researcher">PhD Scholar / Scientist</option>
                        <option value="engineer">Machine Learning Engineer</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-350 mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                    id="email_input"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-350">Password</label>
                    {isLoginTab && (
                      <button 
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline focus:outline-none font-semibold cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                    id="password_input"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-3 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  id="submit_auth_btn"
                >
                  {loading ? 'Authenticating...' : isLoginTab ? 'Log In to Dashboard' : 'Generate Free License'}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </form>

              {/* Instant 1-Click login seeds */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800" id="instant_login_container">
                <h4 className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3.5">
                  Instant Evaluator 1-Click Logins:
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {seedAccounts.map((acc, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSeedLogin(acc.email)}
                      disabled={loading}
                      className="w-full px-4.5 py-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-slate-800 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 text-left rounded-xl text-xs sm:text-sm font-medium border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800/80 transition-all flex items-center justify-between cursor-pointer"
                      id={`seed_login_btn_${idx}`}
                    >
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{acc.name}</span>
                        <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">{acc.email}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded bg-white dark:bg-slate-900 text-[10px] font-mono border border-slate-200 dark:border-slate-750 text-slate-500 dark:text-slate-400">
                        {acc.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 px-4" id="landing_footer_credits">
            By signing in, you acquire access to a simulated CAPSTONE workspace connected directly with Google Gemini 2.5 API server-side logic.
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 px-6 text-center text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-mono" id="landing_copyright_footer">
        © 2026 ResearchMind AI. Developed under capstone CSE program rules. All content indexes strictly sandboxed.
      </footer>
    </div>
  );
}
