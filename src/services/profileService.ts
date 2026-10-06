import { apiRequest, getUser, setUser } from './api';

export interface ProfileData {
  name?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
}

export const getProfile = () => apiRequest('/profile');

export const updateProfile = async (data: ProfileData) => {
  const response = await apiRequest('/profile/update', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  // Keep the cached session user (used by the navbar) in sync.
  if (response.user) {
    const { id, name, email, role } = response.user;
    setUser({ ...getUser(), id, name, email, role });
  }

  return response;
};

export const changePassword = (currentPassword: string, newPassword: string) =>
  apiRequest('/profile/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
