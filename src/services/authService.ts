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

// Register new patient
export const register = async (data: RegisterData) => {
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    return response;
  } catch (error: any) {
    throw new Error(error.message || 'Registration failed');
  }
};

// Verify OTP
export const verifyOTP = async (data: VerifyOTPData) => {
  try {
    const response = await apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.success && response.token) {
      setToken(response.token);
      setUser(response.user);
    }
    
    return response;
  } catch (error: any) {
    throw new Error(error.message || 'OTP verification failed');
  }
};

// Login user
export const login = async (data: LoginData) => {
  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.success && response.token) {
      setToken(response.token);
      setUser(response.user);
    }
    
    return response;
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
};

// Logout user
export const logout = async () => {
  try {
    await apiRequest('/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    removeToken();
  }
};

export default {
  register,
  verifyOTP,
  login,
  logout,
};
