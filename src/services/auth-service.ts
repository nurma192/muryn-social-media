import apiClient from "./api-client";
import type { LoginCredentials, Signup, TokenResponse, User, PaginatedUserList } from "@/types/api-types";

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>("/accounts/token/", credentials);
    // Store tokens in localStorage
    localStorage.setItem("access_token", response.data.access);
    localStorage.setItem("refresh_token", response.data.refresh);
    return response.data;
  },

  signup: async (userData: Signup): Promise<void> => {
    await apiClient.post("/accounts/signup/", userData);
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try {
        await apiClient.post("/accounts/api/token/blacklist/", { refresh: refreshToken });
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>("/accounts/info/");
    return response.data;
  },

  updateProfile: async (userData: Partial<User> | FormData): Promise<User> => {
    // Check if userData is FormData
    const isFormData = userData instanceof FormData;

    const response = await apiClient.patch<User>("/accounts/profile/update/", userData, {
      headers: isFormData
        ? {
            "Content-Type": "multipart/form-data",
          }
        : undefined,
    });
    return response.data;
  },

  getUserInfo: async (userId: number): Promise<User> => {
    const response = await apiClient.get<User>(`/accounts/${userId}/info/`);
    return response.data;
  },

  followUnfollow: async (userId: number): Promise<void> => {
    await apiClient.post(`/accounts/follow_unfollow/${userId}/`);
  },

  getFollowers: async (userId: number, page = 1): Promise<PaginatedUserList> => {
    const response = await apiClient.get<PaginatedUserList>(`/accounts/${userId}/followers/?page=${page}`);
    return response.data;
  },

  getFollowing: async (userId: number, page = 1): Promise<PaginatedUserList> => {
    const response = await apiClient.get<PaginatedUserList>(`/accounts/${userId}/following/?page=${page}`);
    return response.data;
  },
};
