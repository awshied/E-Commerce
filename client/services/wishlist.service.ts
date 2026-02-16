import { Product } from "@/types";
import { AxiosInstance } from "axios";

export const wishlistService = (api: AxiosInstance) => ({
  getAll: async () => {
    const { data } = await api.get<{ wishlist: Product[] }>("/users/wishlist");
    return data.wishlist;
  },
});
