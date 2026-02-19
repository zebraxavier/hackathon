import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If roles are specified, check if user has the required role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard
    switch (user.role) {
      case 'doctor':
        return <Navigate to="/doctor/dashboard" replace />;
      case 'nurse':
        return <Navigate to="/nurse/dashboard" replace />;
      case 'patient':
        return <Navigate to="/patient/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
