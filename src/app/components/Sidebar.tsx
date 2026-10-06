import React from 'react';
import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard, Users, FileText, Calendar,
  LogOut, Upload, Activity, Heart, Bell, Settings, HelpCircle, Bot,
  type LucideIcon,
} from 'lucide-react';
import { useAuth, UserRole } from '../context/AuthContext';
import LogoutDialog from './LogoutDialog';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

const ROLE_MENUS: Record<UserRole, MenuItem[]> = {
  doctor: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor/dashboard' },
    { icon: Users, label: 'Patients', path: '/doctor/patients' },
    { icon: Calendar, label: 'Appointments', path: '/doctor/appointments' },
  ],
  nurse: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/nurse/dashboard' },
    { icon: Upload, label: 'Upload Reports', path: '/nurse/upload' },
    { icon: Activity, label: 'Update Vitals', path: '/nurse/vitals' },
  ],
  patient: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/patient/dashboard' },
    { icon: FileText, label: 'My Reports', path: '/patient/reports' },
    { icon: Calendar, label: 'Appointments', path: '/patient/appointments' },
    { icon: Bot, label: 'AI Assistant', path: '/patient/chatbot' },
  ],
};

const commonMenu = (role: UserRole): MenuItem[] => [
  { icon: Bell, label: 'Notifications', path: `/${role}/notifications` },
  { icon: Settings, label: 'Profile Settings', path: `/${role}/profile` },
  { icon: HelpCircle, label: 'Help & Support', path: `/${role}/help` },
];

const GRADIENT = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

  const menuItems = user ? [...ROLE_MENUS[user.role], ...commonMenu(user.role)] : [];

  const content = (
    <>
      <div className="p-4 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{ width: '45px', height: '45px', background: GRADIENT }}
          >
            <Heart size={24} className="text-white" />
          </div>
          <div>
            <h5 className="mb-0" style={{ fontFamily: 'Poppins, sans-serif' }}>HealthCare AI</h5>
            <small className="text-muted text-capitalize">{user?.role} Portal</small>
          </div>
        </div>
      </div>

      <nav className="flex-grow-1 overflow-auto py-3" aria-label="Main navigation">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              aria-current={isActive ? 'page' : undefined}
              className={`sidebar-link d-flex align-items-center gap-3 px-4 py-3 text-decoration-none position-relative ${
                isActive ? 'text-white' : 'text-dark'
              }`}
              style={{ background: isActive ? GRADIENT : undefined }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-top p-4">
        <button
          onClick={() => setShowLogoutDialog(true)}
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
        >
          <LogOut size={18} />
          Logout Securely
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay + drawer */}
      {isOpen && (
        <div
          className="d-lg-none position-fixed w-100 h-100 top-0 start-0 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={onClose}
        />
      )}
      <aside
        className="d-lg-none position-fixed h-100 bg-white shadow-lg d-flex flex-column"
        style={{
          width: '280px',
          top: 0,
          left: isOpen ? 0 : '-280px',
          zIndex: 1050,
          transition: 'left 0.3s ease',
          fontFamily: 'Inter, sans-serif',
        }}
        aria-hidden={!isOpen}
      >
        {content}
      </aside>

      {/* Desktop sidebar (always visible) */}
      <div className="d-none d-lg-block flex-shrink-0" style={{ width: '280px' }} />
      <aside
        className="d-none d-lg-flex position-fixed h-100 bg-white shadow-lg flex-column"
        style={{ width: '280px', top: 0, left: 0, zIndex: 1000, fontFamily: 'Inter, sans-serif' }}
      >
        {content}
      </aside>

      <LogoutDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} />
    </>
  );
};

export default Sidebar;
