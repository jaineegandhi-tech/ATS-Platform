import { History } from 'lucide-react';
import Modal from './Modal';
import { formatDate } from '../../utils/helpers';

export default function AssetHistoryModal({ asset, onClose }) {
  const history = asset.history || [];

  return (
    <Modal title={`Asset History — ${asset.name}`} onClose={onClose} size="lg">
      {history.length === 0 ? (
        <div className="text-center py-10 text-[#a8a29e]">
          <History size={28} className="mx-auto mb-2 text-[#e8e2d9]" />
          No assignment history for this asset.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Assigned Employee', 'Assigned By', 'Assigned Date', 'Expected Return', 'Returned Date', 'Condition on Return', 'Notes'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map(entry => (
                <tr key={entry.id} className="table-row">
                  <td className="table-td">
                    <p className="font-semibold text-[var(--theme-aubergine)] text-sm">{entry.assignedEmployeeName}</p>
                    <p className="text-xs text-[#a8a29e]">{entry.assignedEmployeeId}</p>
                  </td>
                  <td className="table-td">{entry.assignedByName || '—'}</td>
                  <td className="table-td text-[var(--theme-taupe)]">{formatDate(entry.assignedDate)}</td>
                  <td className="table-td text-[var(--theme-taupe)]">{formatDate(entry.expectedReturnDate)}</td>
                  <td className="table-td text-[var(--theme-taupe)]">{formatDate(entry.returnedDate)}</td>
                  <td className="table-td">{entry.conditionOnReturn || '—'}</td>
                  <td className="table-td text-[var(--theme-taupe)] text-xs max-w-[160px]">{entry.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
