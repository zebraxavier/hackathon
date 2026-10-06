import { apiRequest } from './api';

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';

export interface AppointmentData {
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
}

export interface UpdateAppointmentData {
  status?: AppointmentStatus;
  notes?: string;
}

// Book appointment (Patient only)
export const bookAppointment = (data: AppointmentData) =>
  apiRequest('/appointments/book', { method: 'POST', body: JSON.stringify(data) });

// Get appointments (role-based)
export const getAppointments = async () => {
  const response = await apiRequest('/appointments');
  return response.appointments || [];
};

// Update appointment status (Doctor/Nurse only)
export const updateAppointment = (id: string, data: UpdateAppointmentData) =>
  apiRequest(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
