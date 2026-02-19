import { apiRequest } from './api';

export interface AppointmentData {
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
}

export interface UpdateAppointmentData {
  status?: string;
  notes?: string;
}

// Book appointment (Patient only)
export const bookAppointment = async (data: AppointmentData) => {
  try {
    const response = await apiRequest('/appointments/book', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to book appointment');
    }
    
    return response;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to book appointment');
  }
};

// Get appointments (role-based)
export const getAppointments = async () => {
  try {
    const response = await apiRequest('/appointments', {
      method: 'GET',
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to load appointments');
    }
    
    return response.appointments || [];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to load appointments');
  }
};

// Update appointment status (Doctor/Nurse only)
export const updateAppointment = async (id: string, data: UpdateAppointmentData) => {
  try {
    const response = await apiRequest(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update appointment');
    }
    
    return response;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update appointment');
  }
};

export default {
  bookAppointment,
  getAppointments,
  updateAppointment,
};
