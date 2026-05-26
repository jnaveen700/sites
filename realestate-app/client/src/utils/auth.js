import { API_BASE_URL } from '../config/api';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const base64UrlDecode = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
};

export const getTokenPayload = (token) => {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const payload = getTokenPayload(token);
  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
};

export const getAuthSession = () => {
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || isTokenExpired(token)) {
    clearAuthSession();
    return null;
  }

  return { token, user };
};

export const getAuthHeaders = () => {
  const session = getAuthSession();

  if (!session?.token) {
    return null;
  }

  return {
    Authorization: `Bearer ${session.token}`,
  };
};

export const validateAuthSession = async () => {
  const session = getAuthSession();

  if (!session?.token) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  });

  if (!response.ok) {
    clearAuthSession();
    return null;
  }

  const data = await response.json();
  if (data?.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  return data?.user || null;
};
