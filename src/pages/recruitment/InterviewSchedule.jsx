import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStore, setStore, STORAGE_KEYS, addLog, addRecruitmentNotification, getInterviewConflict } from '../../utils/store';
import { useStorageSync } from '../../utils/useStorageSync';
import { formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/shared/StatusBadge';
import Modal from '../../components/shared/Modal';
import { Eye, Star, X, Pencil, Plus, Search } from 'lucide-react';
import { isRecruiter } from '../../utils/roles';
import Pagination, { PAGE_SIZE } from '../../components/shared/Pagination';

const ROUNDS = ['HR Round', 'Technical Round', 'Managerial Round', 'Final Round'];
const MODES = ['Offline', 'Online'];

export default function InterviewSchedule() {
  useStorageSync();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isHR = isRecruiter(user);
  const [filterDate, setFilterDate] = useState('');
  const [filterRound, setFilterRound] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [editError, setEditError] = useState('');
  const [cancelId, setCancelId] = useState(null);
  const [, forceUpdate] = useState(0);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [page, setPage] = useState(1);

  const interviews = getStore(STORAGE_KEYS.INTERVIEWS);
  const candidates = getStore(STORAGE_KEYS.CANDIDATES);
  const employees = getStore(STORAGE_KEYS.EMPLOYEES);

  // Management sees only assigned interviews
  const visible = isHR
    ? interviews
    : interviews.filter(i => i.interviewerIds?.includes(user.id));

  const filtered = visible.filter(i => {
    return (!filterDate || i.date === filterDate) &&
      (!filterRound || i.round === filterRound) &&
      (!filterStatus || i.status === filterStatus);
  }).sort((a, b) => b.date?.localeCompare(a.date));

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function getCandidate(cid) { return candidates.find(c => c.id === cid); }
  function getEmpName(eid) { const e = employees.find(x => x.id === eid); return e ? `${e.firstName} ${e.lastName}` : eid; }

  function cancelInterview() {
    const all = getStore(STORAGE_KEYS.INTERVIEWS);
    const iv = all.find(i => i.id === cancelId);
    const candidateId = iv?.candidateId;
    
    // Cancel the interview
    setStore(STORAGE_KEYS.INTERVIEWS, all.map(i => i.id === cancelId ? { ...i, status: 'cancelled' } : i));
    
    // Check if candidate has any other active interviews
    const remainingInterviews = getStore(STORAGE_KEYS.INTERVIEWS).filter(i => i.candidateId === candidateId && i.status !== 'cancelled');
    
    // If no active interviews, revert candidate status to "New Candidate"
    if (remainingInterviews.length === 0) {
      const allCandidates = getStore(STORAGE_KEYS.CANDIDATES);
      const now = new Date().toISOString();
      setStore(STORAGE_KEYS.CANDIDATES, allCandidates.map(c => c.id === candidateId ? {
        ...c,
        status: 'New Candidate',
        currentRound: null,
        timeline: [...(c.timeline || []), { action: 'All interviews cancelled - status reverted to New Candidate', by: user.id, at: now }],
      } : c));
    }
    
    addLog('Interview Cancelled', user.id, `Interview cancelled for candidate ${candidateId}`);
    iv?.interviewerIds?.forEach(iid => {
      addRecruitmentNotification(iid, `Interview for ${getCandidate(iv.candidateId)?.firstName} ${getCandidate(iv.candidateId)?.lastName} has been cancelled.`, 'interview_cancelled', cancelId);
    });
    setCancelId(null);
    forceUpdate(n => n + 1);
  }

  function saveEdit() {
    const conflict = getInterviewConflict(editModal.date, editModal.time, editModal.id);
    if (conflict) {
      const cand = candidates.find(c => c.id === conflict.candidateId);
      setEditError(`Time slot already booked — ${cand ? `${cand.firstName} ${cand.lastName}` : conflict.candidateId} has an interview at this time.`);
      return;
    }
    setEditError('');
    const all = getStore(STORAGE_KEYS.INTERVIEWS);
    setStore(STORAGE_KEYS.INTERVIEWS, all.map(i => i.id === editModal.id ? editModal : i));
    addLog('Interview Rescheduled', user.id, `Interview rescheduled`);
    editModal.interviewerIds?.forEach(iid => {
      addRecruitmentNotification(iid, `Interview has been rescheduled to ${editModal.date} at ${editModal.time}.`, 'interview_rescheduled', editModal.id);
    });
    setEditModal(null);
    forceUpdate(n => n + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between pb-6 border-b border-[var(--theme-linen)]">
        <div>
          <p className="text-[10px] font-semibold text-[#a8a29e] uppercase tracking-widest mb-1">Recruitment</p>
          <h1 className="text-xl font-semibold text-[var(--theme-aubergine)]">Interview Schedule</h1>
        </div>
        {isHR && (
          <button className="btn btn-primary btn-sm" onClick={() => { setScheduleModal(true); setCandidateSearch(''); setSelectedCandidateId(''); }}>
            <Plus size={13} /> Schedule Interview
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
          <input type="date" className="input h-9 text-xs w-auto" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          <select className="input h-9 text-xs w-auto" value={filterRound} onChange={e => setFilterRound(e.target.value)}>
            <option value="">All Rounds</option>
            {ROUNDS.map(r => <option key={r}>{r}</option>)}
          </select>
          <select className="input h-9 text-xs w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {['scheduled', 'completed', 'cancelled'].map(s => <option key={s} className="capitalize">{s}</option>)}
          </select>
        </div>

      <div className="bg-[var(--theme-cream)] rounded-2xl border border-[var(--theme-linen)] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[var(--theme-linen)]">
              <tr>{['Candidate', 'Position', 'Round', 'Date', 'Time', 'Mode', 'Interviewer(s)', 'Status', 'Actions'].map(h => <th key={h} className="table-th">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-[#f5f1eb]">
              {paginated.length === 0 ? (
                <tr><td colSpan={9} className="table-td text-center py-12 text-[#a8a29e]">No interviews found.</td></tr>
              ) : paginated.map(iv => {
                const cand = getCandidate(iv.candidateId);
                return (
                  <tr key={iv.id} className="hover:bg-[var(--theme-sidebar-bg)] transition-colors">
                    <td className="table-td font-medium text-[var(--theme-aubergine)]">{cand?.firstName} {cand?.lastName}</td>
                    <td className="table-td">{cand?.appliedPosition}</td>
                    <td className="table-td">{iv.round}</td>
                    <td className="table-td">{formatDate(iv.date)}</td>
                    <td className="table-td">{iv.time}</td>
                    <td className="table-td">{iv.mode}</td>
                    <td className="table-td text-xs">{iv.interviewerIds?.map(getEmpName).join(', ') || '—'}</td>
                    <td className="table-td"><StatusBadge status={iv.status} /></td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        <button className="btn btn-sm btn-secondary" title="View Candidate" onClick={() => navigate(`/candidates/${iv.candidateId}`)}><Eye size={13} /></button>
                        {iv.status !== 'cancelled' && <button className="btn btn-sm btn-secondary" title="Feedback" onClick={() => navigate(`/interview-feedback/${iv.id}`)}><Star size={13} /></button>}
                        {isHR && iv.status === 'scheduled' && (
                          <>
                            <button className="btn btn-sm btn-secondary" title="Reschedule" onClick={() => { setEditError(''); setEditModal({ ...iv }); }}><Pencil size={13} /></button>
                            <button className="btn btn-sm btn-danger" title="Cancel" onClick={() => setCancelId(iv.id)}><X size={13} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 pb-4">
          <Pagination total={filtered.length} page={page} onPage={p => { setPage(p); }} />
        </div>
      </div>

      {/* Reschedule Modal */}
      {editModal && (
        <Modal title="Reschedule Interview" onClose={() => { setEditModal(null); setEditError(''); }}>
          <div className="space-y-4">
            {editError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-red-600">{editError}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Date</label><input type="date" className="input" value={editModal.date} onChange={e => setEditModal(m => ({ ...m, date: e.target.value }))} /></div>
              <div><label className="label">Time</label><input type="time" className="input" value={editModal.time} onChange={e => setEditModal(m => ({ ...m, time: e.target.value }))} /></div>
              <div>
                <label className="label">Mode</label>
                <select className="input" value={editModal.mode} onChange={e => setEditModal(m => ({ ...m, mode: e.target.value }))}>
                  {MODES.map(mo => <option key={mo}>{mo}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Round</label>
                <select className="input" value={editModal.round} onChange={e => setEditModal(m => ({ ...m, round: e.target.value }))}>
                  {ROUNDS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              {editModal.mode === 'Online' && <div className="col-span-2"><label className="label">Meeting Link</label><input className="input" value={editModal.meetingLink || ''} onChange={e => setEditModal(m => ({ ...m, meetingLink: e.target.value }))} /></div>}
              {editModal.mode === 'Offline' && <div className="col-span-2"><label className="label">Location</label><input className="input" value={editModal.location || ''} onChange={e => setEditModal(m => ({ ...m, location: e.target.value }))} /></div>}
            </div>
            <div className="flex justify-end gap-3">
              <button className="btn-secondary btn" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="btn-primary btn" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Schedule Interview — Candidate Picker */}
      {scheduleModal && (
        <Modal title="Schedule Interview" onClose={() => setScheduleModal(false)} size="sm">
          <div className="space-y-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
              <input
                className="input pl-9"
                placeholder="Search candidate by name or position..."
                value={candidateSearch}
                onChange={e => { setCandidateSearch(e.target.value); setSelectedCandidateId(''); }}
                autoFocus
              />
            </div>
            <div className="max-h-56 overflow-y-auto border border-[var(--theme-linen)] rounded-lg divide-y divide-[#f5f1eb]">
              {candidates
                .filter(c => c.status !== 'archived' && (
                  !candidateSearch ||
                  `${c.firstName} ${c.lastName}`.toLowerCase().includes(candidateSearch.toLowerCase()) ||
                  c.appliedPosition?.toLowerCase().includes(candidateSearch.toLowerCase())
                ))
                .map(c => (
                  <button
                    key={c.id}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--theme-sidebar-bg)] transition-colors ${
                      selectedCandidateId === c.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-[var(--theme-aubergine)]'
                    }`}
                    onClick={() => setSelectedCandidateId(c.id)}
                  >
                    <span className="font-medium">{c.firstName} {c.lastName}</span>
                    <span className="text-xs text-[#a8a29e] ml-2">{c.appliedPosition}</span>
                  </button>
                ))
              }
            </div>
            <div className="flex justify-end gap-3">
              <button className="btn-secondary btn" onClick={() => setScheduleModal(false)}>Cancel</button>
              <button
                className="btn-primary btn"
                disabled={!selectedCandidateId}
                onClick={() => { setScheduleModal(false); navigate(`/candidates/${selectedCandidateId}/schedule`); }}
              >
                Continue
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Confirm */}
      {cancelId && (
        <Modal title="Cancel Interview" onClose={() => setCancelId(null)} size="sm">
          <p className="text-sm text-[var(--theme-taupe)] mb-4">Are you sure you want to cancel this interview? Interviewers will be notified.</p>
          <div className="flex justify-end gap-3">
            <button className="btn-secondary btn" onClick={() => setCancelId(null)}>No</button>
            <button className="btn-danger btn" onClick={cancelInterview}>Yes, Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
