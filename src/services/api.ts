// API Configuration and Base Setup
const API_BASE_URL = 'http://localhost:5000/api';

// Get token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Set token in localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get user from localStorage
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Set user in localStorage
export const setUser = (user: any): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

// API Request Helper with automatic token injection
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    // Handle unauthorized (token expired or invalid)
    if (response.status === 401) {
      // Only redirect and show message if not already on login page
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && currentPath !== '/register') {
        removeToken();
        window.location.href = '/';
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(data.message || 'Authentication failed');
    }

    // Handle other errors
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  } catch (error: any) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// API Request for FormData (file uploads)
export const apiRequestFormData = async (
  endpoint: string,
  formData: FormData
): Promise<any> => {
  const token = getToken();
  
  const headers: HeadersInit = {};

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    // Handle unauthorized
    if (response.status === 401) {
      // Only redirect and show message if not already on login page
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && currentPath !== '/register') {
        removeToken();
        window.location.href = '/';
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(data.message || 'Authentication failed');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  } catch (error: any) {
    console.error('API Upload Error:', error);
    throw error;
  }
};

export default {
  apiRequest,
  apiRequestFormData,
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
};
