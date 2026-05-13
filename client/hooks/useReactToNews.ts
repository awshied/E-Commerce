import { useApi } from "@/lib/api";
import { newsService } from "@/services/news.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

const useReactToNews = (newsId: string) => {
  const api = useApi();
  const service = newsService(api);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ type }: { type: "like" | "dislike" }) =>
      service.reactToNews(newsId, type),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["news", newsId] });
      queryClient.invalidateQueries({ queryKey: ["news", "slug"] });
      queryClient.invalidateQueries({ queryKey: ["news"] });

      Alert.alert(data.message || "Berhasil memberi reaksi");
    },

    onError: (error: Error) => {
      Alert.alert(error.message || "Gagal memberi reaksi");
    },
  });

  return {
    like: () => mutation.mutate({ type: "like" }),
    dislike: () => mutation.mutate({ type: "dislike" }),
    isPending: mutation.isPending,
    ...mutation,
  };
};

export default useReactToNews;
