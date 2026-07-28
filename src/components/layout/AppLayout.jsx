import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Breadcrumb from '../shared/Breadcrumb';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-10 py-10" style={{ backgroundColor: '#fdfbf7' }}>
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
