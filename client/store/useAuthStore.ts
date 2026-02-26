import { create } from "zustand";

import { axiosInstance } from "../lib/axios";
import { saveToken, removeToken } from "../lib/secureStore";
import { User } from "@/types";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

interface UpdateProfilePayload {
  imageUrl: string;
  username: string;
  birthday?: string;
  gender?: "unknown" | "pria" | "wanita";
}

interface AuthState {
  user: User | null;
  isLoading: boolean;

  checkAuth: () => Promise<void>;
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  forgotPassword: (data: ForgotPasswordPayload) => Promise<string>;
  resetPassword: (data: ResetPasswordPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfilePayload) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ user: res.data });
    } catch (error: any) {
      if (error.response?.status === 401) {
        await removeToken();
        set({ user: null });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    await axiosInstance.post("/auth/register", {
      username: data.username,
      email: data.email,
      password: data.password,
    });
  },

  login: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/login", data);

      const { accessToken, user } = res.data;

      if (!accessToken || !user) {
        throw new Error("Tidak bisa login.");
      }

      await saveToken(accessToken);
      set({ user });
    } catch (error) {
      await removeToken();
      set({ user: null });
      throw error;
    }
  },

  forgotPassword: async (data): Promise<string> => {
    const res = await axiosInstance.post("/auth/forgot-password", data);
    return res.data.resetToken;
  },

  resetPassword: async (data) => {
    await axiosInstance.post("/auth/reset-password", data);
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
    } finally {
      await removeToken();
      set({ user: null });
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set((state) => ({
        user: {
          ...state.user,
          ...res.data.user,
        },
      }));
    } catch (error: any) {
      throw error;
    }
  },
}));
