import { axiosInstance } from "@/lib/axios";

export const statsApi = {
  ping: async () => {
    const { data } = await axiosInstance.post("/users/ping");
    return data;
  },
};
