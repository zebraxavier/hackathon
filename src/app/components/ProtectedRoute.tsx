import { Suspense } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth, UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

// Guards a route subtree: unauthenticated users go to login, users of another
// role are sent to their own dashboard. The API enforces the same rules server-side.
const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return (
    <Suspense
      fallback={
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      }
    >
      <Outlet />
    </Suspense>
  );
};

export default ProtectedRoute;
