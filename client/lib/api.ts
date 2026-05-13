import { axiosInstance } from "@/lib/axios";
import { useMemo } from "react";

export const statsApi = {
  ping: async () => {
    const { data } = await axiosInstance.post("/users/ping");
    return data;
  },
};

export const useApi = () => {
  return useMemo(() => axiosInstance, []);
};

export const handleApiError = (error: unknown): string => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return (
      axiosError.response?.data?.message || "Terjadi kesalahan pada server"
    );
  }
  return "Terjadi kesalahan yang tidak diketahui";
};
