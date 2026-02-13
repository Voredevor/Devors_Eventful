import { api } from "../services/api";
import { User, AuthResponse } from "@/types";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: "creator" | "eventee";
}

export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>("/v1/auth/register", credentials);
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>("/v1/auth/login", credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post("/v1/auth/logout", {});
  },

  async getProfile(): Promise<User> {
    const response = await api.get<{ data: User }>("/v1/auth/profile");
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch<{ data: User }>("/v1/auth/profile", data);
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const response = await api.post<{ data: { token: string } }>("/v1/auth/refresh-token", {
      refreshToken,
    });
    return response.data;
  },
};
