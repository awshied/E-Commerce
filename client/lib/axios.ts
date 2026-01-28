import axios from "axios";
import Constants from "expo-constants";
import { getToken } from "./secureStore";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export const axiosInstance = axios.create({
  baseURL: API_URL,
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
