import { ApiResponse, News } from "@/types";
import { AxiosInstance } from "axios";

export const newsService = (api: AxiosInstance) => ({
  getAll: async (page?: number, limit?: number, tag?: string) => {
    const params = new URLSearchParams();
    if (page !== undefined) params.append("page", page.toString());
    if (limit !== undefined) params.append("limit", limit.toString());
    if (tag) params.append("tag", tag);

    const { data } = await api.get<ApiResponse<{ news: News[] }>>(
      `/news${params.toString() ? `?${params}` : ""}`,
    );
    return data;
  },

  getBySlug: async (slug: string) => {
    const { data } = await api.get<ApiResponse<{ news: News }>>(
      `/news/slug/${slug}`,
    );
    return data;
  },

  getById: async (newsId: string) => {
    const { data } = await api.get<ApiResponse<{ news: News }>>(
      `/news/${newsId}`,
    );
    return data;
  },

  reactToNews: async (newsId: string, type: "like" | "dislike") => {
    const { data } = await api.post<
      ApiResponse<{
        totalLikes: number;
        totalDislikes: number;
        userLiked: boolean;
        userDisliked: boolean;
      }>
    >(`/news/${newsId}/react`, { type });
    return data;
  },
});
