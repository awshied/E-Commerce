import { axiosInstance } from "./axios";

export const productApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get("/admin/products");
    return data;
  },

  create: async (FormData) => {
    const { data } = await axiosInstance.post("/admin/products", FormData);
    return data;
  },

  update: async ({ id, FormData }) => {
    const { data } = await axiosInstance.put(`/admin/products/${id}`, FormData);
    return data;
  },
};

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

export const chartApi = {
  getRevenueAndExpense: async (year) => {
    const { data } = await axiosInstance.get(
      `/admin/revenueExpense?year=${year}`,
    );
    return data;
  },
};
