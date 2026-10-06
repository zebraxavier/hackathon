import { createContext, useContext, useState, ReactNode } from 'react';
import * as authService from '../../services/authService';
import { getToken, getUser, setUser as saveUser, removeToken } from '../../services/api';

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
  login: (email: string, password: string, role: UserRole) => Promise<User>;
  logout: () => Promise<void>;
  register: (data: authService.RegisterData) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  updateUser: (changes: Partial<User>) => void;
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

// Read synchronously so protected routes don't bounce to login on page refresh.
const loadSession = (): User | null => {
  const saved = getUser();
  if (!saved || !getToken()) {
    removeToken();
    return null;
  }
  return saved;
};

const toUser = (data: any): User => ({
  id: data.id,
  name: data.name,
  email: data.email,
  role: data.role,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(loadSession);

  const login = async (email: string, password: string, role: UserRole) => {
    const response = await authService.login({ email, password, role });
    const userData = toUser(response.user);
    setUser(userData);
    saveUser(userData);
    return userData;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    window.location.href = '/';
  };

  const register = async (data: authService.RegisterData) => {
    await authService.register(data);
  };

  const verifyOTP = async (email: string, otp: string) => {
    const response = await authService.verifyOTP({ email, otp });
    const userData = toUser(response.user);
    setUser(userData);
    saveUser(userData);
  };

  const updateUser = (changes: Partial<User>) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...changes };
      saveUser(next);
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        verifyOTP,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
