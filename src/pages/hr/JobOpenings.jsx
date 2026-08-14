import { useMemo, useState } from 'react';
import { Briefcase, CheckCircle, Minus, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { STORAGE_KEYS, addLog, getStore, setStore } from '../../utils/store';
import { isHeadHR } from '../../utils/roles';
import { formatDate } from '../../utils/helpers';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const DEPARTMENTS = ['Human Resources', 'Engineering', 'Marketing', 'Sales', 'Finance', 'Operations', 'Design', 'Product'];

function OpeningModal({ opening, user, onClose, onSaved }) {
  const [form, setForm] = useState(() => opening || { positionName: '', department: '', openings: 1, filled: 0, status: 'open' });
  const [error, setError] = useState('');

  function set(field, value) { setForm(current => ({ ...current, [field]: value })); }

  function handleSubmit(e) {
    e.preventDefault();
    const positionName = form.positionName.trim();
    const openings = Number(form.openings);
    const filled = Number(form.filled);
    if (!positionName) return setError('Please enter a position name.');
    if (!form.department) return setError('Please select a department.');
    if (!Number.isInteger(openings) || openings < 0) return setError('Openings must be 0 or more.');
    if (!Number.isInteger(filled) || filled < 0) return setError('Filled positions must be 0 or more.');
    if (filled > openings) return setError('Filled positions cannot be greater than total openings.');
    const all = getStore(STORAGE_KEYS.JOB_OPENINGS);
    const updatedAt = new Date().toISOString();
    const updatedBy = `${user.firstName} ${user.lastName}`;
    const payload = { ...form, positionName, openings, filled, status: filled >= openings ? 'filled' : 'open', updatedAt, updatedBy };
    const updated = opening
      ? all.map(item => item.id === opening.id ? { ...item, ...payload } : item)
      : [{ id: `JOB${Date.now()}`, ...payload }, ...all];
    setStore(STORAGE_KEYS.JOB_OPENINGS, updated);
    addLog(opening ? 'Job Opening Updated' : 'Job Opening Added', user.id, `${updatedBy} ${opening ? 'updated' : 'added'} ${positionName}`);
    onSaved();
  }

  return (
    <Modal title={opening ? 'Update Job Opening' : 'Add Job Opening'} onClose={onClose} size="lg">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="label">Position Name</label>
          <input className="input" value={form.positionName} onChange={e => set('positionName', e.target.value)} placeholder="e.g. Senior React Developer" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Department</label>
            <select className="input" value={form.department} onChange={e => set('department', e.target.value)}>
              <option value="">Select department</option>
              {DEPARTMENTS.map(dept => <option key={dept}>{dept}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Total Openings</label>
            <input className="input" type="number" min="0" value={form.openings} onChange={e => set('openings', e.target.value)} />
          </div>
          <div>
            <label className="label">Filled Positions</label>
            <input className="input" type="number" min="0" value={form.filled} onChange={e => set('filled', e.target.value)} />
          </div>
        </div>
        {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        <div className="flex justify-end gap-2 pt-2 border-t border-[#f5f1eb]">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save Opening</button>
        </div>
      </form>
    </Modal>
  );
}

export default function JobOpenings() {
  const { user } = useAuth();
  const canManage = isHeadHR(user);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [, forceUpdate] = useState(0);

  const openings = getStore(STORAGE_KEYS.JOB_OPENINGS);
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return openings.filter(item => !q || `${item.positionName} ${item.department} ${item.status}`.toLowerCase().includes(q));
  }, [openings, search]);

  function refresh() { setEditing(null); setShowCreate(false); setDeleteTarget(null); forceUpdate(n => n + 1); }

  function updateFilled(opening, delta) {
    const nextFilled = Math.min(opening.openings, Math.max(0, opening.filled + delta));
    const updatedBy = `${user.firstName} ${user.lastName}`;
    const updated = getStore(STORAGE_KEYS.JOB_OPENINGS).map(item => item.id === opening.id
      ? { ...item, filled: nextFilled, status: nextFilled >= item.openings ? 'filled' : 'open', updatedAt: new Date().toISOString(), updatedBy }
      : item);
    setStore(STORAGE_KEYS.JOB_OPENINGS, updated);
    addLog('Job Opening Updated', user.id, `${updatedBy} updated filled count for ${opening.positionName}`);
    forceUpdate(n => n + 1);
  }

  function handleDelete() {
    const updatedBy = `${user.firstName} ${user.lastName}`;
    setStore(STORAGE_KEYS.JOB_OPENINGS, getStore(STORAGE_KEYS.JOB_OPENINGS).filter(item => item.id !== deleteTarget.id));
    addLog('Job Opening Deleted', user.id, `${updatedBy} deleted ${deleteTarget.positionName}`);
    refresh();
  }

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-end justify-between pb-6 border-b border-[var(--theme-linen)]">
        <div>
          <p className="text-[10px] font-semibold text-[#a8a29e] uppercase tracking-widest mb-1">Recruitment</p>
          <h1 className="text-xl font-semibold text-[var(--theme-aubergine)]">Job Openings</h1>
          <p className="text-sm text-[#a8a29e] mt-0.5">
            {canManage ? 'Manage open positions and track hiring progress.' : 'View active positions across the organisation.'}
          </p>
        </div>
        {canManage && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
            <Plus size={13} /> Add Opening
          </button>
        )}
      </div>

      {/* Search + badge */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
          <input className="input pl-9 h-9 text-xs" placeholder="Search by position or department..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className={`badge ${canManage ? 'badge-blue' : 'badge-gray'} text-[10px]`}>
          {canManage ? 'Head HR' : 'View only'}
        </span>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="bg-[var(--theme-cream)] rounded-2xl border border-[var(--theme-linen)] shadow-card py-20 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--theme-sidebar-bg)] border border-[var(--theme-linen)] flex items-center justify-center mb-4">
            <Briefcase size={18} className="text-[#d4cdc4]" />
          </div>
          <p className="text-sm font-medium text-[var(--theme-taupe)]">No job openings found</p>
          <p className="text-xs text-[#a8a29e] mt-1">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(opening => {
            const remaining = Math.max(0, opening.openings - opening.filled);
            const isFilled = remaining === 0;
            const fillPct = opening.openings > 0 ? Math.round((opening.filled / opening.openings) * 100) : 0;
            return (
              <div key={opening.id} className="bg-[var(--theme-cream)] rounded-2xl border border-[var(--theme-linen)] shadow-card hover:shadow-card-hover hover:border-[var(--theme-linen)] transition-all duration-200 p-5 flex flex-col gap-4">

                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-[var(--theme-aubergine)] truncate">{opening.positionName}</h2>
                    <p className="text-xs text-[#a8a29e] mt-0.5">{opening.department}</p>
                  </div>
                  <span className={`badge flex-shrink-0 ${isFilled ? 'badge-green' : 'badge-blue'}`}>
                    {isFilled ? 'Filled' : 'Open'}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-[#a8a29e] mb-1.5">
                    <span>{opening.filled} filled</span>
                    <span>{remaining} remaining</span>
                  </div>
                  <div className="h-1.5 bg-[#f0ebe2] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isFilled ? 'bg-emerald-400' : 'bg-blue-400'}`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  {[['Remaining', remaining], ['Filled', opening.filled], ['Total', opening.openings]].map(([label, val]) => (
                    <div key={label} className="bg-[var(--theme-sidebar-bg)] rounded-xl p-3 text-center">
                      <p className="text-lg font-semibold text-[var(--theme-aubergine)] leading-none">{val}</p>
                      <p className="text-[10px] text-[#a8a29e] mt-1 uppercase tracking-wide">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-1.5 text-xs text-[#a8a29e] pt-1 border-t border-[#f5f1eb]">
                  <Users size={11} />
                  <span className="truncate">Updated by {opening.updatedBy || 'Head HR'} · {formatDate(opening.updatedAt)}</span>
                </div>

                {/* Actions */}
                {canManage && (
                  <div className="flex items-center gap-1.5">
                    <button className="btn btn-xs btn-secondary" onClick={() => updateFilled(opening, -1)} disabled={opening.filled <= 0}>
                      <Minus size={11} />
                    </button>
                    <button className="btn btn-xs btn-secondary" onClick={() => updateFilled(opening, 1)} disabled={opening.filled >= opening.openings}>
                      <Plus size={11} />
                    </button>
                    <span className="text-xs text-[#a8a29e] flex-1 text-center">adjust filled</span>
                    <button className="btn btn-xs btn-secondary" onClick={() => setEditing(opening)}>
                      <Pencil size={11} /> Edit
                    </button>
                    <button className="btn btn-xs btn-danger" onClick={() => setDeleteTarget(opening)}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreate && <OpeningModal user={user} onClose={() => setShowCreate(false)} onSaved={refresh} />}
      {editing && <OpeningModal opening={editing} user={user} onClose={() => setEditing(null)} onSaved={refresh} />}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Job Opening"
          message={`Delete "${deleteTarget.positionName}"? This cannot be undone.`}
          confirmLabel="Delete"
          confirmClass="btn-danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
