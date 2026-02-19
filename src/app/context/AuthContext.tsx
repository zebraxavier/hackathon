import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authService from '../../services/authService';
import { getUser, setUser as saveUser, removeToken } from '../../services/api';

export type UserRole = 'doctor' | 'nurse' | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = getUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      const response = await authService.login({ email, password, role });
      
      if (response.success && response.user) {
        const userData: User = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
        };
        setUser(userData);
        saveUser(userData);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      removeToken();
      // Redirect to login page
      window.location.href = '/';
    }
  };

  const register = async (data: any) => {
    try {
      // Map form data to backend format
      const registerData = {
        name: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        dateOfBirth: data.dob,
        gender: data.gender,
        address: data.address,
      };
      
      await authService.register(registerData);
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const response = await authService.verifyOTP({ email, otp });
      
      if (response.success && response.user) {
        const userData: User = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
        };
        setUser(userData);
        saveUser(userData);
      }
    } catch (error: any) {
      throw new Error(error.message || 'OTP verification failed');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        verifyOTP,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
