import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Building2, ArrowRight, ShieldCheck, Users, Calendar, UserPlus } from 'lucide-react';
import { validatePassword } from '../utils/helpers';

function PuzzleGraphic() {
  return (
    <div className="mt-12 flex justify-center items-center w-full relative">
      <svg width="420" height="180" viewBox="-90 -10 260 140" className="overflow-visible drop-shadow-2xl">
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.1" />
        </filter>
        <filter id="shadow-hover" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="8" stdDeviation="5" floodOpacity="0.2" />
        </filter>

        {/* Piece C (Right, connected to Center) */}
        <g transform="translate(60, 10)" filter="url(#shadow)">
          <path d="M 20 20 L 40 20 A 10 10 0 1 0 60 20 L 80 20 L 80 80 L 60 80 A 10 10 0 1 0 40 80 L 20 80 L 20 60 A 12 12 0 1 1 20 40 Z" 
                fill='var(--theme-cream)' stroke="#e2e8f0" strokeWidth="2" />
        </g>

        {/* Piece B (Center) */}
        <g transform="translate(0, 10)" filter="url(#shadow)">
          <path d="M 20 20 L 40 20 A 10 10 0 1 1 60 20 L 80 20 L 80 40 A 12 12 0 1 0 80 60 L 80 80 L 60 80 A 10 10 0 1 1 40 80 L 20 80 L 20 60 A 12 12 0 1 1 20 40 Z" 
                fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
        </g>

        {/* Piece A (Left, coming in) - The "Right Fit" */}
        <g transform="translate(-70, 10)" filter="url(#shadow-hover)" className="text-primary animate-[pulse_3s_ease-in-out_infinite]">
          <path d="M 20 20 L 40 20 A 10 10 0 1 0 60 20 L 80 20 L 80 40 A 12 12 0 1 0 80 60 L 80 80 L 60 80 A 10 10 0 1 0 40 80 L 20 80 Z" 
                fill="currentColor" stroke="currentColor" strokeWidth="2" />
          <text x="50" y="44" fontSize="11" fontWeight="800" fill="white" textAnchor="middle" letterSpacing="0.5">Right</text>
          <text x="50" y="58" fontSize="11" fontWeight="800" fill="white" textAnchor="middle" letterSpacing="0.5">Fit</text>
        </g>
        
        {/* Movement Indicator / Dashed line connecting them */}
        <path d="M -10 50 L 0 50" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="3 3" />
      </svg>
    </div>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[#fdfbf9] relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute bottom-0 right-0 w-[80%] h-[80%] rounded-tl-full bg-orange-50 blur-[120px] pointer-events-none"></div>

        {/* Top left Logo */}
        <div className="flex items-center gap-3 z-10">
          <img src="/esparkbiz-logo.png" alt="eSparkBiz Logo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <span className="text-base font-bold text-[var(--theme-aubergine)] tracking-tight">eSparkBiz</span>
            <span className="text-[var(--theme-aubergine)] font-bold text-xl tracking-tight leading-none">ATS</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-start text-left z-10 max-w-md w-full mx-auto mt-16 mb-auto pr-8">
          <div className="inline-flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-wider mb-6 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
            <span className="text-primary/70">#</span> INTERNAL HIRING, STREAMLINED
          </div>
          
          <h2 className="text-4xl font-extrabold text-slate-900 leading-[1.15] mb-4 tracking-tight">
            Run internal hiring<br />with clarity.
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-10 max-w-sm">
            A role-based applicant tracking system for openings, candidates, interviews, approvals, and onboarding handoff.
          </p>

          <div className="flex flex-col gap-4 w-full max-w-sm">
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-[var(--theme-cream)]/60 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-primary">
                  <Users size={16} />
                </div>
                <span className="text-sm font-bold text-slate-700">Openings & candidates</span>
              </div>
              <span className="text-[10px] text-[var(--theme-taupe)] font-medium">One shared pipeline</span>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-[var(--theme-cream)]/60 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-primary">
                  <Calendar size={16} />
                </div>
                <span className="text-sm font-bold text-slate-700">Interviews & approvals</span>
              </div>
              <span className="text-[10px] text-[var(--theme-taupe)] font-medium">Nothing slips</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-[var(--theme-cream)]/60 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-primary">
                  <UserPlus size={16} />
                </div>
                <span className="text-sm font-bold text-slate-700">Onboarding handoff</span>
              </div>
              <span className="text-[10px] text-[var(--theme-taupe)] font-medium">HR to IT in a click</span>
            </div>
          </div>
        </div>
        
        {/* Bottom footer */}
        <div className="flex items-center gap-4 z-10 text-[var(--theme-taupe)] text-xs">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck size={14} className="text-primary" />
            <span>Secure · Role-based access · Real-time</span>
          </div>
          <span>© 2026 ATS. All rights reserved.</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 lg:justify-start lg:pl-16">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img src="/esparkbiz-logo.png" alt="eSparkBiz Logo" className="w-8 h-8 object-contain" />
            <span className="text-[var(--theme-aubergine)] font-bold text-lg">ATS</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [view, setView] = useState('login');
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [createForm, setCreateForm] = useState({ password: '', confirm: '' });
  const [createErrors, setCreateErrors] = useState([]);

  async function handleLogin(e) {
    e.preventDefault();
    if (!form.username) return setError('Username is required.');
    if (!form.password) return setError('Password is required.');
    const result = await login(form.username, form.password);
    if (result.error) return setError(result.error);
    navigate('/dashboard');
  }

  function handleForgot(e) {
    e.preventDefault();
    if (!forgotUsername) return;
    setForgotMsg(`A password reset link has been sent to the email associated with "${forgotUsername}".`);
  }

  function handleCreatePassword(e) {
    e.preventDefault();
    const errs = validatePassword(createForm.password);
    if (errs.length) return setCreateErrors(errs);
    if (createForm.password !== createForm.confirm) return setCreateErrors(['Passwords do not match.']);
    setCreateErrors([]);
    setView('login');
  }

  const pwdRules = [
    'Minimum 8 characters',
    'At least one uppercase letter',
    'At least one lowercase letter',
    'At least one number',
    'At least one special character',
  ];

  if (view === 'forgot') return (
    <Shell>
      <div className="bg-[var(--theme-cream)] p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-[var(--theme-aubergine)] mb-1">Forgot Password</h2>
        <p className="text-slate-500 text-sm mb-7">Enter your username to receive a reset link.</p>
        {forgotMsg ? (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <p className="text-emerald-700 text-sm">{forgotMsg}</p>
            </div>
            <button className="btn-primary btn w-full" onClick={() => { setView('create'); setForgotMsg(''); }}>
              Create New Password <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Username</label>
              <input className="input bg-[var(--theme-cream)] border-slate-300 text-[var(--theme-aubergine)] placeholder-slate-400 focus:border-primary shadow-sm" value={forgotUsername} onChange={e => setForgotUsername(e.target.value)} placeholder="Enter your username" />
            </div>
            <button className="btn-primary btn w-full shadow-sm" type="submit">Send Reset Link</button>
          </form>
        )}
        <button className="text-sm font-medium text-slate-500 hover:text-primary mt-5 block w-full text-center transition-colors" onClick={() => setView('login')}>← Back to Login</button>
      </div>
    </Shell>
  );

  if (view === 'create') return (
    <Shell>
      <div className="bg-[var(--theme-cream)] p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-[var(--theme-aubergine)] mb-1">Create Password</h2>
        <p className="text-slate-500 text-sm mb-7">Set a new secure password for your account.</p>
        <form onSubmit={handleCreatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">New Password</label>
            <input type="password" className="input bg-[var(--theme-cream)] border-slate-300 text-[var(--theme-aubergine)] placeholder-slate-400 focus:border-primary shadow-sm" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Confirm Password</label>
            <input type="password" className="input bg-[var(--theme-cream)] border-slate-300 text-[var(--theme-aubergine)] placeholder-slate-400 focus:border-primary shadow-sm" value={createForm.confirm} onChange={e => setCreateForm(f => ({ ...f, confirm: e.target.value }))} />
          </div>
          {createErrors.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3">
              {createErrors.map((e, i) => <p key={i} className="text-red-600 text-xs">• {e}</p>)}
            </div>
          )}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-bold text-slate-700 mb-2">Requirements</p>
            {pwdRules.map(r => <p key={r} className="text-[11px] text-slate-500 mb-0.5">· {r}</p>)}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-ghost btn flex-1 text-slate-600 border border-slate-300 hover:bg-slate-50 shadow-sm" onClick={() => setView('login')}>Cancel</button>
            <button type="submit" className="btn-primary btn flex-1 shadow-sm">Save</button>
          </div>
        </form>
      </div>
    </Shell>
  );

  return (
    <Shell>
      <div className="bg-[var(--theme-cream)] p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-[var(--theme-aubergine)] mb-1">Welcome back</h2>
        <p className="text-slate-500 text-sm mb-7">Sign in to your ATS account.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Username</label>
            <input
              className={`input bg-[var(--theme-cream)] border text-[var(--theme-aubergine)] placeholder-slate-400 focus:border-primary shadow-sm ${error.includes('Username') ? 'border-red-400' : 'border-slate-300'}`}
              value={form.username}
              onChange={e => { setForm(f => ({ ...f, username: e.target.value })); setError(''); }}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Password</label>
            </div>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                className={`input bg-[var(--theme-cream)] border text-[var(--theme-aubergine)] placeholder-slate-400 focus:border-primary shadow-sm pr-10 ${error.includes('Password') || error.includes('credentials') ? 'border-red-400' : 'border-slate-300'}`}
                value={form.password}
                onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError(''); }}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--theme-taupe)] hover:text-slate-600 transition-colors">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
              <input type="checkbox" className="rounded bg-slate-50 border-slate-300 text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer" />
              Remember me
            </label>
            <button type="button" onClick={() => setView('forgot')} className="text-xs font-semibold text-primary hover:text-primary-focus transition-colors">
              Forgot password?
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 animate-pulse">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <button type="submit" className="btn-primary btn w-full py-2.5 mt-2 shadow-sm font-semibold">
            Sign In <ArrowRight size={15} />
          </button>
        </form>
      </div>

      {/* Demo credentials */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center mb-4 uppercase tracking-wider font-bold">Demo Credentials</p>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { role: 'Head HR', user: 'headhr', pass: 'password123' },
            { role: 'HR (Maya)', user: 'hrdemo', pass: 'password123' },
            { role: 'HR (Priya)', user: 'hr2demo', pass: 'password123' },
            { role: 'HR (Rahul)', user: 'hr3demo', pass: 'password123' },
            { role: 'Interviewer', user: 'interviewer', pass: 'password123' },
            { role: 'Receptionist', user: 'reception', pass: 'password123' },
            { role: 'IT', user: 'itdemo', pass: 'password123' },
          ].map(c => (
            <button
              key={c.role}
              type="button"
              onClick={() => { setForm({ username: c.user, password: c.pass }); setError(''); }}
              className={`bg-[var(--theme-cream)] hover:bg-slate-50 border rounded-xl p-3 text-left transition-all shadow-sm hover:shadow group ${
                form.username === c.user ? 'border-primary ring-1 ring-primary/30' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">{c.role}</p>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">{c.user}</p>
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}
