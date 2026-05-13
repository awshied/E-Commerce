import { useApi } from "@/lib/api";
import { newsService } from "@/services/news.services";
import { ApiResponse, News } from "@/types";
import { useQuery } from "@tanstack/react-query";

const useNewsBySlug = (slug: string) => {
  const api = useApi();
  const service = newsService(api);

  const result = useQuery<ApiResponse<{ news: News }>>({
    queryKey: ["news", "slug", slug],
    queryFn: () => service.getBySlug(slug),
    enabled: !!slug,
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

export default useNewsBySlug;
