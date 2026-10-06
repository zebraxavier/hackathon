import { apiRequest } from './api';

export const getAllPatients = async () => {
  const response = await apiRequest('/doctor/patients');
  return response.patients || [];
};

export const getPatientDetails = (patientId: string) => apiRequest(`/doctor/patient/${patientId}`);

export const getDoctorDashboard = () => apiRequest('/doctor/dashboard');
