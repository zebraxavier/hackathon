import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Bell, Menu, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import LogoutDialog from './LogoutDialog';

interface NavbarProps {
  onMenuClick: () => void;
}

// Closes a dropdown when clicking outside of it or pressing Escape.
const useDismiss = (open: boolean, close: () => void) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  return ref;
};

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const notificationsRef = useDismiss(showNotifications, () => setShowNotifications(false));
  const profileRef = useDismiss(showProfile, () => setShowProfile(false));

  const goTo = (path: string) => {
    setShowProfile(false);
    navigate(`/${user?.role}/${path}`);
  };

  return (
    <>
      <nav className="bg-white border-bottom shadow-sm sticky-top" style={{ zIndex: 1000 }}>
        <div className="container-fluid px-4 py-3 d-flex align-items-center justify-content-between">
          <button
            className="btn btn-link text-dark d-lg-none p-0"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <span className="d-none d-lg-block" />

          <div className="d-flex align-items-center gap-3">
            {/* Notifications */}
            <div className="position-relative" ref={notificationsRef}>
              <button
                className="btn btn-link text-dark p-0 position-relative"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label={`Notifications (${notifications.length})`}
                aria-expanded={showNotifications}
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: '0.6rem', padding: '0.2rem 0.4rem' }}
                  >
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <motion.div
                  className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border"
                  style={{ width: '320px', zIndex: 1100 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-3 border-bottom">
                    <h6 className="mb-0">Notifications</h6>
                  </div>
                  <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                    {notifications.length === 0 ? (
                      <p className="p-3 mb-0 small text-muted">You're all caught up.</p>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div key={notif.id} className="p-3 border-bottom">
                          <p className="mb-1 small fw-semibold">{notif.title}</p>
                          <small className="text-muted">{notif.message}</small>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 text-center border-top">
                    <Link
                      to={`/${user?.role}/notifications`}
                      className="small text-decoration-none"
                      onClick={() => setShowNotifications(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="position-relative" ref={profileRef}>
              <button
                className="btn btn-link p-0 d-flex align-items-center gap-2 text-decoration-none"
                onClick={() => setShowProfile(!showProfile)}
                aria-label="User menu"
                aria-expanded={showProfile}
              >
                <div className="d-none d-sm-block text-end">
                  <div className="small mb-0 text-dark">{user?.name}</div>
                  <div className="text-muted text-capitalize" style={{ fontSize: '0.75rem' }}>
                    {user?.role}
                  </div>
                </div>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  <User size={20} className="text-white" />
                </div>
              </button>

              {showProfile && (
                <motion.div
                  className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border"
                  style={{ width: '200px', zIndex: 1100 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  role="menu"
                >
                  <div className="p-2">
                    <button
                      className="dropdown-item rounded-2 py-2 d-flex align-items-center gap-2"
                      onClick={() => goTo('profile')}
                      role="menuitem"
                    >
                      <Settings size={16} />
                      Profile & Settings
                    </button>
                    <button
                      className="dropdown-item rounded-2 py-2 d-flex align-items-center gap-2"
                      onClick={() => goTo('help')}
                      role="menuitem"
                    >
                      <HelpCircle size={16} />
                      Help & Support
                    </button>
                    <hr className="my-1" />
                    <button
                      className="dropdown-item rounded-2 py-2 d-flex align-items-center gap-2 text-danger"
                      onClick={() => {
                        setShowProfile(false);
                        setShowLogoutDialog(true);
                      }}
                      role="menuitem"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LogoutDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} />
    </>
  );
};

export default Navbar;
