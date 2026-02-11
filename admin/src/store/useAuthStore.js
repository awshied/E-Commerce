import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isLoggingIn: false,

  checkAuth: async () => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      set({ authUser: null, isCheckingAuth: false });
      return;
    }
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
    } catch (error) {
      console.error("Gagal saat cek autentikasi:", error);
      localStorage.removeItem("adminToken");
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      const { accessToken, user } = res.data;

      localStorage.setItem("adminToken", accessToken);

      set({ authUser: user });

      toast.success("Anda berhasil login.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login gagal.");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      localStorage.removeItem("adminToken");
      set({ authUser: null });

      toast.success("Anda berhasil logout.");
    } catch (error) {
      toast.error("Anda gagal logout.");
      console.error("Gagal logout:", error);
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Foto profil telah diganti.");
    } catch (error) {
      console.error("Foto profil tidak bisa diganti:", error);
      toast.error(error.response?.data?.message || "Gagal memperbarui profil.");
    }
  },
}));
