import { Address } from "@/types";
import { AxiosInstance } from "axios";

export const addressService = (api: AxiosInstance) => ({
  getAll: async () => {
    const { data } = await api.get<{ addresses: Address[] }>(
      "/users/addresses",
    );
    return data.addresses;
  },
});
