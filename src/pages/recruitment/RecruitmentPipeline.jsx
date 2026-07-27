import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStore, setStore, STORAGE_KEYS, syncCandidateStatuses } from '../../utils/store';
import { useStorageSync } from '../../utils/useStorageSync';
import StatusBadge from '../../components/shared/StatusBadge';
import { CheckCircle, Eye, GitBranch } from 'lucide-react';
import { ROLES } from '../../utils/roles';

const PIPELINE_STAGES = [
  { key: 'new',          label: 'New',          statuses: ['New Candidate'] },
  { key: 'scheduled',   label: 'Scheduled',     statuses: ['Interview Scheduled', 'Next Round Scheduled'] },
  { key: 'in-progress', label: 'In Progress',   statuses: ['Interview Completed', 'On Hold', 'Screening', 'Interview In Progress'] },
  { key: 'passed',      label: 'Passed',        statuses: ['Passed'] },
  { key: 'offer',       label: 'Offer Stage',   statuses: ['Selected', 'Offered', 'Offer Sent', 'Offer Accepted', 'Offer Declined'] },
  { key: 'final',       label: 'Final',         statuses: ['Joined', 'Rejected', 'Failed', 'Not Joined'] },
];

export default function RecruitmentPipeline() {
  useStorageSync();
  syncCandidateStatuses();

  const { user } = useAuth();
  const navigate = useNavigate();
  const interviews = getStore(STORAGE_KEYS.INTERVIEWS);
  const allCandidates = getStore(STORAGE_KEYS.CANDIDATES).filter(c => c.status !== 'archived');
  const candidates = allCandidates.filter(c => {
    if (user?.role === ROLES.HR) return !c.assignedTo || c.assignedTo === user.id || c.createdBy === user.id;
    if (user?.role === ROLES.INTERVIEWER) return interviews.some(i => i.candidateId === c.id && i.interviewerIds?.includes(user.id));
    if (user?.role === ROLES.RECEPTIONIST) return interviews.some(i => i.candidateId === c.id);
    if (user?.role === ROLES.IT) return ['Selected', 'Offered', 'Offer Sent', 'Offer Accepted', 'Joined', 'Rejected', 'Failed', 'Not Joined'].includes(c.status);
    return true;
  });

  function markAccessComplete(candidateId) {
    setStore(STORAGE_KEYS.CANDIDATES, getStore(STORAGE_KEYS.CANDIDATES).map(c => c.id === candidateId ? { ...c, accessSetupComplete: true } : c));
  }

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="pb-6 border-b border-gray-100">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Recruitment</p>
        <h1 className="text-xl font-semibold text-gray-900">Pipeline</h1>
        <p className="text-sm text-gray-400 mt-0.5">{candidates.length} candidate{candidates.length !== 1 ? 's' : ''} across all stages</p>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {PIPELINE_STAGES.map(stage => {
          const stageCandidates = candidates.filter(c =>
            stage.statuses.map(s => s.toLowerCase()).includes(c.status?.toLowerCase())
          );
          return (
            <div key={stage.key} className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden flex flex-col">

              {/* Column header */}
              <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{stage.label}</p>
                <span className="text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                  {stageCandidates.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-3 space-y-2 flex-1 min-h-[140px]">
                {stageCandidates.length === 0 ? (
                  <div className="flex items-center justify-center h-full py-6">
                    <p className="text-xs text-gray-300">No candidates</p>
                  </div>
                ) : stageCandidates.map(c => (
                  <div
                    key={c.id}
                    className="bg-gray-50 border border-gray-100 rounded-xl p-3 hover:border-gray-200 hover:bg-white transition-all duration-150"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-800 truncate">{c.firstName} {c.lastName}</p>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{c.appliedPosition}</p>
                        {c.joiningDetails?.joiningDate && (
                          <p className="text-[10px] text-emerald-600 mt-0.5">Joining: {c.joiningDetails.joiningDate}</p>
                        )}
                        {c.currentRound && (
                          <p className="text-[10px] text-blue-500 mt-0.5">{c.currentRound}</p>
                        )}
                        {c.status === 'Interview Completed' && (() => {
                          const latestIv = interviews
                            .filter(i => i.candidateId === c.id && i.status === 'completed' && i.feedback && !i.feedback.isDraft)
                            .sort((a, b) => (b.feedback?.submittedAt || '').localeCompare(a.feedback?.submittedAt || ''))[0];
                          return latestIv ? (
                            <p className="text-[10px] text-amber-600 mt-0.5">{latestIv.feedback.decision} · Awaiting HR</p>
                          ) : null;
                        })()}
                      </div>
                      <button
                        className="btn btn-xs btn-secondary flex-shrink-0 px-1.5"
                        onClick={() => navigate(`/candidates/${c.id}`)}
                      >
                        <Eye size={10} />
                      </button>
                    </div>
                    <div className="mt-2">
                      <StatusBadge status={c.status} />
                    </div>
                    {user?.role === ROLES.IT && !c.accessSetupComplete && (
                      <button
                        className="btn btn-xs btn-primary mt-2 w-full"
                        onClick={() => markAccessComplete(c.id)}
                      >
                        <CheckCircle size={10} /> Mark Access Complete
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
