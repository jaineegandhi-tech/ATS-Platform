import { Download, Eye, FileText, RefreshCcw, Search, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { downloadDocument, formatFileSize, viewDocument } from '../../utils/documents';

export default function DocumentTable({ documents, showEmployee = false, canDelete = false, onReplace, onDelete }) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-[#a8a29e]">
        <Search size={28} className="mx-auto mb-2 text-[#e8e2d9]" />
        No documents found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            {(showEmployee ? ['Employee', 'Department'] : []).concat(['Document Type', 'Document Name', 'Upload Date', 'Uploaded By', 'Status', 'Actions']).map(h => (
              <th key={h} className="table-th">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {documents.map(doc => (
            <tr key={doc.id} className="table-row">
              {showEmployee && (
                <>
                  <td className="table-td">
                    <p className="font-semibold text-[var(--theme-aubergine)] text-sm">{doc.employeeName}</p>
                    <p className="text-xs text-[#a8a29e]">{doc.employeeId}</p>
                  </td>
                  <td className="table-td">{doc.department || '-'}</td>
                </>
              )}
              <td className="table-td">
                <span className="badge-blue">{doc.type}</span>
              </td>
              <td className="table-td">
                <div className="flex items-start gap-2">
                  <FileText size={15} className="text-[#a8a29e] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[var(--theme-aubergine)] text-sm">{doc.name}</p>
                    <p className="text-xs text-[#a8a29e]">{doc.fileName} - {formatFileSize(doc.fileSize)}</p>
                  </div>
                </div>
              </td>
              <td className="table-td text-[var(--theme-taupe)]">{formatDate(doc.uploadedAt)}</td>
              <td className="table-td">{doc.uploadedByName || '-'}</td>
              <td className="table-td"><span className="badge-green">{doc.status || 'Active'}</span></td>
              <td className="table-td">
                <div className="flex items-center gap-1.5">
                  <button className="btn btn-xs btn-secondary" title="View" onClick={() => viewDocument(doc)}>
                    <Eye size={12} />
                  </button>
                  <button className="btn btn-xs btn-secondary" title="Download" onClick={() => downloadDocument(doc)}>
                    <Download size={12} />
                  </button>
                  {onReplace && (
                    <button className="btn btn-xs btn-secondary" title="Replace" onClick={() => onReplace(doc)}>
                      <RefreshCcw size={12} />
                    </button>
                  )}
                  {canDelete && (
                    <button className="btn btn-xs btn-danger" title="Delete" onClick={() => onDelete(doc)}>
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
