import { AxiosInstance } from "axios";

export const orderService = (api: AxiosInstance) => ({
  getAll: async () => {
    const { data } = await api.get("/orders");
    return data.orders;
  },
});
