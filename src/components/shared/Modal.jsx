import { X } from 'lucide-react';

export default function Modal({ title, children, onClose, size = 'md' }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(60,42,33,0.45)', backdropFilter: 'blur(4px)' }}>
      <div className={`w-full ${sizes[size]} max-h-[90vh] flex flex-col`}
        style={{ backgroundColor: 'var(--theme-cream)', borderRadius: '24px', border: '1px solid #e8e2d9', boxShadow: '0 20px 60px -10px rgba(60,42,33,0.22)' }}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid #e8e2d9' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: '15px', fontWeight: 700, letterSpacing: '0.45px', color: 'var(--theme-aubergine)' }}>
            {title}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center transition-colors"
              style={{ borderRadius: '8px', color: 'var(--theme-taupe)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--theme-sidebar-bg)'; e.currentTarget.style.color = 'var(--theme-aubergine)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--theme-taupe)'; }}
            >
              <X size={15} />
            </button>
          )}
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
