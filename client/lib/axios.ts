import axios from "axios";
import { getToken, removeToken } from "./secureStore";
import { Platform } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";

const BASE_URL =
  Platform.OS === "android"
    ? "http://192.168.1.2:3000/api"
    : "http://localhost:3000/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await removeToken();
      useAuthStore.getState().user = null;
    }
    return Promise.reject(error);
  },
);
