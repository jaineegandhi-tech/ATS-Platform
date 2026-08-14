import { useState } from 'react';
import { getStore, setStore, STORAGE_KEYS } from '../utils/store';
import { Upload, X, CheckCircle, Building2 } from 'lucide-react';

const DEPARTMENTS = ['Human Resources', 'Engineering', 'Marketing', 'Sales', 'Finance', 'Operations', 'Design', 'Product'];

function generateCandidateId() {
  const all = getStore(STORAGE_KEYS.CANDIDATES);
  const nums = all.map(c => parseInt(c.id?.replace('CAND', ''), 10)).filter(Boolean);
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `CAND${String(next).padStart(3, '0')}`;
}

export default function ApplyForm() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    appliedPosition: '',
    department: '',
    resumeName: '',
    resume: null,
  });
  const [submitted, setSubmitted] = useState(false);

  function handleResume(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return alert('File size must be under 10MB.');
    const reader = new FileReader();
    reader.onload = ev => {
      setForm(f => ({ ...f, resume: ev.target.result, resumeName: file.name }));
    };
    reader.readAsDataURL(file);
  }

  function submit(e) {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.appliedPosition || !form.department) {
      return alert('Please fill in all required fields.');
    }

    const all = getStore(STORAGE_KEYS.CANDIDATES);
    const now = new Date().toISOString();

    const newCand = {
      ...form,
      id: generateCandidateId(),
      status: 'Outsourced',
      viewedBy: [],
      currentRound: null,
      timeline: [{ action: 'Candidate Applied via Form', by: 'System', at: now }],
      createdAt: now,
      createdBy: 'System',
    };

    all.push(newCand);
    setStore(STORAGE_KEYS.CANDIDATES, all);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--theme-sidebar-bg)] flex flex-col items-center justify-center p-6 relative">
        {/* Top left Logo */}
        <div className="absolute top-6 left-6 hidden sm:flex items-center gap-3">
          <img src="/esparkbiz-logo.png" alt="eSparkBiz Logo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <span className="text-base font-bold text-[var(--theme-aubergine)] tracking-tight">eSparkBiz</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-8 sm:hidden justify-center">
          <img src="/esparkbiz-logo.png" alt="eSparkBiz Logo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col text-left">
            <span className="text-base font-bold text-[var(--theme-aubergine)] tracking-tight">eSparkBiz</span>
          </div>
        </div>

        <div className="max-w-md w-full bg-[var(--theme-cream)] rounded-2xl border border-[var(--theme-linen)] shadow-card p-8 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--theme-aubergine)] mb-2">Application Submitted</h1>
          <p className="text-sm text-[var(--theme-taupe)]">Thank you for your interest! Your application has been successfully submitted and our team will review it shortly.</p>
          <button 
            onClick={() => { setForm({ firstName: '', lastName: '', email: '', appliedPosition: '', department: '', resumeName: '', resume: null }); setSubmitted(false); }}
            className="btn btn-primary mt-6 w-full"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--theme-sidebar-bg)] py-12 px-4 sm:px-6 relative">
      {/* Top left Logo */}
      <div className="absolute top-6 left-6 hidden sm:flex items-center gap-3">
        <img src="/esparkbiz-logo.png" alt="eSparkBiz Logo" className="w-10 h-10 object-contain" />
        <div className="flex flex-col">
          <span className="text-base font-bold text-[var(--theme-aubergine)] tracking-tight">eSparkBiz</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8 sm:hidden justify-center">
          <img src="/esparkbiz-logo.png" alt="eSparkBiz Logo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col text-left">
            <span className="text-base font-bold text-[var(--theme-aubergine)] tracking-tight">eSparkBiz</span>
          </div>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--theme-aubergine)] mb-2">Job Application Form</h1>
          <p className="text-sm text-[var(--theme-taupe)]">Please fill out the details below to apply for a position.</p>
        </div>

        <form onSubmit={submit} className="bg-[var(--theme-cream)] rounded-2xl border border-[var(--theme-linen)] shadow-card p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">First Name *</label>
              <input required className="input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="John" />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input required className="input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Doe" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Email Address *</label>
              <input required type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john.doe@example.com" />
            </div>
            <div>
              <label className="label">Applied Position *</label>
              <select required className="input" value={form.appliedPosition} onChange={e => setForm(f => ({ ...f, appliedPosition: e.target.value }))}>
                <option value="">Select Position</option>
                {['BA', 'QA', 'UI/UX', 'Full Stack Developer', 'Frontend developer', 'Backend developer', 'DevOps Engineer', 'Product Manager', 'Social Media Manager'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Department *</label>
              <select required className="input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">CV / Resume Upload * (.pdf, .doc, .docx)</label>
            {form.resumeName ? (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mt-2">
                <Upload size={15} className="text-blue-500" />
                <span className="text-sm text-blue-700 flex-1">{form.resumeName}</span>
                <button type="button" onClick={() => setForm(f => ({ ...f, resume: null, resumeName: '' }))} className="text-blue-400 hover:text-red-500"><X size={14} /></button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--theme-linen)] rounded-xl p-8 mt-2 cursor-pointer hover:border-primary hover:bg-[var(--theme-sidebar-bg)] transition-colors">
                <Upload size={22} className="text-[#d4cdc4] mb-2" />
                <p className="text-sm text-[var(--theme-taupe)]">Click to upload resume</p>
                <p className="text-xs text-[#a8a29e] mt-1">PDF, DOC, DOCX · Max 10MB</p>
                <input required type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResume} />
              </label>
            )}
          </div>

          <div className="pt-4 border-t border-[var(--theme-linen)]">
            <button type="submit" className="btn btn-primary w-full h-11 text-base">Submit Application</button>
          </div>
        </form>
      </div>
    </div>
  );
}
