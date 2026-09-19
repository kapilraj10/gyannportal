"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import {
  getMe,
  login as loginApi,
  logout as logoutApi,
  registerSchool as registerSchoolApi,
  type LoginData,
  type RegisterSchoolData,
} from "@/lib/auth";
import { getRefreshToken, getAccessToken, clearTokens } from "@/lib/token";
import { hasPermission, type PermissionName } from "@/lib/permissions";

import type { User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (data: LoginData) => Promise<User>;
  registerSchool: (data: RegisterSchoolData) => Promise<User>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;

  /** `true` when the user holds any of the given roles. */
  hasRole: (...roles: string[]) => boolean;
  /** `true` when the user holds a specific permission. */
  hasPermission: (permission: PermissionName) => boolean;
  /** Alias of `hasPermission`. */
  can: (permission: PermissionName) => boolean;
  /** Reset local auth state (used by the refresh flow). */
  handleUnauthorized: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSessionExpired = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  useEffect(() => {
    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, [handleSessionExpired]);

  // Bootstrap the session: prefer a valid access token, otherwise try a
  // refresh (token rotation) before giving up.
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const me = await getMe();
      setUser(me);
      return true;
    } catch {
      // Fall through to the refresh flow handled by the API client.
      return false;
    }
  }, []);

  useEffect(() => {
    let active = true;

    const hasStoredToken = !!getAccessToken() || !!getRefreshToken();

    if (!hasStoredToken) {
      setLoading(false);
      return;
    }

    refreshSession()
      .then((ok) => {
        if (!ok) {
          clearTokens();
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshSession]);

  async function handleLogin(data: LoginData): Promise<User> {
    const response = await loginApi(data);
    setUser(response.user);
    return response.user;
  }

  async function handleRegisterSchool(data: RegisterSchoolData): Promise<User> {
    const response = await registerSchoolApi(data);
    setUser(response.user);
    return response.user;
  }

  async function handleLogout(): Promise<void> {
    try {
      await logoutApi();
    } finally {
      clearTokens();
      setUser(null);
    }
  }

  const checkRole = useCallback(
    (...roles: string[]) => !!user && roles.includes(user.role),
    [user],
  );

  const checkPermission = useCallback(
    (permission: PermissionName) => hasPermission(user, permission),
    [user],
  );

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login: handleLogin,
    registerSchool: handleRegisterSchool,
    logout: handleLogout,
    refreshSession,
    hasRole: checkRole,
    hasPermission: checkPermission,
    can: checkPermission,
    handleUnauthorized: handleSessionExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}