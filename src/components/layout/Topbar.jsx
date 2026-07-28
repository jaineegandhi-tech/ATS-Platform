import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStore, markRecruitmentNotificationRead, STORAGE_KEYS } from '../../utils/store';
import { useStorageSync } from '../../utils/useStorageSync';
import { ROLE_LABELS } from '../../utils/roles';
import Avatar from '../shared/Avatar';
import ConfirmDialog from '../shared/ConfirmDialog';
import { Bell, ChevronDown, LogOut, Search, User, Users, Briefcase, CalendarDays, X, Moon, Sun } from 'lucide-react';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu]     = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  function toggleTheme() {
    setIsDark(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  }
  useStorageSync();

  const recentLogs = getStore(STORAGE_KEYS.ACTIVITY_LOGS).slice(0, 5);
  const recruitmentNotifs = getStore(STORAGE_KEYS.RECRUITMENT_NOTIFICATIONS)
    .filter(n => n.toUserId === user?.id && !n.read)
    .slice(0, 10);
  const latestNotifId = recruitmentNotifs[0]?.id;
  const notifCount    = recruitmentNotifs.length;

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const [query, setQuery]           = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  const candidates = getStore(STORAGE_KEYS.CANDIDATES);
  const openings   = getStore(STORAGE_KEYS.JOB_OPENINGS);
  const interviews = getStore(STORAGE_KEYS.INTERVIEWS);

  const searchResults = query.trim().length < 2 ? [] : [
    ...candidates
      .filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map(c => ({ type: 'Candidate', label: `${c.firstName} ${c.lastName}`, sub: c.appliedPosition || '', path: `/candidates/${c.id}`, icon: Users })),
    ...openings
      .filter(o => o.title?.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 2)
      .map(o => ({ type: 'Job', label: o.title, sub: o.department || '', path: '/job-openings', icon: Briefcase })),
    ...interviews
      .filter(i => i.round?.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 2)
      .map(i => ({ type: 'Interview', label: i.round, sub: i.date || '', path: '/interview-schedule', icon: CalendarDays })),
  ];

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') { setShowSearch(false); setQuery(''); } }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /* ── shared inline styles ── */
  const dropdownStyle = {
    backgroundColor: 'var(--theme-cream)',
    border: '1px solid var(--theme-linen)',
    borderRadius: '12px',
    boxShadow: '0 20px 60px -10px rgba(60,42,33,0.20)',
  };

  return (
    <>
      <header
        className="h-14 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-20"
        style={{ backgroundColor: 'var(--theme-parchment)', borderBottom: '1px solid var(--theme-linen)' }}
      >
        {/* Global Search */}
        <div className="relative w-64" ref={searchRef}>
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--theme-taupe)' }} />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            placeholder="Search candidates, jobs…"
            style={{
              width: '100%', height: '32px',
              paddingLeft: '32px', paddingRight: '32px',
              backgroundColor: 'var(--theme-sidebar-bg)',
              border: '1px solid var(--theme-linen)',
              borderRadius: '9999px',
              fontSize: '12px',
              color: 'var(--theme-aubergine)',
              outline: 'none',
              transition: 'border-color 150ms, box-shadow 150ms',
            }}
            onFocus={e => {
              setShowSearch(true);
              e.target.style.borderColor = 'var(--theme-mustard)';
              e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,0.12)';
              e.target.style.backgroundColor = 'var(--theme-cream)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--theme-linen)';
              e.target.style.boxShadow = 'none';
              e.target.style.backgroundColor = 'var(--theme-sidebar-bg)';
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setShowSearch(false); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--theme-taupe)' }}
            >
              <X size={11} />
            </button>
          )}
          {showSearch && query.trim().length >= 2 && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowSearch(false)} />
              <div className="absolute left-0 top-full mt-1.5 w-80 z-40 overflow-hidden" style={dropdownStyle}>
                {searchResults.length === 0 ? (
                  <p className="text-xs text-center py-6" style={{ color: 'var(--theme-taupe)' }}>
                    No results for "{query}"
                  </p>
                ) : (
                  <div className="py-1">
                    {searchResults.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => { navigate(r.path); setShowSearch(false); setQuery(''); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                        style={{ color: 'var(--theme-aubergine)' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--theme-sidebar-hover)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: 'var(--theme-parchment)', borderRadius: '6px' }}>
                          <r.icon size={11} style={{ color: 'var(--theme-mustard)' }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate" style={{ color: 'var(--theme-aubergine)' }}>{r.label}</p>
                          {r.sub && <p className="text-[10px] truncate" style={{ color: 'var(--theme-taupe)' }}>{r.sub}</p>}
                        </div>
                        <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--theme-taupe)' }}>{r.type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-8 h-8 transition-colors mr-1"
            style={{ borderRadius: '8px' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--theme-sidebar-hover)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {isDark ? <Sun size={15} style={{ color: 'var(--theme-taupe)' }} /> : <Moon size={15} style={{ color: 'var(--theme-taupe)' }} />}
          </button>

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(v => !v)}
              className="relative flex items-center justify-center w-8 h-8 transition-colors"
              style={{ borderRadius: '8px' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--theme-sidebar-hover)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Bell size={15} style={{ color: 'var(--theme-taupe)' }} />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums"
                  style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowNotifs(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 z-40 overflow-hidden" style={dropdownStyle}>
                  <div className="px-4 py-3 flex items-center justify-between"
                    style={{ borderBottom: '1px solid var(--theme-linen)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--theme-aubergine)', fontFamily: "'Playfair Display', serif" }}>
                      Notifications
                    </p>
                    {notifCount > 0 && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#fef3c7', color: 'var(--theme-claret)' }}>
                        {notifCount} new
                      </span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {recruitmentNotifs.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide px-4 pt-3 pb-1"
                          style={{ color: 'var(--theme-taupe)' }}>Recruitment</p>
                        {recruitmentNotifs.map(n => {
                          const isNewest = n.id === latestNotifId;
                          return (
                            <button
                              key={n.id}
                              onClick={() => {
                                markRecruitmentNotificationRead(n.id);
                                setShowNotifs(false);
                                if (n.type === 'candidate_reassigned' && n.relatedId) navigate(`/candidates/${n.relatedId}`);
                                else navigate('/approvals');
                              }}
                              className="w-full text-left px-4 py-2.5 transition-colors last:border-0"
                              style={{
                                borderBottom: '1px solid var(--theme-linen)',
                                backgroundColor: isNewest ? '#fef3c7' : 'transparent',
                              }}
                              onMouseEnter={e => { if (!isNewest) e.currentTarget.style.backgroundColor = 'var(--theme-sidebar-hover)'; }}
                              onMouseLeave={e => { e.currentTarget.style.backgroundColor = isNewest ? '#fef3c7' : 'transparent'; }}
                            >
                              <p className="text-sm" style={{ color: isNewest ? 'var(--theme-claret)' : 'var(--theme-aubergine)', fontWeight: isNewest ? 600 : 400 }}>
                                {n.message}
                              </p>
                              <p className="text-xs mt-0.5" style={{ color: 'var(--theme-taupe)' }}>
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {recentLogs.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide px-4 pt-3 pb-1"
                          style={{ color: 'var(--theme-taupe)' }}>Recent Activity</p>
                        {recentLogs.map(log => (
                          <div key={log.id} className="px-4 py-2.5"
                            style={{ borderBottom: '1px solid var(--theme-sidebar-bg)' }}>
                            <p className="text-sm" style={{ color: 'var(--theme-aubergine)' }}>{log.action}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--theme-taupe)' }}>
                              {log.details} · {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    {recruitmentNotifs.length === 0 && recentLogs.length === 0 && (
                      <p className="text-sm text-center py-8" style={{ color: 'var(--theme-taupe)' }}>No activity yet.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-4 mx-1" style={{ backgroundColor: 'var(--theme-linen)' }} />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(v => !v)}
              className="flex items-center gap-2 px-2 py-1.5 transition-colors"
              style={{ borderRadius: '9999px' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--theme-sidebar-hover)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
                style={{ backgroundColor: 'var(--theme-mustard)', color: '#ffffff' }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium leading-tight" style={{ color: 'var(--theme-aubergine)' }}>
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] leading-tight" style={{ color: 'var(--theme-taupe)' }}>
                  {ROLE_LABELS[user?.role] || user?.role}
                </p>
              </div>
              <ChevronDown size={11} style={{ color: 'var(--theme-taupe)' }} />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-48 py-1.5 z-40" style={dropdownStyle}>
                  <div className="px-4 py-2.5 mb-1" style={{ borderBottom: '1px solid var(--theme-linen)' }}>
                    <p className="text-xs font-semibold" style={{ color: 'var(--theme-aubergine)' }}>
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--theme-taupe)' }}>{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setShowMenu(false); navigate('/dashboard'); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-sm transition-colors"
                    style={{ color: 'var(--theme-aubergine)' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--theme-sidebar-hover)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <User size={13} style={{ color: 'var(--theme-taupe)' }} /> Dashboard
                  </button>
                  <div className="mt-1 pt-1" style={{ borderTop: '1px solid var(--theme-linen)' }}>
                    <button
                      onClick={() => { setShowMenu(false); setShowLogout(true); }}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm transition-colors"
                      style={{ color: '#dc2626' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={13} /> Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {showLogout && (
        <ConfirmDialog
          title="Confirm Logout"
          message="Are you sure you want to logout from ATS?"
          confirmLabel="Logout"
          confirmClass="btn-danger"
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </>
  );
}
