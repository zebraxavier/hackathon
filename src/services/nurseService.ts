import { apiRequest, apiRequestFormData } from './api';

export interface VitalsData {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
}

export const uploadReport = (formData: FormData) => apiRequestFormData('/nurse/upload-report', formData);

export const updatePatientVitals = (patientId: string, vitals: VitalsData) =>
  apiRequest(`/nurse/patient/${patientId}/vitals`, { method: 'PUT', body: JSON.stringify(vitals) });

export const getAllPatients = async () => {
  const response = await apiRequest('/nurse/patients');
  return response.patients || [];
};

// Recent reports uploaded by the current nurse
export const getUploadedReports = async () => {
  const response = await apiRequest('/nurse/reports');
  return response.reports || [];
};
