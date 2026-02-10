import axios from "axios";
import { getToken } from "./secureStore";
import { Platform } from "react-native";

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
