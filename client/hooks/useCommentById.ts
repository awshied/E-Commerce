import { useApi } from "@/lib/api";
import { commentService } from "@/services/comment.service";
import { Comment, ApiResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

const useCommentById = (commentId: string) => {
  const api = useApi();
  const service = commentService(api);

  const result = useQuery<ApiResponse<{ comment: Comment }>>({
    queryKey: ["comment", commentId],
    queryFn: () => service.getCommentById(commentId),
    enabled: !!commentId,
  });

  const comment = result.data?.comment;
  const isLoading = result.isLoading;
  const error = result.error;

  return {
    ...result,
    comment,
    isLoading,
    error,
  };
};

export default useCommentById;
