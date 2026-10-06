import { apiRequest, setToken, setUser, removeToken } from './api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
}

export interface LoginData {
  email: string;
  password: string;
  role: 'doctor' | 'nurse' | 'patient';
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

const storeSession = (response: any) => {
  if (response.success && response.token) {
    setToken(response.token);
    setUser(response.user);
  }
  return response;
};

// Register new patient (also resends the OTP for an unverified account)
export const register = (data: RegisterData) =>
  apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) });

export const verifyOTP = async (data: VerifyOTPData) =>
  storeSession(await apiRequest('/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }));

export const login = async (data: LoginData) =>
  storeSession(await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }));

export const logout = async () => {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch {
    // Logout is client-side for stateless JWTs; ignore network errors.
  } finally {
    removeToken();
  }
};
