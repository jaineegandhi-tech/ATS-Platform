import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStore, markRecruitmentNotificationRead, STORAGE_KEYS } from '../../utils/store';
import { useStorageSync } from '../../utils/useStorageSync';
import { ROLE_LABELS } from '../../utils/roles';
import Avatar from '../shared/Avatar';
import ConfirmDialog from '../shared/ConfirmDialog';
import { Bell, ChevronDown, LogOut, Search, User, Users, Briefcase, CalendarDays, X } from 'lucide-react';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  useStorageSync();

  const recentLogs = getStore(STORAGE_KEYS.ACTIVITY_LOGS).slice(0, 5);
  const recruitmentNotifs = getStore(STORAGE_KEYS.RECRUITMENT_NOTIFICATIONS)
    .filter(n => n.toUserId === user?.id && !n.read)
    .slice(0, 10);
  const latestNotifId = recruitmentNotifs[0]?.id;
  const notifCount = recruitmentNotifs.length;

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  // Global search
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  const candidates = getStore(STORAGE_KEYS.CANDIDATES);
  const openings = getStore(STORAGE_KEYS.JOB_OPENINGS);
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

  return (
    <>
      <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-20">
        {/* Global Search */}
        <div className="relative w-64" ref={searchRef}>
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            placeholder="Search candidates, jobs…"
            className="w-full h-8 pl-8 pr-8 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
          />
          {query && (
            <button onClick={() => { setQuery(''); setShowSearch(false); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={11} />
            </button>
          )}
          {showSearch && query.trim().length >= 2 && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowSearch(false)} />
              <div className="absolute left-0 top-full mt-1.5 w-80 bg-white rounded-xl shadow-modal border border-gray-100 z-40 overflow-hidden">
                {searchResults.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No results for &ldquo;{query}&rdquo;</p>
                ) : (
                  <div className="py-1">
                    {searchResults.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => { navigate(r.path); setShowSearch(false); setQuery(''); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-6 h-6 rounded-md bg-primary-light flex items-center justify-center flex-shrink-0">
                          <r.icon size={11} className="text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-800 truncate">{r.label}</p>
                          {r.sub && <p className="text-[10px] text-gray-400 truncate">{r.sub}</p>}
                        </div>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{r.type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(v => !v)}
              className="relative flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Bell size={15} className="text-gray-400" />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums">
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowNotifs(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-modal border border-gray-100 z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">Notifications</p>
                    {notifCount > 0 && (
                      <span className="text-xs bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                        {notifCount} new
                      </span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {recruitmentNotifs.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-4 pt-3 pb-1">Recruitment</p>
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
                              className={`w-full text-left px-4 py-2.5 transition-colors border-b border-gray-50 last:border-0 ${isNewest ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                            >
                              <div className="flex items-center gap-2">
                                <p className={`text-sm ${isNewest ? 'text-blue-800 font-semibold' : 'text-gray-700'}`}>{n.message}</p>
                                {isNewest && <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5">NEW</span>}
                              </div>
                              <p className="text-xs text-gray-400">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {recentLogs.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide px-4 pt-3 pb-1">Recent Activity</p>
                        {recentLogs.map(log => (
                          <div key={log.id} className="px-4 py-2.5 border-b border-gray-50 last:border-0">
                            <p className="text-sm text-gray-700">{log.action}</p>
                            <p className="text-xs text-gray-400">{log.details} · {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {recruitmentNotifs.length === 0 && recentLogs.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-8">No activity yet.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="w-px h-4 bg-gray-100 mx-1" />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(v => !v)}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-gray-700 leading-tight">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-gray-400 leading-tight">{ROLE_LABELS[user?.role] || user?.role}</p>
              </div>
              <ChevronDown size={11} className="text-gray-300" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-modal border border-gray-100 py-1.5 z-40">
                  <div className="px-4 py-2.5 border-b border-gray-50 mb-1">
                    <p className="text-xs font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[11px] text-gray-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setShowMenu(false); navigate('/dashboard'); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User size={13} className="text-gray-400" /> Dashboard
                  </button>
                  <div className="border-t border-gray-50 mt-1 pt-1">
                    <button
                      onClick={() => { setShowMenu(false); setShowLogout(true); }}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
