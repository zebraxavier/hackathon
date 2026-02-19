import { apiRequest } from './api';

export interface ProfileData {
  name?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
}

// Get user profile
export const getProfile = async () => {
  try {
    const response = await apiRequest('/profile', {
      method: 'GET',
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to load profile');
    }
    
    return response;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to load profile');
  }
};

// Update user profile
export const updateProfile = async (data: ProfileData) => {
  try {
    const response = await apiRequest('/profile/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update profile');
    }
    
    // Update user in localStorage
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update profile');
  }
};

export default {
  getProfile,
  updateProfile,
};
