import { useApi } from "@/lib/api";
import { newsService } from "@/services/news.services";
import { ApiResponse, News } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface UseAllNewsOptions {
  page?: number;
  limit?: number;
  tag?: string;
  enabled?: boolean;
}

const useAllNews = ({
  page,
  limit,
  tag,
  enabled = true,
}: UseAllNewsOptions = {}) => {
  const api = useApi();
  const service = newsService(api);

  const result = useQuery<ApiResponse<{ news: News[] }>>({
    queryKey: ["news", { page, limit, tag }],
    queryFn: () => service.getAll(page, limit, tag),
    enabled,
  });

  const news = result.data?.news || [];
  const pagination = result.data?.pagination;
  const isLoading = result.isLoading;
  const error = result.error;
  const refetch = result.refetch;

  return {
    ...result,
    news,
    pagination,
    isLoading,
    error,
    refetch,
  };
};

export default useAllNews;
