import { X, Download, FileText } from 'lucide-react';

export default function ResumePreviewModal({ isOpen, onClose, resumeDataUrl, candidateName }) {
  if (!isOpen || !resumeDataUrl) return null;

  function handleDownload() {
    const a = document.createElement('a');
    a.href = resumeDataUrl;
    
    // Guess extension if possible, default to pdf
    let ext = 'pdf';
    if (resumeDataUrl.includes('image/')) ext = resumeDataUrl.split('image/')[1].split(';')[0];
    else if (resumeDataUrl.includes('msword')) ext = 'doc';
    else if (resumeDataUrl.includes('officedocument.wordprocessingml')) ext = 'docx';
    
    a.download = `${candidateName.replace(/\\s+/g, '_')}_Resume.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Check if it's a viewable type (PDF or Image)
  const isViewable = resumeDataUrl.startsWith('data:application/pdf') || resumeDataUrl.startsWith('data:image/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--theme-cream)] rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--theme-linen)] bg-gray-50">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
              <FileText className="text-primary" size={20} />
              Resume Preview
            </h3>
            <p className="text-sm text-[var(--theme-taupe)]">{candidateName}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownload}
              className="p-2 text-[var(--theme-taupe)] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              title="Download"
            >
              <Download size={18} />
              <span>Download</span>
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-100 p-4 overflow-auto">
          {isViewable ? (
            <iframe 
              src={resumeDataUrl} 
              className="w-full h-full rounded shadow-sm bg-[var(--theme-cream)]" 
              title="Resume Preview"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Download size={32} className="text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-[var(--theme-taupe)] mb-2">Preview Not Available</h4>
              <p className="text-[var(--theme-taupe)] mb-6 max-w-md">
                This file type cannot be previewed directly in the browser. Please download the file to view it.
              </p>
              <button onClick={handleDownload} className="btn btn-primary">
                Download Resume
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
