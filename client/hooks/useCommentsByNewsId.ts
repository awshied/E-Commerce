import { useApi } from "@/lib/api";
import { commentService } from "@/services/comment.service";
import { Comment, ApiResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface UseCommentsByNewsIdOptions {
  enabled?: boolean;
}

const useCommentsByNewsId = (
  newsId: string,
  options: UseCommentsByNewsIdOptions = {},
) => {
  const api = useApi();
  const service = commentService(api);

  const result = useQuery<ApiResponse<{ comments: Comment[] }>>({
    queryKey: ["comments", newsId],
    queryFn: () => service.getCommentsByNewsId(newsId),
    enabled: !!newsId && options.enabled !== false,
  });

  const comments = result.data?.comments || [];
  const isLoading = result.isLoading;
  const error = result.error;
  const refetch = result.refetch;

  return {
    ...result,
    comments,
    isLoading,
    error,
    refetch,
  };
};

export default useCommentsByNewsId;
