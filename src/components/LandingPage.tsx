import React, { useState } from 'react';
import { BookOpen, Sparkles, Brain, Award, Shield, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { User } from '../types';

interface LandingPageProps {
  onLoginSuccess: (user: User) => void;
}

export default function LandingPage({ onLoginSuccess }: LandingPageProps) {
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between" id="landing_page_root">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between" id="landing_header">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-md shadow-blue-200 flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight text-slate-900">ResearchMind AI</h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Research Paper Accelerator</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-xs font-medium text-blue-700">
            <Sparkles className="w-3.5 h-3.5" />
            Empowered by Gemini 2.5
          </span>
        </div>
      </header>

      {/* Hero Body Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" id="landing_main">
        {/* Left column: Brand messaging */}
        <div className="lg:col-span-7 space-y-8 text-left" id="landing_marketing_pane">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
            <Award className="w-4 h-4 text-amber-500" />
            Final Year B.Tech CSE (AI & ML) Capstone Project
          </div>
          
          <h2 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-950 tracking-tight leading-none">
            Read research papers <span className="text-blue-600 relative inline-block">10x faster</span> with AI.
          </h2>

          <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
            ResearchMind AI operates like <strong className="text-slate-800">NotebookLM for researchers</strong>. 
            Upload papers, build automatic study matrices, test yourself with auto-generated quizzes, 
            and interact through a highly context-grounded AI Chat powered by server-side Gemini RAG.
          </p>

          {/* SaaS Core Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4" id="landing_features_grid">
            <div className="flex gap-3">
              <div className="bg-blue-100 text-blue-600 p-2 h-10 w-10 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Retrieval-Augmented RAG</h4>
                <p className="text-xs text-slate-500 mt-0.5">Responses are strictly grounded in paper contents, cited with source pages.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-emerald-100 text-emerald-600 p-2 h-10 w-10 rounded-xl flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Interactive Mind Mapping</h4>
                <p className="text-xs text-slate-500 mt-0.5">Extract complex methodologies and conceptual connections instantly.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-amber-100 text-amber-600 p-2 h-10 w-10 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Assessed Quizzes & Cards</h4>
                <p className="text-xs text-slate-500 mt-0.5">Study smarter with dynamic spaced-repetition flashcards and assessors.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-purple-100 text-purple-600 p-2 h-10 w-10 rounded-xl flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Literature Review Studio</h4>
                <p className="text-xs text-slate-500 mt-0.5">Compare multiple papers dynamically and extract synthesis grids.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Login / Register card & Quick seed buttons */}
        <div className="lg:col-span-5 w-full flex flex-col gap-6" id="landing_form_pane">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Tab selection */}
            <div className="flex border-b border-slate-100">
              <button 
                onClick={() => { setIsLoginTab(true); setError(''); }}
                className={`flex-1 py-4 text-center font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${isLoginTab ? 'text-blue-600 bg-blue-50/30 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                id="tab_login"
              >
                <LogIn className="w-4 h-4" />
                Account Login
              </button>
              <button 
                onClick={() => { setIsLoginTab(false); setError(''); }}
                className={`flex-1 py-4 text-center font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${!isLoginTab ? 'text-blue-600 bg-blue-50/30 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                id="tab_register"
              >
                <UserPlus className="w-4 h-4" />
                Create Account
              </button>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-medium">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLoginTab && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Rahul Patel"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="reg_name_input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Your Role / Field</label>
                      <select 
                        value={role}
                        onChange={e => setRole(e.target.value as any)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    id="email_input"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-600">Password</label>
                    {isLoginTab && (
                      <button 
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[11px] text-blue-600 hover:underline focus:outline-none font-medium"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    id="password_input"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  id="submit_auth_btn"
                >
                  {loading ? 'Authenticating...' : isLoginTab ? 'Log In to Dashboard' : 'Generate Free License'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Instant 1-Click login seeds */}
              <div className="mt-8 pt-6 border-t border-slate-100" id="instant_login_container">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Instant Evaluator 1-Click Logins:
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {seedAccounts.map((acc, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSeedLogin(acc.email)}
                      disabled={loading}
                      className="w-full px-4 py-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-left rounded-xl text-xs font-medium border border-slate-200 hover:border-blue-200 transition-all flex items-center justify-between"
                      id={`seed_login_btn_${idx}`}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{acc.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">{acc.email}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-white text-[9px] font-mono border text-slate-500">
                        {acc.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 px-4" id="landing_footer_credits">
            By signing in, you acquire access to a simulated CAPSTONE workspace connected directly with Google Gemini 2.5 API server-side logic.
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="border-t border-slate-200 bg-white py-6 px-6 text-center text-xs text-slate-400 font-mono" id="landing_copyright_footer">
        © 2026 ResearchMind AI. Developed under capstone CSE program rules. All content indexes strictly sandboxed.
      </footer>
    </div>
  );
}
