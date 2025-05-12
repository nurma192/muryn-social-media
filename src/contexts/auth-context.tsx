"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "@/types/api-types";
import { AuthService } from "@/services/auth-service";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User> | FormData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const userData = await AuthService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Failed to load user:", error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      await AuthService.login({ username, password });
      const userData = await AuthService.getCurrentUser();
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await AuthService.signup({ username, email, password });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User> | FormData) => {
    setIsLoading(true);
    try {
      const updatedUser = await AuthService.updateProfile(userData);
      setUser(updatedUser);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
