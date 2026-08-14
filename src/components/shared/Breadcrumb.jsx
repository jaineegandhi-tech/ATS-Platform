import { useLocation, Link } from 'react-router-dom';
import { getStore, STORAGE_KEYS } from '../../utils/store';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS = {
  'dashboard':           'Dashboard',
  'job-openings':        'Job Openings',
  'candidates':          'Candidates',
  'add':                 'Add Candidate',
  'edit':                'Edit',
  'schedule':            'Schedule Interview',
  'interview-calendar':  'Interview Calendar',
  'interview-schedule':  'Interview Schedule',
  'interview-feedback':  'Interview Feedback',
  'approvals':           'Interview Activity',
  'reports':             'Reports',
  'pipeline':            'Pipeline',
  'roles-permissions':   'Roles & Permissions',
  'resume-info':         'Resume Parser',
  'telephony-interview': 'Telephonic Interviews',
};

function resolveLabel(segment, index, segments) {
  if (index > 0 && segments[index - 1] === 'candidates' && !ROUTE_LABELS[segment]) {
    const candidates = getStore(STORAGE_KEYS.CANDIDATES);
    const c = candidates.find(x => x.id === segment);
    return c ? `${c.firstName} ${c.lastName}` : segment;
  }
  if (index > 0 && segments[index - 1] === 'interview-feedback' && !ROUTE_LABELS[segment]) {
    const interviews = getStore(STORAGE_KEYS.INTERVIEWS);
    const iv = interviews.find(x => x.id === segment);
    if (iv) {
      const c = getStore(STORAGE_KEYS.CANDIDATES).find(x => x.id === iv.candidateId);
      return c ? `${c.firstName} ${c.lastName}` : segment;
    }
    return segment;
  }
  return ROUTE_LABELS[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function Breadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0 || (segments.length === 1 && segments[0] === 'dashboard')) return null;

  const crumbs = [
    { label: 'Home', to: '/dashboard' },
    ...segments.map((seg, i) => ({
      label: resolveLabel(seg, i, segments),
      to: '/' + segments.slice(0, i + 1).join('/'),
    })),
  ];

  return (
    <nav className="flex items-center gap-1 text-xs mb-4" style={{ color: 'var(--theme-taupe)' }}>
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.to} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={12} style={{ color: 'var(--theme-linen)' }} className="flex-shrink-0" />}
            {i === 0 && <Home size={11} style={{ color: 'var(--theme-taupe)' }} className="flex-shrink-0" />}
            {isLast ? (
              <span className="font-medium capitalize" style={{ color: 'var(--theme-aubergine)' }}>{crumb.label}</span>
            ) : (
              <Link
                to={crumb.to}
                className="capitalize transition-colors"
                style={{ color: 'var(--theme-taupe)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--theme-mustard)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--theme-taupe)'}
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
