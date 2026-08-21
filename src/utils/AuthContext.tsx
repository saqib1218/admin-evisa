"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getAdmin, clearAuth, isAuthenticated, api } from "@/utils/api";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  admin: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const user = getAdmin();

      if (user && !isAuthenticated()) {
        const refreshed = await api.refreshAccessToken();
        if (refreshed) {
          setAdmin(user);
        } else {
          clearAuth();
          setAdmin(null);
        }
      } else if (isAuthenticated()) {
        setAdmin(user);
      } else {
        setAdmin(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.adminLogin(email, password);
    setAdmin(data.admin);
  };

  const logout = async () => {
    await api.logout();
    setAdmin(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
