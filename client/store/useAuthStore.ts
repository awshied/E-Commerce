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
      set({ user: res.data });
    } catch {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (data) => {
    const res = await axiosInstance.post("/auth/login", data);

    await saveToken(res.data.accessToken);

    set({ user: res.data.user });
  },

  register: async (data) => {
    const res = await axiosInstance.post("/auth/register", data);

    await saveToken(res.data.accessToken);

    set({ user: res.data.user });
  },

  logout: async () => {
    await removeToken();
    set({ user: null });
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ user: res.data });
    } catch {
      set({ user: null });
    }
  },
}));
