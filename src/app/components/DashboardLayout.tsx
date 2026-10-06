import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

// Shared page shell: sidebar, top navbar and page header.
const DashboardLayout = ({ title, subtitle, actions, children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-vh-100 d-lg-flex" style={{ background: '#f8f9fa', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="container-fluid p-4">
          <div className="mb-4 d-flex flex-wrap justify-content-between align-items-start gap-3">
            <div>
              <h2 className="mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>{title}</h2>
              {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
            </div>
            {actions}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export const LoadingState = ({ label = 'Loading...' }: { label?: string }) => (
  <div className="d-flex align-items-center justify-content-center py-5">
    <div className="text-center">
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">{label}</span>
      </div>
      <p className="mt-3 text-muted">{label}</p>
    </div>
  </div>
);

export default DashboardLayout;
