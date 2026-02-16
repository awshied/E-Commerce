import { Cart } from "@/types";
import { AxiosInstance } from "axios";

export const cartService = (api: AxiosInstance) => ({
  getAll: async () => {
    const { data } = await api.get<{ cart: Cart }>("/cart");
    return data.cart;
  },
});
