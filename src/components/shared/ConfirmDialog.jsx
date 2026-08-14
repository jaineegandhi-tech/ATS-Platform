import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ title, message, onConfirm, onCancel, confirmLabel = 'Confirm', confirmClass = 'btn-danger' }) {
  return (
    <Modal title={title} onClose={onCancel} size="sm">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#fee2e2' }}>
          <AlertTriangle size={18} style={{ color: '#dc2626' }} />
        </div>
        <div className="flex-1">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-taupe)' }}>{message}</p>
          <div className="flex justify-end gap-2.5 mt-5">
            <button className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
            <button className={`btn btn-sm ${confirmClass}`} onClick={onConfirm}>{confirmLabel}</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
