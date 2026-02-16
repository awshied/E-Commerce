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
