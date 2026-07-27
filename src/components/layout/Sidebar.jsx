import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, canAccess } from '../../utils/roles';
import {
  BarChart3, Briefcase, Building2, CalendarCheck, FileText,
  GitBranch, LayoutDashboard, ListChecks, PhoneCall, ShieldCheck, Stamp, Users,
} from 'lucide-react';

const MODULES = [
  { key: 'dashboard',          to: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard',             end: true },
  { key: 'jobOpenings',        to: '/job-openings',        icon: Briefcase,       label: 'Job Openings' },
  { key: 'candidates',         to: '/candidates',          icon: Users,           label: 'Candidates' },
  { key: 'interviewCalendar',  to: '/interview-calendar',  icon: CalendarCheck,   label: 'Interview Calendar' },
  { key: 'interviewSchedule',  to: '/interview-schedule',  icon: ListChecks,      label: 'Interview Schedule' },
  { key: 'approvals',          to: '/approvals',           icon: Stamp,           label: 'Interview Activity' },
  { key: 'reports',            to: '/reports',             icon: BarChart3,       label: 'Reports' },
  { key: 'pipeline',           to: '/pipeline',            icon: GitBranch,       label: 'Pipeline' },
  { key: 'rolesPermissions',   to: '/roles-permissions',   icon: ShieldCheck,     label: 'Roles & Permissions' },
  { key: 'resumeInfo',         to: '/resume-info',         icon: FileText,        label: 'Resume Info' },
  { key: 'telephonyInterview', to: '/telephony-interview', icon: PhoneCall,       label: 'Telephonic Interviews' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const links = MODULES.filter(module => canAccess(user?.role, module.key, user?.id));
  const roleLabel = ROLE_LABELS[user?.role] || user?.role || '';

  return (
    <aside className="w-[220px] bg-sidebar flex flex-col flex-shrink-0 min-h-screen">

      {/* Logo */}
      <div className="px-5 h-14 flex items-center gap-3 border-b border-sidebar-border flex-shrink-0">
        <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center flex-shrink-0">
          <Building2 size={13} className="text-white" />
        </div>
        <span className="text-white font-semibold text-sm tracking-tight">ATS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={14} className="flex-shrink-0" />
            <span className="truncate text-[13px]">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-sidebar-border flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-[10px] font-semibold flex-shrink-0 select-none">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-gray-300 text-xs font-medium truncate leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-gray-500 text-[10px] truncate mt-0.5">{roleLabel}</p>
          </div>
        </div>
      </div>

    </aside>
  );
}
