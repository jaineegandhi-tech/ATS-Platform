import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PAGE_SIZE = 10;

export default function Pagination({ total, page, onPage }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;
  const from = (page - 1) * PAGE_SIZE + 1;
  const to   = Math.min(page * PAGE_SIZE, total);

  const btnBase = {
    width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '8px', fontSize: '12px', fontWeight: 500, transition: 'all 150ms', cursor: 'pointer',
  };

  return (
    <div className="flex items-center justify-between px-1 pt-3" style={{ borderTop: '1px solid #e8e2d9' }}>
      <p className="text-xs tabular-nums" style={{ color: 'var(--theme-taupe)' }}>{from}–{to} of {total}</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          style={{ ...btnBase, border: '1px solid #e8e2d9', color: 'var(--theme-taupe)', opacity: page === 1 ? 0.3 : 1 }}
          onMouseEnter={e => { if (page !== 1) e.currentTarget.style.backgroundColor = 'var(--theme-sidebar-bg)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <ChevronLeft size={13} />
        </button>

        {Array.from({ length: pages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === pages || Math.abs(p - page) <= 1)
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === '…' ? (
              <span key={`e${i}`} className="w-7 text-center text-xs" style={{ color: 'var(--theme-taupe)' }}>…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPage(p)}
                style={{
                  ...btnBase,
                  backgroundColor: p === page ? 'var(--theme-mustard)' : 'transparent',
                  color: p === page ? 'var(--theme-cream)' : 'var(--theme-taupe)',
                  border: p === page ? 'none' : '1px solid #e8e2d9',
                }}
                onMouseEnter={e => { if (p !== page) e.currentTarget.style.backgroundColor = 'var(--theme-sidebar-bg)'; }}
                onMouseLeave={e => { if (p !== page) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {p}
              </button>
            )
          )}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page === pages}
          style={{ ...btnBase, border: '1px solid #e8e2d9', color: 'var(--theme-taupe)', opacity: page === pages ? 0.3 : 1 }}
          onMouseEnter={e => { if (page !== pages) e.currentTarget.style.backgroundColor = 'var(--theme-sidebar-bg)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
