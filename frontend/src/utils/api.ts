import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
  const res = await axios.post(`${API_URL}/auth/signup`, { email, password });
  return res.data;
}

export async function login(email: string, password: string) {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  return res.data;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet(path: string) {
  const res = await axios.get(`${API_URL}${path}`, { headers: authHeaders() });
  return res.data;
}

export async function apiPost(path: string, data: any) {
  const res = await axios.post(`${API_URL}${path}`, data, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function apiPut(path: string, data: any) {
  const res = await axios.put(`${API_URL}${path}`, data, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function apiDelete(path: string) {
  const res = await axios.delete(`${API_URL}${path}`, {
    headers: authHeaders(),
  });
  return res.data;
}
