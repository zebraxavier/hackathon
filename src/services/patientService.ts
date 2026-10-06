import { apiRequest } from './api';

export const getPatientDashboard = () => apiRequest('/patient/dashboard');

export const getPatientReports = async () => {
  const response = await apiRequest('/patient/reports');
  return response.reports || [];
};

export const getDoctors = async () => {
  const response = await apiRequest('/patient/doctors');
  return response.doctors || [];
};
