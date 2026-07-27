import { useNavigate } from 'react-router-dom';
import { getStore, STORAGE_KEYS, syncCandidateStatuses } from '../../utils/store';
import { useStorageSync } from '../../utils/useStorageSync';
import { todayStr, formatDate } from '../../utils/helpers';
import { ROLE_LABELS, ROLES } from '../../utils/roles';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowUpRight, Briefcase, CalendarDays, CheckCircle, Clock,
  Users, XCircle, UserCheck, GitBranch, MessageSquare, Video,
  MapPin, Plus, CalendarPlus, Activity, LogIn, UserCog,
} from 'lucide-react';

/* ─────────────────────────────────────────
   KPI CARD
   Number is the hero. Label is secondary.
   Icon is tertiary — small, top-right.
───────────────────────────────────────── */
function KpiCard({ icon: Icon, label, value, subtitle, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 shadow-card p-5 flex flex-col justify-between min-h-[120px]
        ${onClick ? 'cursor-pointer hover:shadow-card-hover hover:border-gray-200' : ''}
        transition-all duration-200 group`}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-gray-400 leading-tight">{label}</p>
        <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
          <Icon size={13} className="text-gray-400" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-semibold text-gray-900 tracking-tight leading-none">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1.5 leading-tight">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PIPELINE — stacked progress indicators
   Each stage: label + count + fill bar
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
              <p className="text-xs text-gray-500">{d.label}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-gray-800">{d.value}</p>
                <p className="text-[10px] text-gray-400 w-7 text-right">{pct}%</p>
              </div>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(pct, d.value > 0 ? 2 : 0)}%`, backgroundColor: d.color }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-[10px] text-gray-400 pt-2 border-t border-gray-50">
        {total} total candidates
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────
   ACTIVITY TIMELINE
   3-level hierarchy per row:
   action (bold) · details (muted) · time (right)
───────────────────────────────────────── */
function ActivityTimeline({ logs }) {
  const iconMap = {
    'Login':      { icon: LogIn,      color: 'text-gray-400' },
    'User':       { icon: UserCog,    color: 'text-gray-400' },
    'Candidate':  { icon: Users,      color: 'text-gray-400' },
    'Interview':  { icon: CalendarDays, color: 'text-gray-400' },
    'HR Action':  { icon: CheckCircle,  color: 'text-gray-400' },
    'default':    { icon: Activity,   color: 'text-gray-400' },
  };

  function getIcon(action) {
    const key = Object.keys(iconMap).find(k => action?.includes(k));
    return iconMap[key] || iconMap['default'];
  }

  if (logs.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-gray-400">No activity recorded yet.</p>
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
            {/* Left: icon + vertical line */}
            <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
              <div className="w-6 h-6 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                <Icon size={11} className={color} />
              </div>
              {!isLast && <div className="w-px flex-1 bg-gray-100 my-1" />}
            </div>
            {/* Right: content */}
            <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-3.5'}`}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-gray-700 leading-snug">{log.action}</p>
                <p className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5 tabular-nums">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {log.details && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">{log.details}</p>
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
function InterviewsEmptyState({ onSchedule }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
        <CalendarDays size={20} className="text-gray-300" />
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">No interviews scheduled today</p>
      <p className="text-xs text-gray-400 mb-6 max-w-[180px] leading-relaxed">
        Your calendar is clear. Schedule an interview to get started.
      </p>
      <button onClick={onSchedule} className="btn btn-secondary btn-sm">
        <CalendarPlus size={12} /> Schedule Interview
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   SECTION HEADER — consistent pattern
───────────────────────────────────────── */
function SectionHeader({ label, title, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        {label && <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>}
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>
      {action && (
        <button
          onClick={onAction}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          {action} <ArrowUpRight size={11} />
        </button>
      )}
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
  const openings = getStore(STORAGE_KEYS.JOB_OPENINGS);
  const employees = getStore(STORAGE_KEYS.EMPLOYEES);
  const logs = getStore(STORAGE_KEYS.ACTIVITY_LOGS).slice(0, 8);
  const today = todayStr();

  const role = user?.role;
  const ownedCandidates = candidates.filter(c => c.assignedTo === user?.id || c.createdBy === user?.id);
  const scopedCandidates = role === ROLES.HR ? ownedCandidates : candidates;
  const assignedInterviews = interviews.filter(i => i.interviewerIds?.includes(user?.id));

  const todaysInterviews = (role === ROLES.INTERVIEWER ? assignedInterviews : interviews)
    .filter(i => i.date === today && i.status !== 'cancelled')
    .sort((a, b) => a.time?.localeCompare(b.time));

  const joiningStage = candidates.filter(c => ['Offered', 'Offer Sent', 'Offer Accepted', 'Joined'].includes(c.status));
  const pendingFeedback = assignedInterviews.filter(i => i.status === 'completed' && !i.feedback);

  function candidateName(id) {
    const c = candidates.find(x => x.id === id);
    return c ? `${c.firstName} ${c.lastName}` : 'Candidate';
  }
  function getEmpName(id) {
    const e = employees.find(x => x.id === id);
    return e ? `${e.firstName} ${e.lastName}` : id;
  }

  // KPI cards — all neutral, number is the hero
  const cards = role === ROLES.INTERVIEWER ? [
    [CalendarDays, "Today's Interviews", assignedInterviews.filter(i => i.date === today).length, 'Assigned to you', '/interview-calendar'],
    [Clock,        'Upcoming',           assignedInterviews.filter(i => i.date > today && i.status === 'scheduled').length, 'Scheduled ahead', '/interview-schedule'],
    [MessageSquare,'Pending Feedback',   pendingFeedback.length, 'Awaiting your input', '/interview-schedule'],
  ] : role === ROLES.RECEPTIONIST ? [
    [CalendarDays,  "Today's Interviews", todaysInterviews.length, 'Scheduled for today', '/approvals'],
    [MessageSquare, 'Pending Approvals',  interviews.filter(i => i.status === 'completed' && i.feedback).length, 'Awaiting review', '/approvals'],
  ] : role === ROLES.IT ? [
    [UserCheck,    'Joining Stage',    joiningStage.length, 'Ready for onboarding', '/pipeline'],
    [Clock,        'Pending Setups',   joiningStage.filter(c => !c.accessSetupComplete).length, 'Access not configured', '/pipeline'],
    [CheckCircle,  'Completed Setups', joiningStage.filter(c => c.accessSetupComplete).length, 'Access configured', '/pipeline'],
  ] : [
    [Briefcase,    'Open Positions',   openings.filter(o => ['open','active','published'].includes(o.status)).length, 'Active job openings', '/job-openings'],
    [Users,        role === ROLES.HR ? 'My Candidates' : 'Total Candidates', scopedCandidates.length, 'In your pipeline', '/candidates'],
    [CalendarDays, "Today's Interviews", todaysInterviews.length, 'Scheduled for today', '/interview-calendar'],
    [GitBranch,    'In Pipeline',      scopedCandidates.filter(c => !['Rejected','Joined','archived'].includes(c.status)).length, 'Active candidates', '/pipeline'],
    [CheckCircle,  'Selected',         scopedCandidates.filter(c => ['Selected','Offer Sent','Offer Accepted','Joined'].includes(c.status)).length, 'Offer stage & beyond', '/candidates?status=Selected'],
    [XCircle,      'Rejected',         scopedCandidates.filter(c => ['Rejected','Failed'].includes(c.status)).length, 'Not moving forward', '/candidates?status=Rejected'],
  ];

  // Pipeline data
  const pipelineData = [
    { label: 'New',       value: scopedCandidates.filter(c => c.status === 'New Candidate').length,                                      color: '#D1D5DB' },
    { label: 'Scheduled', value: scopedCandidates.filter(c => c.status === 'Interview Scheduled').length,                                 color: '#93C5FD' },
    { label: 'Completed', value: scopedCandidates.filter(c => c.status === 'Interview Completed').length,                                 color: '#A5B4FC' },
    { label: 'Passed',    value: scopedCandidates.filter(c => c.status === 'Passed').length,                                              color: '#6EE7B7' },
    { label: 'Selected',  value: scopedCandidates.filter(c => ['Selected','Offered','Joined'].includes(c.status)).length,                 color: '#34D399' },
    { label: 'Rejected',  value: scopedCandidates.filter(c => ['Failed','Rejected','Not Joined'].includes(c.status)).length,              color: '#FCA5A5' },
    { label: 'On Hold',   value: scopedCandidates.filter(c => c.status === 'On Hold').length,                                             color: '#FCD34D' },
  ];

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const isHR = role === ROLES.HEAD_HR || role === ROLES.HR;

  // Date string — e.g. "Monday, 14 July 2025"
  const dateStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8">

      {/* ── HERO HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-400 tracking-widest uppercase">{dateStr}</p>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            {greeting}, {user?.firstName}
          </h1>
          <p className="text-sm text-gray-400">
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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

        {/* TODAY'S INTERVIEWS — spans 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-gray-50">
            <SectionHeader
              label="Schedule"
              title="Today's Interviews"
              action={todaysInterviews.length > 0 ? 'View all' : null}
              onAction={() => navigate('/interview-schedule')}
            />
          </div>

          {todaysInterviews.length === 0 ? (
            <InterviewsEmptyState onSchedule={() => navigate('/interview-schedule')} />
          ) : (
            <div className="divide-y divide-gray-50">
              {todaysInterviews.map(iv => {
                const c = candidates.find(x => x.id === iv.candidateId);
                const now = new Date();
                const [h, m] = (iv.time || '00:00').split(':').map(Number);
                const ivTime = new Date(); ivTime.setHours(h, m, 0, 0);
                const isPast = ivTime < now;
                const isDone = iv.status === 'completed';
                return (
                  <button
                    key={iv.id}
                    onClick={() => navigate(`/candidates/${iv.candidateId}`)}
                    className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors flex items-center gap-4"
                  >
                    {/* Status accent */}
                    <div className={`w-0.5 self-stretch rounded-full flex-shrink-0 ${isDone ? 'bg-emerald-300' : isPast ? 'bg-amber-300' : 'bg-blue-300'}`} />

                    {/* Time — primary on left */}
                    <div className="w-12 flex-shrink-0 text-left">
                      <p className="text-sm font-semibold text-gray-800 tabular-nums">{iv.time}</p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {iv.mode === 'Online'
                          ? <Video size={10} className="text-gray-400" />
                          : <MapPin size={10} className="text-gray-400" />
                        }
                        <span className="text-[10px] text-gray-400">{iv.mode}</span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-gray-100 flex-shrink-0" />

                    {/* Candidate info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{candidateName(iv.candidateId)}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {iv.round}{c?.appliedPosition ? ` · ${c.appliedPosition}` : ''}
                      </p>
                    </div>

                    {/* Interviewer + status */}
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="text-xs text-gray-400 truncate max-w-[120px]">
                        {iv.interviewerIds?.map(getEmpName).join(', ') || '—'}
                      </p>
                      {isDone && (
                        <span className="text-[10px] font-medium text-emerald-600 mt-0.5 block">Completed</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* PIPELINE — HR only */}
          {isHR && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <SectionHeader
                label="Recruitment"
                title="Candidate Pipeline"
                action="View pipeline"
                onAction={() => navigate('/pipeline')}
              />
              <PipelineIndicators data={pipelineData} />
            </div>
          )}

          {/* ACTIVITY — non-HR roles */}
          {!isHR && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <SectionHeader label="Platform" title="Recent Activity" />
              <ActivityTimeline logs={logs} />
            </div>
          )}
        </div>
      </div>

      {/* ── RECENT ACTIVITY — HR only ── */}
      {isHR && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <SectionHeader
            label="Platform"
            title="Recent Activity"
            action={`${logs.length} events`}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            <ActivityTimeline logs={logs.slice(0, Math.ceil(logs.length / 2))} />
            <ActivityTimeline logs={logs.slice(Math.ceil(logs.length / 2))} />
          </div>
        </div>
      )}

    </div>
  );
}
