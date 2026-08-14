export default function StatusBadge({ status }) {
  const map = {
    active:                 'badge-green',
    inactive:               'badge-red',
    approved:               'badge-green',
    rejected:               'badge-red',
    pending:                'badge-yellow',
    cancelled:              'badge-gray',
    present:                'badge-green',
    absent:                 'badge-red',
    late:                   'badge-yellow',
    'half-day':             'badge-yellow',
    working:                'badge-green',
    'on break':             'badge-yellow',
    'checked out':          'badge-gray',
    // Recruitment
    'new candidate':        'badge-yellow',
    'email sent':           'badge-yellow',
    'interview scheduled':  'badge-amber',
    'interview completed':  'badge-amber',
    passed:                 'badge-green',
    failed:                 'badge-red',
    'on hold':              'badge-yellow',
    selected:               'badge-green',
    offered:                'badge-amber',
    'next round scheduled': 'badge-amber',
    'offer sent':           'badge-amber',
    'offer accepted':       'badge-green',
    'offer declined':       'badge-red',
    joined:                 'badge-green',
    archived:               'badge-gray',
    scheduled:              'badge-amber',
    completed:              'badge-gray',
    // Assets
    available:              'badge-green',
    assigned:               'badge-amber',
    returned:               'badge-gray',
    'under maintenance':    'badge-yellow',
    lost:                   'badge-red',
    damaged:                'badge-red',
  };
  // DS dot colors — warm palette only
  const dot = {
    'badge-green':  '#16a34a',
    'badge-red':    '#dc2626',
    'badge-yellow': 'var(--theme-mustard)',
    'badge-amber':  'var(--theme-terracotta)',
    'badge-gray':   'var(--theme-taupe)',
  };
  const cls = map[status?.toLowerCase()] || 'badge-gray';
  return (
    <span className={`badge ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: dot[cls] }} />
      {status}
    </span>
  );
}
