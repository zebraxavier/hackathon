// API Configuration and Base Setup
// Set VITE_API_URL at build time (e.g. https://api.example.com/api) for deployments.
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getUser = () => {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const setUser = (user: unknown): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const PUBLIC_PATHS = ['/', '/register'];

// Clears the session and returns to login when the token is rejected.
const handleUnauthorized = (message?: string): never => {
  if (!PUBLIC_PATHS.includes(window.location.pathname)) {
    removeToken();
    window.location.href = '/';
    throw new Error('Session expired. Please login again.');
  }
  throw new Error(message || 'Authentication failed');
};

const send = async (endpoint: string, init: RequestInit): Promise<Response> => {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  try {
    return await fetch(`${API_BASE_URL}${endpoint}`, { ...init, headers });
  } catch {
    throw new Error('Unable to reach the server. Please check your connection and try again.');
  }
};

const parseJson = async (response: Response, fallbackMessage: string) => {
  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON response (e.g. proxy error page)
  }

  if (response.status === 401) handleUnauthorized(data?.message);

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
};

// JSON API request with automatic token injection
export const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await send(endpoint, { ...options, headers });
  return parseJson(response, 'An error occurred');
};

// Multipart request for file uploads
export const apiRequestFormData = async (endpoint: string, formData: FormData): Promise<any> => {
  const response = await send(endpoint, { method: 'POST', body: formData });
  return parseJson(response, 'Upload failed');
};

// Authenticated file download: fetches the file with the bearer token and opens it.
export const downloadFile = async (endpoint: string, fileName: string): Promise<void> => {
  const response = await send(endpoint, { method: 'GET' });

  if (!response.ok) {
    await parseJson(response, 'Download failed');
    return;
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
