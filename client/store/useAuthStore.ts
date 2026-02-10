import { create } from "zustand";

import { axiosInstance } from "../lib/axios";
import { saveToken, removeToken } from "../lib/secureStore";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;

  checkAuth: () => Promise<void>;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      if (!res.data?._id) {
        throw new Error("Tidak bisa cek autentikasi.");
      }

      set({ user: res.data });
    } catch {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    await axiosInstance.post(
      "/auth/register",
      {
        username: data.username,
        email: data.email,
        password: data.password,
      },
      {
        headers: {
          Authorization: undefined,
        },
      },
    );
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

      console.log("USER SET:", user);
    } catch (error) {
      await removeToken();
      set({ user: null });
      throw error;
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } finally {
      await removeToken();
      set({ user: null });
    }
  },

  updateProfile: async (data) => {
    const res = await axiosInstance.put("/auth/update-profile", data);
    set({ user: res.data });
  },
}));
