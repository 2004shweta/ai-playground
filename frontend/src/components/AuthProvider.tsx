"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  login as apiLogin,
  signup as apiSignup,
  setToken,
  getToken,
  clearToken,
} from "../utils/api";

interface AuthContextType {
  isLoggedIn: boolean;
  user: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseUserFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const isLoggedIn = !!user;

  useEffect(() => {
    const token = getToken();
    if (token) {
      const user = parseUserFromToken(token);
      if (user) {
        setUser(user);
      } else {
        // Invalid token, clear it
        clearToken();
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setToken(res.token);
    setUser(parseUserFromToken(res.token));
  };
  const signup = async (email: string, password: string) => {
    await apiSignup(email, password);
    // Auto-login after signup
    await login(email, password);
  };
  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
