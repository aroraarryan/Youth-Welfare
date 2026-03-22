import { api, tokenStore } from "../api";

export type Role = "ADMIN" | "USER" | "OFFICER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

interface AuthResponse {
  success: boolean;
  accessToken: string;
  user: AuthUser;
}

interface MeResponse {
  success: boolean;
  user: AuthUser;
}

export const authApi = {
  register: async (
    name: string,
    email: string,
    password: string,
  ): Promise<AuthUser> => {
    const res = await api.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
    });
    tokenStore.set(res.accessToken);
    return res.user;
  },

  login: async (email: string, password: string): Promise<AuthUser> => {
    const res = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    tokenStore.set(res.accessToken);
    return res.user;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } finally {
      tokenStore.clear();
    }
  },

  /** Silently restore session on page load (uses httpOnly refresh cookie) */
  refresh: async (): Promise<AuthUser | null> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (!res.ok) return null;
      const data: AuthResponse = await res.json();
      tokenStore.set(data.accessToken);
      return data.user;
    } catch {
      return null;
    }
  },

  me: async (): Promise<AuthUser | null> => {
    try {
      const res = await api.get<MeResponse>("/auth/me");
      return res.user;
    } catch {
      return null;
    }
  },

  /** Redirect to Google OAuth — no fetch, just navigate */
  loginWithGoogle: () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/google`;
  },
};
