import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { saveToken, removeToken } from "../lib/secureStore";

interface AuthState {
  user: any;
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

      if (!res.data?.id) {
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
    try {
      const res = await axiosInstance.post("/auth/register", data);

      const { accessToken, user } = res.data;

      if (!accessToken || !user) {
        throw new Error("Tidak bisa registrasi.");
      }

      await saveToken(accessToken);
      set({ user });
    } catch (error) {
      await removeToken();
      set({ user: null });
      throw error;
    }
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
