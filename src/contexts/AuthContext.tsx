"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'hr_manager' | 'hr_executive' | 'employee';
  employeeId?: string;
  name?: string;
  department?: string;
  shift?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function hydrate() {
      try {
        const session = await apiFetch('/auth/session');
        if (session) {
          setUser(session);
        }
      } catch (err) {
        console.error('Session hydration failed:', err);
        // Fallback to local storage if needed, but preferred to use session
        const stored = localStorage.getItem('ems_user');
        if (stored) {
          const u = JSON.parse(stored);
          setUser(u);
        }
      } finally {
        setMounted(true);
      }
    }
    hydrate();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userData = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      setUser(userData);
      localStorage.setItem('ems_user', JSON.stringify(userData));
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('ems_user');
    }
  };

  const changePassword = async (current: string, next: string) => {
    await apiFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: current, new_password: next }),
    });
  };

  if (!mounted) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
