import { useApi } from "@/lib/api";
import { commentService } from "@/services/comment.service";
import { Comment, ApiResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

const useCommentReplies = (commentId: string) => {
  const api = useApi();
  const service = commentService(api);

  const result = useQuery<ApiResponse<{ replies: Comment[] }>>({
    queryKey: ["comment-replies", commentId],
    queryFn: () => service.getRepliesByCommentId(commentId),
    enabled: !!commentId,
  });

  const replies = result.data?.data?.replies || [];
  const isLoading = result.isLoading;
  const error = result.error;
  const refetch = result.refetch;

  return {
    ...result,
    replies,
    isLoading,
    error,
    refetch,
  };
};

export default useCommentReplies;
