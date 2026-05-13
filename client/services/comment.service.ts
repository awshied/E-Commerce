import {
  Comment,
  ApiResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
} from "@/types";
import { AxiosInstance } from "axios";

export const commentService = (api: AxiosInstance) => ({
  getCommentsByNewsId: async (newsId: string) => {
    const params = new URLSearchParams({ newsId });
    const { data } = await api.get<ApiResponse<{ comments: Comment[] }>>(
      `/comments?${params}`,
    );
    return data;
  },

  getCommentById: async (commentId: string) => {
    const { data } = await api.get<ApiResponse<{ comment: Comment }>>(
      `/comments/${commentId}`,
    );
    return data;
  },

  getRepliesByCommentId: async (commentId: string) => {
    const { data } = await api.get<ApiResponse<{ replies: Comment[] }>>(
      `/comments/${commentId}/replies`,
    );
    return data;
  },

  createComment: async (payload: CreateCommentRequest) => {
    const { data } = await api.post<ApiResponse<{ comment: Comment }>>(
      "/comments",
      payload,
    );
    return data;
  },

  updateComment: async (commentId: string, payload: UpdateCommentRequest) => {
    const { data } = await api.put<ApiResponse<{ comment: Comment }>>(
      `/comments/${commentId}`,
      payload,
    );
    return data;
  },

  reactToComment: async (commentId: string, type: "like" | "dislike") => {
    const { data } = await api.post<
      ApiResponse<{
        totalLikes: number;
        totalDislikes: number;
        userLiked: boolean;
        userDisliked: boolean;
      }>
    >(`/comments/${commentId}/react`, { type });
    return data;
  },

  deleteComment: async (commentId: string) => {
    const { data } = await api.delete<ApiResponse>(`/comments/${commentId}`);
    return data;
  },
});
