import { axiosInstance } from "./axios";

// Produk
export const productApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get("/admin/products");
    return data;
  },

  create: async (formData) => {
    const { data } = await axiosInstance.post("/admin/products", formData);
    return data;
  },

  update: async ({ id, formData }) => {
    const { data } = await axiosInstance.put(`/admin/products/${id}`, formData);
    return data;
  },

  delete: async (productId) => {
    const { data } = await axiosInstance.delete(`/admin/products/${productId}`);
    return data;
  },
};

// Pesanan
export const orderApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get("/admin/orders");
    return data;
  },

  updateStatus: async ({ orderId, status }) => {
    const { data } = await axiosInstance.patch(
      `/admin/orders/${orderId}/status`,
      { status },
    );
    return data;
  },
};

// Statistik
export const statsApi = {
  getDashboard: async () => {
    const { data } = await axiosInstance.get("/admin/stats");
    return data;
  },

  getUserStatus: async () => {
    const { data } = await axiosInstance.get("/admin/onlineStatus");
    return data;
  },

  ping: async () => {
    const { data } = await axiosInstance.post("/users/ping");
    return data;
  },
};

// Chart
export const chartApi = {
  getRevenueAndExpense: async (year) => {
    const { data } = await axiosInstance.get(
      `/admin/revenueExpense?year=${year}`,
    );
    return data;
  },
};

// Pelanggan
export const customerApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get("/admin/customers");
    return data;
  },
};
