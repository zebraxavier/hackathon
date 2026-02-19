import { apiRequest, apiRequestFormData } from './api';

export interface VitalsData {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
}

// Upload report
export const uploadReport = async (formData: FormData) => {
  try {
    const response = await apiRequestFormData('/nurse/upload-report', formData);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to upload report');
    }
    
    return response;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to upload report');
  }
};

// Update patient vitals
export const updatePatientVitals = async (patientId: string, vitals: VitalsData) => {
  try {
    const response = await apiRequest(`/nurse/patient/${patientId}/vitals`, {
      method: 'PUT',
      body: JSON.stringify(vitals),
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update vitals');
    }
    
    return response;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update vitals');
  }
};

// Get all patients (Nurse view)
export const getAllPatients = async () => {
  try {
    const response = await apiRequest('/nurse/patients', {
      method: 'GET',
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to load patients');
    }
    
    return response.patients || [];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to load patients');
  }
};

// Get all reports uploaded by nurse
export const getUploadedReports = async () => {
  try {
    const response = await apiRequest('/nurse/reports', {
      method: 'GET',
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to load reports');
    }
    
    return response.reports || [];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to load reports');
  }
};

export default {
  uploadReport,
  updatePatientVitals,
  getAllPatients,
  getUploadedReports,
};
