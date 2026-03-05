import { Product } from "@/types";
import { AxiosInstance } from "axios";

export const productService = (api: AxiosInstance) => ({
  getAll: async () => {
    const { data } = await api.get<Product[]>("/products");
    return data;
  },

  getById: async (productId: string): Promise<Product> => {
    const { data } = await api.get<Product>(`/products/${productId}`);
    return data;
  },
});
