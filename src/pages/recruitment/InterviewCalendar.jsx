import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStore, STORAGE_KEYS } from '../../utils/store';
import { useStorageSync } from '../../utils/useStorageSync';
import { isRecruiter } from '../../utils/roles';
import Modal from '../../components/shared/Modal';
import StatusBadge from '../../components/shared/StatusBadge';
import { ChevronLeft, ChevronRight, CalendarDays, User, Clock, MapPin, Video, Star, ExternalLink } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const DAYS_SHORT  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_FULL   = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS      = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const HOUR_SLOTS  = Array.from({ length: 13 }, (_, i) => i + 7); // 7 AM – 7 PM

/* ── colour scheme per status ── */
function eventStyle(ivStatus, candStatus) {
  const s = candStatus?.toLowerCase();
  if (ivStatus === 'cancelled')       return { bar: '#a8a29e', chip: { bg: 'var(--theme-sidebar-bg)', border: 'var(--theme-linen)', color: 'var(--theme-taupe)' } };
  if (s === 'passed' || s === 'selected') return { bar: '#16a34a', chip: { bg: '#dcfce7', border: '#bbf7d0', color: '#15803d' } };
  if (s === 'failed' || s === 'rejected') return { bar: '#dc2626', chip: { bg: '#fee2e2', border: '#fecaca', color: '#b91c1c' } };
  if (s === 'next round scheduled')   return { bar: 'var(--theme-mustard)', chip: { bg: '#fef3c7', border: '#fde68a', color: 'var(--theme-claret)' } };
  if (ivStatus === 'completed')       return { bar: 'var(--theme-taupe)', chip: { bg: 'var(--theme-sidebar-bg)', border: 'var(--theme-linen)', color: 'var(--theme-taupe)' } };
  // default — scheduled
  return                                     { bar: 'var(--theme-mustard)', chip: { bg: '#fef3c7', border: '#fde68a', color: 'var(--theme-claret)' } };
}

function initials(c) {
  return `${c?.firstName?.[0] ?? ''}${c?.lastName?.[0] ?? ''}`.toUpperCase();
}

function avatarColor(id) {
  const colors = ['var(--theme-mustard)','var(--theme-terracotta)','var(--theme-claret)','var(--theme-taupe)','#a8a29e','var(--theme-aubergine)'];
  return colors[(id?.charCodeAt(4) ?? 0) % colors.length];
}

/* ── small event chip used in month + week grid ── */
function EventChip({ iv, cand, interviewers, onClick }) {
  const style = eventStyle(iv.status, cand?.status);
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg overflow-hidden transition-all duration-150"
      style={{ backgroundColor: style.chip.bg, border: `1px solid ${style.chip.border}`, color: style.chip.color }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(60,42,33,0.10)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div className="flex">
        {/* accent bar */}
        <div className="w-1 flex-shrink-0 rounded-l-lg" style={{ backgroundColor: style.bar }} />
        <div className="px-2 py-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Clock size={9} className="flex-shrink-0 opacity-60" />
            <span className="text-[10px] font-bold tracking-tight">{iv.time}</span>
            <span className="text-[9px] opacity-60 ml-auto">{iv.round?.split(' ')[0]}</span>
          </div>
          <p className="text-[11px] font-semibold leading-tight truncate">
            {cand?.firstName} {cand?.lastName}
          </p>
          <p className="text-[10px] opacity-75 truncate leading-tight">{cand?.appliedPosition}</p>
          <p className="text-[10px] opacity-60 truncate leading-tight">
            <User size={8} className="inline mr-0.5" />{interviewers}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function InterviewCalendar() {
  useStorageSync();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [view, setView]       = useState('month');
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState(null);
  const [overflow, setOverflow] = useState(null);
  const [showToday, setShowToday] = useState(false);

  const allInterviews = getStore(STORAGE_KEYS.INTERVIEWS);
  const interviews = isRecruiter(user) ? allInterviews : allInterviews.filter(i => i.interviewerIds?.includes(user?.id));
  const candidates = getStore(STORAGE_KEYS.CANDIDATES);
  const employees  = getStore(STORAGE_KEYS.EMPLOYEES);

  const today = new Date().toISOString().split('T')[0];

  function getCandidate(cid)  { return candidates.find(c => c.id === cid); }
  function getEmpName(eid)    { const e = employees.find(x => x.id === eid); return e ? `${e.firstName} ${e.lastName}` : eid; }
  function getIvsForDate(ds)  { return interviews.filter(i => i.date === ds); }

  function toDateStr(y, m, d) {
    return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }

  /* navigation */
  function prev() {
    setCurrent(c => {
      if (view === 'month') return new Date(c.getFullYear(), c.getMonth() - 1, 1);
      if (view === 'week')  return new Date(c.getFullYear(), c.getMonth(), c.getDate() - 7);
      return new Date(c.getFullYear(), c.getMonth(), c.getDate() - 1);
    });
  }
  function next() {
    setCurrent(c => {
      if (view === 'month') return new Date(c.getFullYear(), c.getMonth() + 1, 1);
      if (view === 'week')  return new Date(c.getFullYear(), c.getMonth(), c.getDate() + 7);
      return new Date(c.getFullYear(), c.getMonth(), c.getDate() + 1);
    });
  }
  function goToday() { setCurrent(new Date()); setShowToday(true); }

  /* header label */
  function headerLabel() {
    if (view === 'month') return `${MONTHS[current.getMonth()]} ${current.getFullYear()}`;
    if (view === 'day')   return formatDate(current.toISOString());
    // week: show range
    const start = new Date(current);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start); end.setDate(end.getDate() + 6);
    return `${MONTHS[start.getMonth()]} ${start.getDate()} – ${start.getMonth() !== end.getMonth() ? MONTHS[end.getMonth()] + ' ' : ''}${end.getDate()}, ${end.getFullYear()}`;
  }

  /* ── MONTH VIEW ── */
  function buildMonthGrid() {
    const y = current.getFullYear(), m = current.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }

  /* ── WEEK VIEW ── */
  function buildWeekDays() {
    const start = new Date(current);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start); d.setDate(d.getDate() + i);
      return d;
    });
  }

  const LEGEND = [
    { color: 'var(--theme-mustard)', label: 'Scheduled'  },
    { color: '#16a34a', label: 'Passed'     },
    { color: '#dc2626', label: 'Rejected'   },
    { color: 'var(--theme-mustard)', label: 'Next Round' },
    { color: 'var(--theme-taupe)', label: 'Completed'  },
    { color: '#a8a29e', label: 'Cancelled'  },
  ];

  return (
    <div className="space-y-4">

      {/* ── Top bar ── */}
      <div className="flex items-end justify-between pb-6 border-b border-[var(--theme-linen)]">
        <div>
          <p className="text-[10px] font-semibold text-[#a8a29e] uppercase tracking-widest mb-1">Recruitment</p>
          <h1 className="text-xl font-semibold text-[var(--theme-aubergine)]">Interview Calendar</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToday} className="btn btn-secondary btn-sm">Today</button>
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #e8e2d9' }}>
            {['month','week','day'].map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{
                  padding: '6px 12px', fontSize: '12px', fontWeight: 500,
                  textTransform: 'capitalize', transition: 'all 150ms',
                  backgroundColor: view === v ? 'var(--theme-mustard)' : 'var(--theme-cream)',
                  color: view === v ? 'var(--theme-cream)' : 'var(--theme-taupe)',
                  borderRight: v !== 'day' ? '1px solid #e8e2d9' : 'none',
                }}
                onMouseEnter={e => { if (view !== v) e.currentTarget.style.backgroundColor = 'var(--theme-sidebar-bg)'; }}
                onMouseLeave={e => { if (view !== v) e.currentTarget.style.backgroundColor = 'var(--theme-cream)'; }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {LEGEND.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs font-medium" style={{ color: 'var(--theme-taupe)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Calendar card ── */}
      <div className="bg-[var(--theme-cream)] rounded-2xl border border-[var(--theme-linen)] shadow-card overflow-hidden">

        {/* Navigation header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e8e2d9', backgroundColor: 'var(--theme-sidebar-bg)' }}>
          <button onClick={prev} className="w-8 h-8 flex items-center justify-center transition-colors"
            style={{ borderRadius: '8px', border: '1px solid #e8e2d9', backgroundColor: 'var(--theme-cream)', color: 'var(--theme-taupe)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f5f1eb'; e.currentTarget.style.borderColor = 'var(--theme-mustard)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--theme-cream)'; e.currentTarget.style.borderColor = 'var(--theme-linen)'; }}
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <CalendarDays size={16} style={{ color: 'var(--theme-mustard)' }} />
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: '15px', fontWeight: 700, letterSpacing: '0.45px', color: 'var(--theme-aubergine)' }}>
              {headerLabel()}
            </h2>
          </div>
          <button onClick={next} className="w-8 h-8 flex items-center justify-center transition-colors"
            style={{ borderRadius: '8px', border: '1px solid #e8e2d9', backgroundColor: 'var(--theme-cream)', color: 'var(--theme-taupe)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f5f1eb'; e.currentTarget.style.borderColor = 'var(--theme-mustard)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--theme-cream)'; e.currentTarget.style.borderColor = 'var(--theme-linen)'; }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* ── MONTH GRID ── */}
        {view === 'month' && (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-[var(--theme-linen)]">
              {DAYS_SHORT.map(d => (
                <div key={d} className="py-2.5 text-center text-xs font-bold text-[#a8a29e] uppercase tracking-widest bg-[var(--theme-sidebar-bg)]/80">
                  {d}
                </div>
              ))}
            </div>
            {/* Day cells */}
            <div className="grid grid-cols-7">
              {buildMonthGrid().map((d, i) => {
                const ds  = d ? toDateStr(current.getFullYear(), current.getMonth(), d) : null;
                const ivs = ds ? getIvsForDate(ds) : [];
                const isToday   = ds === today;
                const isWeekend = i % 7 === 0 || i % 7 === 6;
                return (
                  <div key={i}
                    className={`min-h-[130px] p-2 border-b border-r border-[var(--theme-linen)] transition-colors`}
                    style={{ backgroundColor: !d ? 'var(--theme-sidebar-bg)' : isWeekend ? 'var(--theme-parchment)' : 'var(--theme-cream)' }}
                    onMouseEnter={e => { if (d && !isWeekend) e.currentTarget.style.backgroundColor = '#fef3c7'; }}
                    onMouseLeave={e => { if (d && !isWeekend) e.currentTarget.style.backgroundColor = 'var(--theme-cream)'; }}
                  >
                    {d && (
                      <>
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className="text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full transition-colors"
                            style={isToday
                              ? { backgroundColor: 'var(--theme-mustard)', color: 'var(--theme-cream)', boxShadow: '0 1px 4px rgba(217,119,6,0.35)' }
                              : { color: 'var(--theme-taupe)' }
                            }
                          >
                            {d}
                          </span>
                          {ivs.length > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ backgroundColor: '#fef3c7', color: 'var(--theme-claret)' }}>
                              {ivs.length}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {ivs.slice(0, 2).map(iv => {
                            const cand = getCandidate(iv.candidateId);
                            const interviewers = iv.interviewerIds?.map(getEmpName).join(', ') || '—';
                            return (
                              <EventChip key={iv.id} iv={iv} cand={cand} interviewers={interviewers} onClick={() => setSelected(iv)} />
                            );
                          })}
                          {ivs.length > 2 && (
                            <button
                              onClick={() => setOverflow({ ds, ivs })}
                              className="text-[10px] font-semibold pl-1 hover:underline w-full text-left"
                              style={{ color: 'var(--theme-mustard)' }}>
                              +{ivs.length - 2} more
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── WEEK GRID ── */}
        {view === 'week' && (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-[var(--theme-linen)]">
              {buildWeekDays().map((d, i) => {
                const ds = toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
                const isToday = ds === today;
                return (
                  <div key={i} className="py-3 text-center border-r border-[var(--theme-linen)] last:border-0"
                    style={{ backgroundColor: isToday ? '#fef3c7' : 'var(--theme-sidebar-bg)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#a8a29e' }}>{DAYS_SHORT[d.getDay()]}</p>
                    <p className="text-lg font-bold mt-0.5" style={{ color: isToday ? 'var(--theme-mustard)' : 'var(--theme-aubergine)' }}>{d.getDate()}</p>
                  </div>
                );
              })}
            </div>
            {/* Events row */}
            <div className="grid grid-cols-7 min-h-[400px]">
              {buildWeekDays().map((d, i) => {
                const ds  = toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
                const ivs = getIvsForDate(ds);
                const isToday = ds === today;
                return (
                  <div key={i} className="p-2 border-r border-[var(--theme-linen)] last:border-0 space-y-1.5"
                    style={{ backgroundColor: isToday ? 'rgba(254,243,199,0.4)' : 'transparent' }}>
                    {ivs.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-[10px] text-[#d4cdc4] font-medium">—</p>
                      </div>
                    ) : ivs.map(iv => {
                      const cand = getCandidate(iv.candidateId);
                      const interviewers = iv.interviewerIds?.map(getEmpName).join(', ') || '—';
                      return <EventChip key={iv.id} iv={iv} cand={cand} interviewers={interviewers} onClick={() => setSelected(iv)} />;
                    })}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── DAY VIEW ── */}
        {view === 'day' && (() => {
          const ds  = toDateStr(current.getFullYear(), current.getMonth(), current.getDate());
          const ivs = getIvsForDate(ds).sort((a, b) => a.time?.localeCompare(b.time));
          const isToday = ds === today;
          return (
            <div>
              {/* Day banner */}
              <div className={`px-6 py-4 border-b border-[var(--theme-linen)] flex items-center gap-3 ${isToday ? 'bg-[#fef3c7]' : 'bg-[var(--theme-sidebar-bg)]'}`}>
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold shadow-sm ${isToday ? 'bg-[#d97706] text-white' : 'bg-[var(--theme-cream)] text-[var(--theme-aubergine)] border border-[var(--theme-linen)]'}`}>
                  <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{DAYS_SHORT[current.getDay()]}</span>
                  <span className="text-xl leading-none">{current.getDate()}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--theme-aubergine)]">{DAYS_FULL[current.getDay()]}, {MONTHS[current.getMonth()]} {current.getDate()}</p>
                  <p className="text-xs text-[#a8a29e]">{ivs.length} interview{ivs.length !== 1 ? 's' : ''} scheduled</p>
                </div>
              </div>

              {ivs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#d4cdc4]">
                  <CalendarDays size={40} className="mb-3" />
                  <p className="text-sm font-medium">No interviews scheduled</p>
                </div>
              ) : (
                <div className="divide-y divide-[#f5f1eb]">
                  {ivs.map(iv => {
                    const cand = getCandidate(iv.candidateId);
                    const interviewers = iv.interviewerIds?.map(getEmpName).join(', ') || '—';
                    const style = eventStyle(iv.status, cand?.status);
                    return (
                      <button key={iv.id} onClick={() => setSelected(iv)}
                        className="w-full text-left px-6 py-4 hover:bg-[var(--theme-sidebar-bg)] transition-colors group">
                        <div className="flex items-start gap-4">
                          {/* Time column */}
                          <div className="w-16 flex-shrink-0 text-right">
                            <p className="text-sm font-bold text-primary">{iv.time}</p>
                            <p className="text-[10px] text-[#a8a29e]">{iv.duration}m</p>
                          </div>
                          {/* Accent line */}
                          <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${style.bar}`} />
                          {/* Avatar */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColor(cand?.id)}`}>
                            {initials(cand)}
                          </div>
                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-bold text-[var(--theme-aubergine)]">{cand?.firstName} {cand?.lastName}</p>
                                <p className="text-xs text-primary font-medium">{cand?.appliedPosition}</p>
                              </div>
                              <StatusBadge status={iv.status} />
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                              <span className="flex items-center gap-1 text-xs text-[var(--theme-taupe)]">
                                <User size={11} />{interviewers}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-[var(--theme-taupe)]">
                                {iv.mode === 'Online' ? <Video size={11} /> : <MapPin size={11} />}
                                {iv.mode}{iv.mode === 'Offline' && iv.location ? ` · ${iv.location}` : ''}
                              </span>
                              <span className="text-xs font-semibold text-[var(--theme-taupe)] bg-[#f0ebe2] px-2 py-0.5 rounded-full">{iv.round}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* ── Overflow Modal (+N more) ── */}
      {overflow && (
        <Modal
          title={`All Interviews — ${formatDate(overflow.ds)}`}
          onClose={() => setOverflow(null)}
          size="sm"
        >
          <div className="space-y-2">
            {overflow.ivs.map(iv => {
              const cand = getCandidate(iv.candidateId);
              const interviewers = iv.interviewerIds?.map(getEmpName).join(', ') || '—';
              return (
                <EventChip
                  key={iv.id}
                  iv={iv}
                  cand={cand}
                  interviewers={interviewers}
                  onClick={() => { setOverflow(null); setSelected(iv); }}
                />
              );
            })}
          </div>
        </Modal>
      )}

      {/* ── Event Detail Modal ── */}
      {selected && (() => {
        const cand  = getCandidate(selected.candidateId);
        const style = eventStyle(selected.status, cand?.status);
        const interviewers = selected.interviewerIds?.map(getEmpName).join(', ') || '—';
        return (
          <Modal title="Interview Details" onClose={() => setSelected(null)} size="sm">
            <div className="space-y-4">
              {/* Candidate header */}
              <div className={`rounded-xl p-4 border ${style.chip} flex items-center gap-3`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${avatarColor(cand?.id)}`}>
                  {initials(cand)}
                </div>
                <div>
                  <p className="font-bold text-[var(--theme-aubergine)]">{cand?.firstName} {cand?.lastName}</p>
                  <p className="text-xs font-medium opacity-80">{cand?.appliedPosition}</p>
                  <div className="mt-1"><StatusBadge status={selected.status} /></div>
                </div>
              </div>

              {/* Details grid */}
              <div className="space-y-2.5">
                {[
                  [<Clock size={13} />,    'Time',          `${selected.time} · ${selected.duration} min`],
                  [<CalendarDays size={13} />, 'Date',      formatDate(selected.date)],
                  [<Star size={13} />,     'Round',         selected.round],
                  [<User size={13} />,     'Interviewer(s)', interviewers],
                  [selected.mode === 'Online' ? <Video size={13} /> : <MapPin size={13} />, 'Mode',
                    selected.mode === 'Online'
                      ? selected.meetingLink ? `Online · ${selected.meetingLink}` : 'Online'
                      : selected.location   ? `Offline · ${selected.location}`   : 'Offline'],
                ].map(([icon, label, value]) => (
                  <div key={label} className="flex items-start gap-3 py-2 border-b border-[#f5f1eb] last:border-0">
                    <span className="text-[#a8a29e] mt-0.5 flex-shrink-0">{icon}</span>
                    <span className="text-xs text-[#a8a29e] w-24 flex-shrink-0">{label}</span>
                    <span className="text-xs font-semibold text-[var(--theme-aubergine)] flex-1">{value}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button className="btn-secondary btn btn-sm flex-1 gap-1.5"
                  onClick={() => { setSelected(null); navigate(`/candidates/${selected.candidateId}`); }}>
                  <ExternalLink size={13} /> Open Candidate
                </button>
                <button className="btn-primary btn btn-sm flex-1 gap-1.5"
                  onClick={() => { setSelected(null); navigate(`/interview-feedback/${selected.id}`); }}>
                  <Star size={13} /> Add Feedback
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
