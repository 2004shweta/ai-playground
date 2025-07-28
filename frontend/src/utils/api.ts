import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ai-playground-y7d4.onrender.com" ||
  "http://localhost:3001";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

export async function signup(email: string, password: string) {
  try {
    const res = await axios.post(`${API_URL}/auth/signup`, { email, password });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 503) {
      throw new Error('Database connection error. Please try again in a few moments.');
    }
    throw error;
  }
}

export async function login(email: string, password: string) {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 503) {
      throw new Error('Database connection error. Please try again in a few moments.');
    }
    throw error;
  }
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet(path: string) {
  try {
    const res = await axios.get(`${API_URL}${path}`, { headers: authHeaders() });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Clear invalid token
      clearToken();
      throw new Error('Authentication required');
    }
    throw error;
  }
}

export async function apiPost<T = unknown>(path: string, data: T) {
  try {
    const res = await axios.post(`${API_URL}${path}`, data, {
      headers: authHeaders(),
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Clear invalid token
      clearToken();
      throw new Error('Authentication required');
    }
    throw error;
  }
}

export async function apiPut<T = unknown>(path: string, data: T) {
  try {
    const res = await axios.put(`${API_URL}${path}`, data, {
      headers: authHeaders(),
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Clear invalid token
      clearToken();
      throw new Error('Authentication required');
    }
    throw error;
  }
}

export async function apiDelete(path: string) {
  try {
    const res = await axios.delete(`${API_URL}${path}`, {
      headers: authHeaders(),
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Clear invalid token
      clearToken();
      throw new Error('Authentication required');
    }
    throw error;
  }
}
