'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { authApi, AuthUser, Role } from '@/lib/api/auth';
import { ApiError } from '@/lib/api';

interface AuthState {
  user: AuthUser | null;
  role: Role | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  clearError: () => void;
  isAdmin: boolean;
  isOfficer: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,   // true until initial session check completes
    error: null,
  });

  // On mount: try to restore session via refresh-token cookie
  useEffect(() => {
    authApi.refresh().then(user => {
      setState({ user, role: user?.role ?? null, loading: false, error: null });
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const user = await authApi.login(email, password);
      setState({ user, role: user.role, loading: false, error: null });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Login failed. Try again.';
      setState(s => ({ ...s, loading: false, error: msg }));
      throw err;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const user = await authApi.register(name, email, password);
      setState({ user, role: user.role, loading: false, error: null });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Registration failed. Try again.';
      setState(s => ({ ...s, loading: false, error: msg }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setState(s => ({ ...s, loading: true }));
    await authApi.logout();
    setState({ user: null, role: null, loading: false, error: null });
  }, []);

  const clearError = useCallback(() => {
    setState(s => ({ ...s, error: null }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    loginWithGoogle: authApi.loginWithGoogle,
    clearError,
    isAdmin: state.role === 'ADMIN',
    isOfficer: state.role === 'OFFICER',
    isAuthenticated: state.user !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
