import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

// Authenticated pages are code-split so the login page loads quickly.
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const PatientDetails = lazy(() => import('./pages/doctor/PatientDetails'));
const NurseDashboard = lazy(() => import('./pages/nurse/NurseDashboard'));
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'));
const ProfileSettings = lazy(() => import('./pages/patient/ProfileSettings'));
const Notifications = lazy(() => import('./pages/common/Notifications'));
const HelpSupport = lazy(() => import('./pages/common/HelpSupport'));

// Pages shared by every role.
const commonRoutes = [
  { path: 'notifications', element: <Notifications /> },
  { path: 'profile', element: <ProfileSettings /> },
  { path: 'help', element: <HelpSupport /> },
];

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/doctor',
    element: <ProtectedRoute allowedRoles={['doctor']} />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <DoctorDashboard /> },
      { path: 'patients', element: <DoctorDashboard view="patients" /> },
      { path: 'appointments', element: <DoctorDashboard view="appointments" /> },
      { path: 'patient/:id', element: <PatientDetails /> },
      ...commonRoutes,
    ],
  },
  {
    path: '/nurse',
    element: <ProtectedRoute allowedRoles={['nurse']} />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <NurseDashboard /> },
      { path: 'upload', element: <NurseDashboard view="upload" /> },
      { path: 'vitals', element: <NurseDashboard view="vitals" /> },
      ...commonRoutes,
    ],
  },
  {
    path: '/patient',
    element: <ProtectedRoute allowedRoles={['patient']} />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <PatientDashboard /> },
      { path: 'reports', element: <PatientDashboard view="reports" /> },
      { path: 'appointments', element: <PatientDashboard view="appointments" /> },
      { path: 'chatbot', element: <PatientDashboard view="chatbot" /> },
      ...commonRoutes,
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
