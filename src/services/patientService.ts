import { apiRequest } from './api';

// Get patient dashboard data
export const getPatientDashboard = async () => {
  try {
    const response = await apiRequest('/patient/dashboard', {
      method: 'GET',
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to load dashboard');
    }
    
    return response;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to load dashboard');
  }
};

// Get patient reports
export const getPatientReports = async () => {
  try {
    const response = await apiRequest('/patient/reports', {
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

// Get medical history
export const getMedicalHistory = async () => {
  try {
    const response = await apiRequest('/patient/medical-history', {
      method: 'GET',
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to load medical history');
    }
    
    return response;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to load medical history');
  }
};

// Get list of doctors
export const getDoctors = async () => {
  try {
    const response = await apiRequest('/patient/doctors', {
      method: 'GET',
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to load doctors');
    }
    
    return response.doctors || [];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to load doctors');
  }
};

export default {
  getPatientDashboard,
  getPatientReports,
  getMedicalHistory,
  getDoctors,
};
