import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getStore, STORAGE_KEYS } from '../../utils/store';
import { useStorageSync } from '../../utils/useStorageSync';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, canAccess } from '../../utils/roles';
import {
  BarChart3, Briefcase, Building2, CalendarCheck, FileText,
  GitBranch, LayoutDashboard, ListChecks, PhoneCall, ShieldCheck, Stamp, Users, ChevronRight, ChevronDown
} from 'lucide-react';

const MODULE_GROUPS = [
  {
    title: 'OVERVIEW',
    items: [
      { key: 'dashboard',          to: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard',             end: true },
      { key: 'interviewCalendar',  to: '/interview-calendar',  icon: CalendarCheck,   label: 'Calendar Hub' },
    ]
  },
  {
    title: 'MANAGEMENT',
    items: [
      { key: 'candidates',         to: '/candidates',          icon: Users,           label: 'Candidates',
        subMenu: [
          { to: '/candidates?status=New+Candidate', label: 'New Candidate' },
          { to: '/candidates?status=Email+Sent', label: 'Email Sent' },
          { to: '/candidates?status=Outsourced', label: 'Outsourced' },
        ]
      },
      { key: 'pipeline',           to: '/pipeline',            icon: GitBranch,       label: 'Pipeline' },
      { key: 'resumeInfo',         to: '/resume-info',         icon: FileText,        label: 'Resume Parser' },
      { key: 'telephonyInterview', to: '/telephony-interview', icon: PhoneCall,       label: 'Telephonic Interviews' },
    ]
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { key: 'rolesPermissions',   to: '/roles-permissions',   icon: ShieldCheck,     label: 'Roles & Access' },
    ]
  },
  {
    title: 'RECRUITMENT',
    items: [
      { key: 'jobOpenings',        to: '/job-openings',        icon: Briefcase,       label: 'Job Openings' },
      { key: 'interviewSchedule',  to: '/interview-schedule',  icon: ListChecks,      label: 'Interview Schedule' },
      { key: 'approvals',          to: '/approvals',           icon: Stamp,           label: 'Interview Activity' },
    ]
  },
  {
    title: 'INSIGHTS',
    items: [
      { key: 'reports',            to: '/reports',             icon: BarChart3,       label: 'Reports' },
    ]
  }
];

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const roleLabel = ROLE_LABELS[user?.role] || user?.role || '';
  useStorageSync();

  const [expandedMenus, setExpandedMenus] = useState({ candidates: false });
  const candidates = getStore(STORAGE_KEYS.CANDIDATES) || [];
  const hasUnreadOutsourced = candidates.some(c => c.status === 'Outsourced' && (!c.viewedBy || !c.viewedBy.includes(user?.id)));

  useEffect(() => {
    if (location.pathname === '/candidates') {
      setExpandedMenus(prev => ({ ...prev, candidates: true }));
    }
  }, [location.pathname]);

  const toggleMenu = (key) => setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside
      className="w-[240px] flex flex-col flex-shrink-0 min-h-screen"
      style={{
        backgroundColor: 'var(--theme-sidebar-bg)',
        borderRight: '1px solid #e8e2d9',
      }}
    >

      {/* Logo */}
      <div className="px-5 h-14 flex items-center gap-3 border-b border-sidebar-border flex-shrink-0">
        <img src="/esparkbiz-logo.png" alt="eSparkBiz Logo" className="w-6 h-6 object-contain flex-shrink-0" />
        <span className="font-bold text-sm tracking-heading"
          style={{ color: 'var(--theme-aubergine)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
          eSparkBiz
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {MODULE_GROUPS.map((group) => {
          const groupItems = group.items.filter(module => canAccess(user?.role, module.key, user?.id));
          if (groupItems.length === 0) return null;

          return (
            <div key={group.title} className="mb-1">
              <div className="sidebar-section text-[#0ea5e9] opacity-100">{group.title}</div>
              <div className="space-y-0.5">
                {groupItems.map((module) => {
                  const { key, to, icon: Icon, label, end, subMenu } = module;
                  
                  if (subMenu) {
                    const isExpanded = expandedMenus[key];
                    const isMainActive = location.pathname === to && !location.search;
                    return (
                      <div key={key}>
                        <div
                          onClick={() => toggleMenu(key)}
                          className={`sidebar-link cursor-pointer flex items-center justify-between ${isMainActive ? 'active' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={14} className="flex-shrink-0" />
                            <span className="truncate text-[13px] font-medium">{label}</span>
                          </div>
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                        {isExpanded && (
                          <div className="pl-6 py-1 space-y-0.5">
                            <NavLink
                              to={to}
                              end={end}
                              className={() => `sidebar-link ${isMainActive ? 'active' : ''}`}
                            >
                              <span className="truncate text-[13px]">All Candidates</span>
                            </NavLink>
                            {subMenu.map(sub => {
                              const isSubActive = location.pathname + location.search === sub.to;
                              return (
                                <NavLink
                                  key={sub.to}
                                  to={sub.to}
                                  className={() => `sidebar-link ${isSubActive ? 'active' : ''}`}
                                >
                                  <span className="truncate text-[13px] flex items-center justify-between w-full">
                                    <span>{sub.label}</span>
                                    {sub.label === 'Outsourced' && hasUnreadOutsourced && (
                                      <span className="relative flex h-2.5 w-2.5 mr-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                      </span>
                                    )}
                                  </span>
                                </NavLink>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <NavLink
                      key={to}
                      to={to}
                      end={end}
                      className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                    >
                      <Icon size={14} className="flex-shrink-0" />
                      <span className="truncate text-[13px] font-medium">{label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-sidebar-border flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 select-none"
            style={{ backgroundColor: 'var(--theme-linen)', color: 'var(--theme-taupe)' }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate leading-tight"
              style={{ color: 'var(--theme-aubergine)' }}>
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] truncate mt-0.5"
              style={{ color: 'var(--theme-taupe)' }}>
              {roleLabel}
            </p>
          </div>
        </div>
      </div>

    </aside>
  );
}
