"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getMe,
  login as loginApi,
  logout as logoutApi,
  registerSchool as registerSchoolApi,
  LoginData,
  RegisterSchoolData,
} from "@/lib/auth";

import { clearAccessToken, getAccessToken } from "@/lib/token";

import { User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;

  login: (data: LoginData) => Promise<User>;
  registerSchool: (data: RegisterSchoolData) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAccessToken();
      setUser(null);
      router.replace("/login");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [router]);

  useEffect(() => {
    let active = true;

    const token = getAccessToken();

    if (!token) {
      queueMicrotask(() => {
        if (active) setLoading(false);
      });
      return () => {
        active = false;
      };
    }

    getMe()
      .then((me) => {
        if (active) setUser(me);
      })
      .catch(() => {
        if (active) clearAccessToken();
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleLogin(data: LoginData) {
    const response = await loginApi(data);
    setUser(response.user);
    return response.user;
  }

  async function handleRegisterSchool(data: RegisterSchoolData) {
    const response = await registerSchoolApi(data);
    setUser(response.user);
    return response.user;
  }

  async function handleLogout() {
    await logoutApi();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: handleLogin,
        registerSchool: handleRegisterSchool,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}