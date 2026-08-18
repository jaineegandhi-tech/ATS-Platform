import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStore, setStore, STORAGE_KEYS, addLog, syncCandidateStatuses } from '../../utils/store';
import { useStorageSync } from '../../utils/useStorageSync';
import StatusBadge from '../../components/shared/StatusBadge';
import { Plus, Search, Eye, Pencil, CalendarDays, Download, Archive, Users2, UserCheck, MoreVertical, Users, Mail } from 'lucide-react';
import { ROLES, isRecruiter, isHeadHR } from '../../utils/roles';
import ResumePreviewModal from '../../components/shared/ResumePreviewModal';

const ROUNDS = ['HR Round', 'Technical Round', 'Managerial Round', 'Final Round'];
const STATUSES = ['New Candidate', 'Email Sent', 'Interview Scheduled', 'Interview Completed', 'Passed', 'Failed', 'On Hold', 'Selected', 'Rejected', 'Next Round Scheduled', 'Offer Sent', 'Offer Accepted', 'Offer Declined', 'Joined'];

export default function Candidates() {
  useStorageSync();
  syncCandidateStatuses();

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHR = isRecruiter(user);
  const isOnlyHR = user?.role === ROLES.HR;
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState(() => new URLSearchParams(location.search).get('status') || '');
  const [filterRound, setFilterRound] = useState('');

  useEffect(() => {
    const st = new URLSearchParams(location.search).get('status');
    if (st !== null) setFilterStatus(st);
    else setFilterStatus('');
  }, [location.search]);

  useEffect(() => {
    if (filterStatus === 'Outsourced' && user) {
      const all = getStore(STORAGE_KEYS.CANDIDATES);
      let updated = false;
      const nextAll = all.map(c => {
        if (c.status === 'Outsourced' && (!c.viewedBy || !c.viewedBy.includes(user.id))) {
          updated = true;
          return { ...c, viewedBy: [...(c.viewedBy || []), user.id] };
        }
        return c;
      });
      if (updated) {
        setStore(STORAGE_KEYS.CANDIDATES, nextAll);
        forceUpdate(n => n + 1);
      }
    }
  }, [filterStatus, user]);
  const [filterDate, setFilterDate] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [myView, setMyView] = useState(true);
  const [, forceUpdate] = useState(0);

  const candidates = getStore(STORAGE_KEYS.CANDIDATES);
  const interviews = getStore(STORAGE_KEYS.INTERVIEWS);
  const departments = [...new Set(candidates.map(c => c.department).filter(Boolean))];

  const visibleCandidates = candidates.filter(c => {
    if (user?.role === ROLES.INTERVIEWER) return interviews.some(i => i.candidateId === c.id && i.interviewerIds?.includes(user.id));
    if (user?.role === ROLES.IT) return ['Selected', 'Offered', 'Offer Sent', 'Offer Accepted', 'Joined', 'Rejected', 'Failed', 'Not Joined'].includes(c.status);
    if (user?.role === ROLES.HR) {
      if (myView) return c.assignedTo === user.id || c.createdBy === user.id || c.status === 'Outsourced';
      return true;
    }
    return true;
  });

  const filtered = visibleCandidates.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.appliedPosition?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
    const matchDept = !filterDept || c.department === filterDept;
    const matchStatus = !filterStatus || c.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchRound = !filterRound || c.currentRound === filterRound;
    const matchDate = !filterDate || c.createdAt?.slice(0, 10) === filterDate;
    const matchArchived = showArchived ? c.status === 'archived' : c.status !== 'archived';
    return matchSearch && matchDept && matchStatus && matchRound && matchDate && matchArchived;
  }).sort((a, b) => b.createdAt?.localeCompare(a.createdAt));

  function archive(id) {
    if (!window.confirm('Archive this candidate?')) return;
    const all = getStore(STORAGE_KEYS.CANDIDATES);
    setStore(STORAGE_KEYS.CANDIDATES, all.map(c => c.id === id ? { ...c, status: 'archived' } : c));
    addLog('Candidate Archived', user.id, `Candidate archived`);
    forceUpdate(n => n + 1);
  }

  const [previewResume, setPreviewResume] = useState(null);

  function openResumePreview(c) {
    if (!c.resume) return alert('No resume uploaded.');
    setPreviewResume(c);
  }

  async function sendEmail(c) {
    if (!c.email) return alert('No email address on file for this candidate.');

    if (c.status === 'Outsourced') {
      try {
        const response = await fetch('http://localhost:3000/api/mail/send-acknowledgement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: c.email, candidateName: c.firstName })
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        alert('Acknowledgement email sent successfully via SMTP.');
      } catch (err) {
        console.error(err);
        alert('Failed to send email via SMTP. Check server console for errors.');
        return;
      }
    } else {
      const subject = encodeURIComponent('Your CV is Under Review — Thank You for Applying');
      const body = encodeURIComponent(
        `Dear ${c.firstName},\n\nThank you for applying for the ${c.appliedPosition || 'position'} role at our organisation.\n\nWe have received your CV and it is currently under review. Our recruitment team will be in touch with you shortly regarding the next steps.\n\nBest regards,\nRecruitment Team`
      );
      window.open(`mailto:${c.email}?subject=${subject}&body=${body}`);
    }

    const now = new Date().toISOString();
    setStore(STORAGE_KEYS.CANDIDATES, getStore(STORAGE_KEYS.CANDIDATES).map(x =>
      x.id === c.id ? {
        ...x,
        status: 'Email Sent',
        timeline: [...(x.timeline || []), { action: 'Acknowledgement email sent', by: user.id, at: now }],
      } : x
    ));
    addLog('Email Sent', user.id, `Acknowledgement email sent to ${c.firstName} ${c.lastName}`);
    forceUpdate(n => n + 1);
  }

  function approveOutsourced(id) {
    if (!window.confirm('Approve this candidate? They will be moved to New Candidates.')) return;
    const all = getStore(STORAGE_KEYS.CANDIDATES);
    const now = new Date().toISOString();
    setStore(STORAGE_KEYS.CANDIDATES, all.map(c => c.id === id ? { 
      ...c, 
      status: 'New Candidate',
      timeline: [...(c.timeline || []), { action: 'Application Approved', by: user.id, at: now }]
    } : c));
    addLog('Candidate Approved', user.id, `Approved outsourced candidate`);
    forceUpdate(n => n + 1);
  }

  function rejectOutsourced(id) {
    if (!window.confirm('Reject this candidate?')) return;
    const all = getStore(STORAGE_KEYS.CANDIDATES);
    const now = new Date().toISOString();
    setStore(STORAGE_KEYS.CANDIDATES, all.map(c => c.id === id ? { 
      ...c, 
      status: 'Rejected',
      timeline: [...(c.timeline || []), { action: 'Application Rejected', by: user.id, at: now }]
    } : c));
    addLog('Candidate Rejected', user.id, `Rejected outsourced candidate`);
    forceUpdate(n => n + 1);
  }

  function getLatestInterview(candidateId) {
    return interviews.filter(i => i.candidateId === candidateId).sort((a, b) => b.date?.localeCompare(a.date))[0];
  }

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-end justify-between pb-6 border-b border-[var(--theme-linen)]">
        <div>
          <p className="text-[10px] font-semibold text-[#a8a29e] uppercase tracking-widest mb-1">Recruitment</p>
          <h1 className="text-xl font-semibold text-[var(--theme-aubergine)]">Candidates</h1>
          <p className="text-sm text-[#a8a29e] mt-0.5">{filtered.length} candidate{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex items-center gap-2">
          {isOnlyHR && (
            <div className="flex gap-0.5 bg-[#f0ebe2] rounded-lg p-1">
              <button
                onClick={() => setMyView(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${myView ? 'bg-[var(--theme-cream)] text-[var(--theme-aubergine)] shadow-sm' : 'text-[var(--theme-taupe)] hover:text-[var(--theme-aubergine)]'}`}
              >
                <UserCheck size={13} /> Mine
              </button>
              <button
                onClick={() => setMyView(false)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${!myView ? 'bg-[var(--theme-cream)] text-[var(--theme-aubergine)] shadow-sm' : 'text-[var(--theme-taupe)] hover:text-[var(--theme-aubergine)]'}`}
              >
                <Users2 size={13} /> All
              </button>
            </div>
          )}
          {isHR && (() => {
            const statusParam = new URLSearchParams(location.search).get('status');
            const disableAdd = statusParam === 'Email Sent' || statusParam === 'Outsourced';
            return (
              <button 
                className={`btn btn-primary btn-sm ${disableAdd ? 'opacity-50 cursor-not-allowed' : ''}`} 
                onClick={() => !disableAdd && navigate('/candidates/add')}
                disabled={disableAdd}
              >
                <Plus size={13} /> Add Candidate
              </button>
            );
          })()}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
          <input className="input pl-9 h-9 text-xs" placeholder="Search by name, position, email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto h-9 text-xs" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d}>{d}</option>)}
        </select>
        <select 
          className="input w-auto h-9 text-xs disabled:opacity-60 disabled:cursor-not-allowed" 
          value={filterStatus} 
          onChange={e => setFilterStatus(e.target.value)}
          disabled={!!new URLSearchParams(location.search).get('status')}
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="input w-auto h-9 text-xs" value={filterRound} onChange={e => setFilterRound(e.target.value)}>
          <option value="">All Rounds</option>
          {ROUNDS.map(r => <option key={r}>{r}</option>)}
        </select>
        <input
          type="date"
          className="input w-auto h-9 text-xs"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          title="Filter by date added"
        />
        <button
          className={`btn btn-sm ${showArchived ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setShowArchived(v => !v)}
        >
          <Archive size={12} /> {showArchived ? 'Active' : 'Archived'}
        </button>
      </div>

      {/* Cards or Table */}
      {filtered.length === 0 ? (
        <div className="bg-[var(--theme-cream)] rounded-2xl border border-[var(--theme-linen)] shadow-card py-20 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--theme-sidebar-bg)] border border-[var(--theme-linen)] flex items-center justify-center mb-4">
            <Users size={18} className="text-[#d4cdc4]" />
          </div>
          <p className="text-sm font-medium text-[var(--theme-taupe)]">No candidates found</p>
          <p className="text-xs text-[#a8a29e] mt-1">Try adjusting your filters.</p>
        </div>
      ) : filterStatus === 'Outsourced' ? (
        <div className="bg-[var(--theme-cream)] rounded-2xl border border-[var(--theme-linen)] shadow-card overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f0ebe2] text-[var(--theme-taupe)] font-medium border-b border-[var(--theme-linen)]">
              <tr>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e2d9]">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-[var(--theme-sidebar-bg)] transition-colors">
                  <td className="px-4 py-3 font-medium text-[var(--theme-aubergine)]">{c.firstName} {c.lastName}</td>
                  <td className="px-4 py-3 text-[var(--theme-taupe)]">{c.email}</td>
                  <td className="px-4 py-3 text-[var(--theme-taupe)]">{c.appliedPosition || '—'}</td>
                  <td className="px-4 py-3 text-[var(--theme-taupe)]">{c.department || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/candidates/${c.id}`)}>
                        <Eye size={12} className="mr-1" /> View
                      </button>
                      {isHR && (
                        <>
                          <button className="btn btn-secondary btn-sm text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100" onClick={() => approveOutsourced(c.id)}>
                            Approve
                          </button>
                          <button className="btn btn-secondary btn-sm text-red-600 border-red-200 bg-red-50 hover:bg-red-100" onClick={() => rejectOutsourced(c.id)}>
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(c => {
            const iv = getLatestInterview(c.id);
            const hasScheduledInterview = !!iv;
            const ownerId = c.assignedTo || c.createdBy;
            const owner = getStore(STORAGE_KEYS.EMPLOYEES).find(e => e.id === ownerId);
            const ownerName = owner ? `${owner.firstName} ${owner.lastName}` : null;
            const initials = `${c.firstName?.[0] || ''}${c.lastName?.[0] || ''}`;
            return (
              <CandidateCard
                key={c.id}
                c={c}
                initials={initials}
                ownerName={ownerName}
                hasScheduledInterview={hasScheduledInterview}
                isHR={isHR}
                isOnlyHR={isOnlyHR}
                showOwner={isHeadHR(user) || (isOnlyHR && !myView)}
                user={user}
                onView={() => navigate(`/candidates/${c.id}`)}
                onEdit={() => navigate(`/candidates/${c.id}/edit`)}
                onSchedule={() => navigate(`/candidates/${c.id}/schedule`)}
                onOpenResume={() => openResumePreview(c)}
                onArchive={() => archive(c.id)}
                onSendEmail={() => sendEmail(c)}
              />
            );
          })}
        </div>
      )}
      
      <ResumePreviewModal
        isOpen={!!previewResume}
        onClose={() => setPreviewResume(null)}
        resumeDataUrl={previewResume?.resume}
        candidateName={previewResume ? `${previewResume.firstName} ${previewResume.lastName}` : ''}
      />
    </div>
  );
}

function CandidateCard({ c, initials, ownerName, hasScheduledInterview, isHR, isOnlyHR, showOwner, user, onView, onEdit, onSchedule, onOpenResume, onArchive, onSendEmail }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="bg-[var(--theme-cream)] rounded-2xl border border-[var(--theme-linen)] shadow-card hover:shadow-card-hover hover:border-[var(--theme-linen)] transition-all duration-200 flex flex-col">
      {/* Avatar + name */}
      <div className="flex flex-col items-center pt-6 pb-4 px-4">
        <div className="w-10 h-10 rounded-full bg-[#f0ebe2] flex items-center justify-center text-[var(--theme-taupe)] font-semibold text-sm mb-3 select-none">
          {initials}
        </div>
        <p className="text-sm font-medium text-[var(--theme-aubergine)] text-center leading-tight">{c.firstName} {c.lastName}</p>
        <p className="text-xs text-[#a8a29e] text-center mt-0.5 truncate w-full">{c.appliedPosition || '—'}</p>
        <div className="mt-2.5">
          <StatusBadge status={c.status} />
        </div>
      </div>

      <div className="border-t border-[#f5f1eb] mx-4" />

      {/* Meta */}
      <div className="px-4 py-3 space-y-1.5 flex-1">
        {c.department && (
          <p className="text-xs text-[#a8a29e] truncate">{c.department}</p>
        )}
        {ownerName && (
          <p className="text-xs text-[#a8a29e] truncate">HR: {ownerName}</p>
        )}
        {isOnlyHR && c.assignedTo === user.id && c.createdBy !== user.id && (
          <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded inline-block">Assigned to you</span>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-1.5">
        <button className="btn btn-secondary btn-sm flex-1" onClick={onView}>
          <Eye size={12} /> View
        </button>
        {(c.status === 'New Candidate' || c.status === 'Email Sent') && (
          <button
            className="btn btn-secondary btn-sm px-2"
            title="Send acknowledgement email"
            onClick={onSendEmail}
          >
            <Mail size={12} className={c.status === 'Email Sent' ? 'text-emerald-500' : 'text-primary'} />
          </button>
        )}
        <div className="relative" ref={ref}>
          <button className="btn btn-secondary btn-sm px-2" onClick={() => setOpen(o => !o)}>
            <MoreVertical size={12} />
          </button>
          {open && (
            <div className="absolute right-0 bottom-full mb-1 w-48 bg-[var(--theme-cream)] border border-[var(--theme-linen)] rounded-xl shadow-modal z-50 py-1.5">
              {isHR && (
                <button className="w-full text-left px-4 py-2 text-xs text-[var(--theme-taupe)] hover:bg-[var(--theme-sidebar-bg)] flex items-center gap-2" onClick={() => { setOpen(false); onEdit(); }}>
                  <Pencil size={12} /> Edit
                </button>
              )}
              {isHR && (
                <button className="w-full text-left px-4 py-2 text-xs text-[var(--theme-taupe)] hover:bg-[var(--theme-sidebar-bg)] flex items-center gap-2" onClick={() => { setOpen(false); onSchedule(); }}>
                  <CalendarDays size={12} /> {hasScheduledInterview ? 'Reschedule' : 'Schedule Interview'}
                </button>
              )}
              {(c.status === 'New Candidate' || c.status === 'Email Sent') && (
                <button className="w-full text-left px-4 py-2 text-xs text-[var(--theme-taupe)] hover:bg-[var(--theme-sidebar-bg)] flex items-center gap-2" onClick={() => { setOpen(false); onSendEmail(); }}>
                  <Mail size={12} /> {c.status === 'Email Sent' ? 'Resend Email' : 'Send Email'}
                </button>
              )}
              <button className="w-full text-left px-4 py-2 text-xs text-[var(--theme-taupe)] hover:bg-[var(--theme-sidebar-bg)] flex items-center gap-2" onClick={() => { setOpen(false); onOpenResume(); }}>
                <Eye size={12} /> View Resume
              </button>
              {isHR && c.status !== 'archived' && (
                <button className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 flex items-center gap-2" onClick={() => { setOpen(false); onArchive(); }}>
                  <Archive size={12} /> Archive
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
