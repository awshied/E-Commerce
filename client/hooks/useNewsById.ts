import { useApi } from "@/lib/api";
import { newsService } from "@/services/news.services";
import { ApiResponse, News } from "@/types";
import { useQuery } from "@tanstack/react-query";

const useNewsById = (newsId: string) => {
  const api = useApi();
  const service = newsService(api);

  const result = useQuery<ApiResponse<{ news: News }>>({
    queryKey: ["news", newsId],
    queryFn: () => service.getById(newsId),
    enabled: !!newsId,
  });

  const news = result.data?.news;
  const isLoading = result.isLoading;
  const error = result.error;

  return {
    ...result,
    news,
    isLoading,
    error,
  };
};

export default useNewsById;
