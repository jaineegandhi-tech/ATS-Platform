import { useNavigate } from 'react-router-dom';
import { getStore, STORAGE_KEYS, syncCandidateStatuses } from '../../utils/store';
import { useStorageSync } from '../../utils/useStorageSync';
import { todayStr } from '../../utils/helpers';
import { ROLE_LABELS, ROLES } from '../../utils/roles';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowUpRight, Briefcase, CalendarDays, CheckCircle, Clock,
  Users, XCircle, UserCheck, GitBranch, MessageSquare, Video,
  MapPin, Plus, CalendarPlus, Activity, LogIn, UserCog,
} from 'lucide-react';

/* ─────────────────────────────────────────
   DS TOKENS (inline — no Tailwind grays)
───────────────────────────────────────── */
const T = {
  parchment:  'var(--theme-parchment)',
  linen:      'var(--theme-sidebar-bg)',
  border:     'var(--theme-linen)',
  aubergine:  'var(--theme-aubergine)',
  taupe:      'var(--theme-taupe)',
  mustard:    'var(--theme-mustard)',
  terracotta: 'var(--theme-terracotta)',
  claret:     'var(--theme-claret)',
  cream:      'var(--theme-cream)',
};

/* ─────────────────────────────────────────
   KPI CARD
───────────────────────────────────────── */
function KpiCard({ icon: Icon, label, value, subtitle, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col justify-between min-h-[120px] transition-all duration-200 ${onClick ? 'cursor-pointer group' : ''}`}
      style={{
        backgroundColor: T.cream,
        borderRadius: '24px',
        border: `1px solid ${T.border}`,
        boxShadow: '0 1px 3px 0 rgba(60,42,33,0.06)',
        padding: '20px',
      }}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(60,42,33,0.10)';
          e.currentTarget.style.borderColor = 'rgba(217,119,6,0.30)';
        }
      }}
      onMouseLeave={e => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(60,42,33,0.06)';
          e.currentTarget.style.borderColor = T.border;
        }
      }}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium leading-tight" style={{ color: T.taupe }}>{label}</p>
        <div className="flex items-center gap-1">
          {onClick && (
            <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100 transition-all duration-150"
              style={{ color: T.mustard }} />
          )}
          <div className="w-7 h-7 flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#fef3c7', borderRadius: '8px' }}>
            <Icon size={13} style={{ color: T.mustard }} />
          </div>
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight leading-none"
          style={{ color: T.aubergine }}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs mt-1.5 leading-tight" style={{ color: T.taupe }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PIPELINE INDICATORS
───────────────────────────────────────── */
function PipelineIndicators({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="space-y-3.5">
      {data.map(d => {
        const pct = Math.round((d.value / total) * 100);
        return (
          <div key={d.label}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs" style={{ color: T.taupe }}>{d.label}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold" style={{ color: T.aubergine }}>{d.value}</p>
                <p className="text-[10px] w-7 text-right" style={{ color: T.taupe }}>{pct}%</p>
              </div>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: T.border }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(pct, d.value > 0 ? 2 : 0)}%`, backgroundColor: d.color }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-[10px] pt-2" style={{ color: T.taupe, borderTop: `1px solid ${T.border}` }}>
        {total} total candidates
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────
   ACTIVITY TIMELINE
───────────────────────────────────────── */
function ActivityTimeline({ logs }) {
  const iconMap = {
    'Login':     { icon: LogIn,        color: T.mustard },
    'User':      { icon: UserCog,      color: T.terracotta },
    'Candidate': { icon: Users,        color: '#16a34a' },
    'Interview': { icon: CalendarDays, color: T.mustard },
    'HR Action': { icon: CheckCircle,  color: T.claret },
    'Password':  { icon: CheckCircle,  color: T.terracotta },
    'Status':    { icon: Activity,     color: T.aubergine },
    'Reassign':  { icon: UserCog,      color: T.claret },
    'default':   { icon: Activity,     color: T.taupe },
  };

  function getIcon(action) {
    const key = Object.keys(iconMap).find(k => action?.includes(k));
    return iconMap[key] || iconMap['default'];
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-10 h-10 flex items-center justify-center mb-3"
          style={{ backgroundColor: T.linen, border: `1px solid ${T.border}`, borderRadius: '12px' }}>
          <Activity size={16} style={{ color: T.taupe }} />
        </div>
        <p className="text-sm font-medium mb-1" style={{ color: T.taupe }}>No activity yet</p>
        <p className="text-xs" style={{ color: T.taupe, opacity: 0.7 }}>Actions taken in the system will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      {logs.map((log, i) => {
        const { icon: Icon, color } = getIcon(log.action);
        const isLast = i === logs.length - 1;
        return (
          <div key={log.id} className="flex gap-3">
            <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: T.linen, border: `1px solid ${T.border}`, borderRadius: '6px' }}>
                <Icon size={11} style={{ color }} />
              </div>
              {!isLast && <div className="w-px flex-1 my-1" style={{ backgroundColor: T.border }} />}
            </div>
            <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-3.5'}`}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium leading-snug" style={{ color: T.aubergine }}>{log.action}</p>
                <p className="text-[10px] flex-shrink-0 mt-0.5 tabular-nums" style={{ color: T.taupe }}>
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {log.details && (
                <p className="text-xs mt-0.5 truncate" style={{ color: T.taupe }}>{log.details}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────
   EMPTY STATE — Today's Interviews
───────────────────────────────────────── */
function InterviewsEmptyState({ onSchedule, role }) {
  const isIT = role === ROLES.IT;
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-12 h-12 flex items-center justify-center mb-4"
        style={{ backgroundColor: '#fef3c7', border: `1px solid rgba(217,119,6,0.25)`, borderRadius: '16px' }}>
        <CalendarDays size={20} style={{ color: T.mustard }} />
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: T.taupe }}>No interviews scheduled today</p>
      <p className="text-xs mb-6 max-w-[180px] leading-relaxed" style={{ color: T.taupe, opacity: 0.7 }}>
        Your calendar is clear.{!isIT && ' Schedule an interview to get started.'}
      </p>
      {!isIT && (
        <button onClick={onSchedule} className="btn btn-secondary btn-sm">
          <CalendarPlus size={12} /> Schedule Interview
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────── */
function SectionHeader({ label, title, action, onAction, count }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <div>
          {label && (
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
              style={{ color: T.taupe, opacity: 0.7 }}>
              {label}
            </p>
          )}
          <h2 className="text-sm font-bold"
            style={{ color: T.aubergine, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", letterSpacing: '0.45px' }}>
            {title}
          </h2>
        </div>
        {count != null && (
          <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
            style={{ backgroundColor: T.linen, color: T.taupe, borderRadius: '6px' }}>
            {count}
          </span>
        )}
      </div>
      {action && (
        <button
          onClick={onAction}
          className="flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
          style={{ color: T.mustard }}
          onMouseEnter={e => e.currentTarget.style.color = T.terracotta}
          onMouseLeave={e => e.currentTarget.style.color = T.mustard}
        >
          {action} <ArrowUpRight size={11} />
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   CARD WRAPPER — DS card style
───────────────────────────────────────── */
function DsCard({ children, className = '', style = {} }) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: T.cream,
        borderRadius: '24px',
        border: `1px solid ${T.border}`,
        boxShadow: '0 2px 8px 0 rgba(60,42,33,0.06), 0 1px 2px 0 rgba(60,42,33,0.04)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────── */
export default function RecruitmentDashboard() {
  useStorageSync();
  syncCandidateStatuses();

  const { user } = useAuth();
  const navigate = useNavigate();
  const candidates = getStore(STORAGE_KEYS.CANDIDATES);
  const interviews = getStore(STORAGE_KEYS.INTERVIEWS);
  const openings   = getStore(STORAGE_KEYS.JOB_OPENINGS);
  const employees  = getStore(STORAGE_KEYS.EMPLOYEES);
  const logs       = getStore(STORAGE_KEYS.ACTIVITY_LOGS).slice(0, 8);
  const today      = todayStr();

  const role = user?.role;
  const ownedCandidates    = candidates.filter(c => c.assignedTo === user?.id || c.createdBy === user?.id);
  const scopedCandidates   = role === ROLES.HR ? ownedCandidates : candidates;
  const assignedInterviews = interviews.filter(i => i.interviewerIds?.includes(user?.id));

  const todaysInterviews = (role === ROLES.INTERVIEWER ? assignedInterviews : interviews)
    .filter(i => i.date === today && i.status !== 'cancelled')
    .sort((a, b) => a.time?.localeCompare(b.time));

  const joiningStage    = candidates.filter(c => ['Offered', 'Offer Sent', 'Offer Accepted', 'Joined'].includes(c.status));
  const pendingFeedback = assignedInterviews.filter(i => i.status === 'completed' && !i.feedback);

  function candidateName(id) {
    const c = candidates.find(x => x.id === id);
    return c ? `${c.firstName} ${c.lastName}` : 'Candidate';
  }
  function getEmpName(id) {
    const e = employees.find(x => x.id === id);
    return e ? `${e.firstName} ${e.lastName}` : id;
  }

  const cards = role === ROLES.INTERVIEWER ? [
    [CalendarDays, "Today's Interviews", assignedInterviews.filter(i => i.date === today).length, 'Assigned to you', '/interview-calendar'],
    [Clock,        'Upcoming',           assignedInterviews.filter(i => i.date > today && i.status === 'scheduled').length, 'Scheduled ahead', '/interview-schedule'],
    [MessageSquare,'Pending Feedback',   pendingFeedback.length, 'Awaiting your input', '/interview-schedule'],
  ] : role === ROLES.RECEPTIONIST ? [
    [CalendarDays,  "Today's Interviews", todaysInterviews.length, 'Scheduled for today', '/approvals'],
    [MessageSquare, 'Pending Approvals',  interviews.filter(i => i.status === 'completed' && i.feedback).length, 'Awaiting review', '/approvals'],
  ] : role === ROLES.IT ? [
    [UserCheck,   'Joining Stage',    joiningStage.length, 'Ready for onboarding', '/pipeline'],
    [Clock,       'Pending Setups',   joiningStage.filter(c => !c.accessSetupComplete).length, 'Access not configured', '/pipeline'],
    [CheckCircle, 'Completed Setups', joiningStage.filter(c => c.accessSetupComplete).length, 'Access configured', '/pipeline'],
  ] : [
    [Briefcase,    'Open Positions',   openings.filter(o => ['open','active','published'].includes(o.status)).length, 'Active job openings', '/job-openings'],
    [Users,        role === ROLES.HR ? 'My Candidates' : 'Total Candidates', scopedCandidates.length, 'In your pipeline', '/candidates'],
    [CalendarDays, "Today's Interviews", todaysInterviews.length, 'Scheduled for today', '/interview-calendar'],
    [GitBranch,    'In Pipeline',      scopedCandidates.filter(c => !['Rejected','Joined','archived'].includes(c.status)).length, 'Active candidates', '/pipeline'],
    [CheckCircle,  'Selected',         scopedCandidates.filter(c => ['Selected','Offer Sent','Offer Accepted','Joined'].includes(c.status)).length, 'Offer stage & beyond', '/candidates?status=Selected'],
    [XCircle,      'Rejected',         scopedCandidates.filter(c => ['Rejected','Failed'].includes(c.status)).length, 'Not moving forward', '/candidates?status=Rejected'],
  ];

  // Pipeline — DS warm palette for bars
  const pipelineData = [
    { label: 'New',       value: scopedCandidates.filter(c => c.status === 'New Candidate').length,                                   color: T.border },
    { label: 'Scheduled', value: scopedCandidates.filter(c => c.status === 'Interview Scheduled').length,                              color: '#fcd34d' },
    { label: 'Completed', value: scopedCandidates.filter(c => c.status === 'Interview Completed').length,                              color: T.mustard },
    { label: 'Passed',    value: scopedCandidates.filter(c => c.status === 'Passed').length,                                           color: '#86efac' },
    { label: 'Selected',  value: scopedCandidates.filter(c => ['Selected','Offered','Joined'].includes(c.status)).length,              color: '#16a34a' },
    { label: 'Rejected',  value: scopedCandidates.filter(c => ['Failed','Rejected','Not Joined'].includes(c.status)).length,           color: '#fca5a5' },
    { label: 'On Hold',   value: scopedCandidates.filter(c => c.status === 'On Hold').length,                                          color: T.terracotta },
  ];

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const isHR = role === ROLES.HEAD_HR || role === ROLES.HR;

  return (
    <div className="space-y-10">

      {/* ── HERO HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6"
        style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="space-y-1">
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '0.45px',
            color: T.aubergine,
            lineHeight: '32px',
          }}>
            {greeting}, {user?.firstName}
          </h1>
          <p className="text-sm" style={{ color: T.taupe }}>
            {isHR
              ? "Here's your recruitment overview for today."
              : `You're logged in as ${ROLE_LABELS[role] || role}.`
            }
          </p>
        </div>

        {isHR && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => navigate('/interview-schedule')} className="btn btn-secondary btn-sm">
              <CalendarPlus size={12} /> Schedule Interview
            </button>
            <button onClick={() => navigate('/candidates/add')} className="btn btn-primary btn-sm">
              <Plus size={12} /> Add Candidate
            </button>
          </div>
        )}
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
        {cards.map(([Icon, label, value, subtitle, path]) => (
          <KpiCard
            key={label}
            icon={Icon}
            label={label}
            value={value}
            subtitle={subtitle}
            onClick={() => navigate(path)}
          />
        ))}
      </div>

      {/* ── MAIN CONTENT ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* TODAY'S INTERVIEWS — 2 cols */}
        <DsCard className="lg:col-span-2 overflow-hidden">
          <div className="px-7 pt-6 pb-5" style={{ borderBottom: `1px solid ${T.border}` }}>
            <SectionHeader
              label="Schedule"
              title="Today's Interviews"
              count={todaysInterviews.length}
              action="View all"
              onAction={() => navigate('/interview-schedule')}
            />
          </div>

          {todaysInterviews.length === 0 ? (
            <InterviewsEmptyState onSchedule={() => navigate('/interview-schedule')} role={role} />
          ) : (
            <div style={{ borderTop: 'none' }}>
              {todaysInterviews.map(iv => {
                const c = candidates.find(x => x.id === iv.candidateId);
                const now = new Date();
                const [h, m] = (iv.time || '00:00').split(':').map(Number);
                const ivTime = new Date(); ivTime.setHours(h, m, 0, 0);
                const isPast = ivTime < now;
                const isDone = iv.status === 'completed';
                const accentColor = isDone ? '#16a34a' : isPast ? T.terracotta : T.mustard;
                return (
                  <button
                    key={iv.id}
                    onClick={() => navigate(`/candidates/${iv.candidateId}`)}
                    className="w-full text-left flex items-center gap-4 transition-colors"
                    style={{ padding: '18px 28px', borderBottom: `1px solid ${T.linen}` }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = T.linen}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Status accent bar */}
                    <div className="self-stretch rounded-full flex-shrink-0"
                      style={{ width: '2px', backgroundColor: accentColor }} />

                    {/* Time */}
                    <div className="w-12 flex-shrink-0 text-left">
                      <p className="text-sm font-semibold tabular-nums" style={{ color: T.aubergine }}>{iv.time}</p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {iv.mode === 'Online'
                          ? <Video size={10} style={{ color: T.mustard }} />
                          : <MapPin size={10} style={{ color: T.mustard }} />
                        }
                        <span className="text-[10px]" style={{ color: T.taupe }}>{iv.mode}</span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 flex-shrink-0" style={{ backgroundColor: T.border }} />

                    {/* Candidate info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: T.aubergine }}>
                        {candidateName(iv.candidateId)}
                      </p>
                      <p className="text-xs truncate mt-0.5" style={{ color: T.taupe }}>
                        {iv.round}{c?.appliedPosition ? ` · ${c.appliedPosition}` : ''}
                      </p>
                    </div>

                    {/* Interviewer + status */}
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="text-xs truncate max-w-[120px]" style={{ color: T.taupe }}>
                        {iv.interviewerIds?.map(getEmpName).join(', ') || '—'}
                      </p>
                      {isDone && (
                        <span className="text-[10px] font-medium mt-0.5 block" style={{ color: '#16a34a' }}>
                          Completed
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </DsCard>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* PIPELINE — HR only */}
          {isHR && (
            <DsCard style={{ padding: '28px' }}>
              <SectionHeader
                label="Recruitment"
                title="Candidate Pipeline"
                count={scopedCandidates.length}
                action="View pipeline"
                onAction={() => navigate('/pipeline')}
              />
              <PipelineIndicators data={pipelineData} />
            </DsCard>
          )}

          {/* ACTIVITY — non-HR */}
          {!isHR && (
            <DsCard style={{ padding: '28px' }}>
              <SectionHeader label="Platform" title="Recent Activity" />
              <ActivityTimeline logs={logs} />
            </DsCard>
          )}
        </div>
      </div>

      {/* ── RECENT ACTIVITY — HR only ── */}
      {isHR && (
        <DsCard style={{ padding: '28px' }}>
          <SectionHeader
            label="Platform"
            title="Recent Activity"
            count={logs.length}
            action="View all"
            onAction={() => navigate('/reports')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            <ActivityTimeline logs={logs.slice(0, Math.ceil(logs.length / 2))} />
            <ActivityTimeline logs={logs.slice(Math.ceil(logs.length / 2))} />
          </div>
        </DsCard>
      )}

    </div>
  );
}
