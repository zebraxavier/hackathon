import { apiRequest } from './api';

// Get all patients
export const getAllPatients = async () => {
  try {
    const response = await apiRequest('/doctor/patients', {
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

// Get patient details
export const getPatientDetails = async (patientId: string) => {
  try {
    const response = await apiRequest(`/doctor/patient/${patientId}`, {
      method: 'GET',
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to load patient details');
    }
    
    return response;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to load patient details');
  }
};

// Get doctor dashboard stats
export const getDoctorDashboard = async () => {
  try {
    const response = await apiRequest('/doctor/dashboard', {
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

export default {
  getAllPatients,
  getPatientDetails,
  getDoctorDashboard,
};
