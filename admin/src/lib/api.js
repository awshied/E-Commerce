import { axiosInstance } from "./axios";

// Notifikasi
export const notificationApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get("/admin/notification");
    return data;
  },

  marked: async (id) => {
    const { data } = await axiosInstance.put(`/admin/notification/${id}/read`);
    return data;
  },

  delete: async (notificationId) => {
    const { data } = await axiosInstance.delete(
      `/admin/notification/${notificationId}`,
    );
    return data;
  },

  deleteAll: async () => {
    const { data } = await axiosInstance.delete("/admin/notification");
    return data;
  },
};

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

// Berita
export const newsApi = {
  getAll: async (draftStatus = null) => {
    let url = "/admin/news";
    if (draftStatus !== null) {
      url += `?draft=${draftStatus}`;
    }
    const { data } = await axiosInstance.get(url);
    return data;
  },

  getPublished: async () => {
    const { data } = await axiosInstance.get("/admin/news?draft=false");
    return data;
  },

  getDrafts: async () => {
    const { data } = await axiosInstance.get("/admin/news?draft=true");
    return data;
  },

  getById: async (newsId) => {
    const { data } = await axiosInstance.get(`/news/${newsId}`);
    return data;
  },

  create: async (formData) => {
    const { data } = await axiosInstance.post("/admin/news", formData);
    return data;
  },

  update: async ({ id, formData }) => {
    const { data } = await axiosInstance.put(`/admin/news/${id}`, formData);
    return data;
  },

  delete: async (newsId) => {
    const { data } = await axiosInstance.delete(`/admin/news/${newsId}`);
    return data;
  },
};

// Komentar
export const commentApi = {
  getCommentByNewsId: async (newsId) => {
    const { data } = await axiosInstance.get(`/comments?newsId=${newsId}`);
    return data;
  },

  getCommentById: async (commentId) => {
    const { data } = await axiosInstance.get(`/comments/${commentId}`);
    return data;
  },

  getAllReplies: async (commentId) => {
    const { data } = await axiosInstance.get(`/comments/${commentId}/replies`);
    return data;
  },

  createComment: async (formData) => {
    const { data } = await axiosInstance.post("/comments", formData);
    return data;
  },

  updateComment: async ({ commentId, formData }) => {
    const { data } = await axiosInstance.put(
      `/comments/${commentId}`,
      formData,
    );
    return data;
  },

  reactToComment: async ({ commentId, formData }) => {
    const { data } = await axiosInstance.post(
      `/comments/${commentId}/react`,
      formData,
    );
    return data;
  },

  deleteComment: async (commentId) => {
    const { data } = await axiosInstance.delete(`/comments/${commentId}`);
    return data;
  },

  hideComment: async ({ commentId, formData }) => {
    const { data } = await axiosInstance.put(
      `/comments/${commentId}/hide`,
      formData,
    );
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
