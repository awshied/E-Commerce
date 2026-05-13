import { useApi } from "@/lib/api";
import { commentService } from "@/services/comment.service";
import { CreateCommentRequest, UpdateCommentRequest } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

const useCommentActions = (newsId: string) => {
  const api = useApi();
  const service = commentService(api);
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["comments", newsId] });
    queryClient.invalidateQueries({ queryKey: ["news", newsId] });
  };

  const createComment = useMutation({
    mutationFn: (payload: CreateCommentRequest) =>
      service.createComment(payload),
    onSuccess: () => {
      invalidateQueries();
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal menambahkan komentar",
      );
    },
  });

  const updateComment = useMutation({
    mutationFn: ({
      commentId,
      payload,
    }: {
      commentId: string;
      payload: UpdateCommentRequest;
    }) => service.updateComment(commentId, payload),
    onSuccess: () => {
      invalidateQueries();
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal mengupdate komentar",
      );
    },
  });

  const reactToComment = useMutation({
    mutationFn: ({
      commentId,
      type,
    }: {
      commentId: string;
      type: "like" | "dislike";
    }) => service.reactToComment(commentId, type),
    onSuccess: () => {
      invalidateQueries();
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Gagal memberikan reaksi pada komentar",
      );
    },
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: string) => service.deleteComment(commentId),
    onSuccess: () => {
      invalidateQueries();
      Alert.alert("Sukses", "Komentar berhasil dihapus");
    },
    onError: (error: any) => {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Gagal menghapus komentar",
      );
    },
  });

  return {
    createComment: createComment.mutate,
    isCreatingComment: createComment.isPending,
    updateComment: updateComment.mutate,
    isUpdatingComment: updateComment.isPending,
    reactToComment: reactToComment.mutate,
    isReacting: reactToComment.isPending,
    deleteComment: deleteComment.mutate,
    isDeletingComment: deleteComment.isPending,
  };
};

export default useCommentActions;
