import { useApi } from "@/lib/api";
import { ratingService } from "@/services/rating.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRating = () => {
  const api = useApi();
  const service = ratingService(api);
  const queryClient = useQueryClient();

  const createRating = useMutation({
    mutationFn: service.postRating,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return {
    isCreatingRating: createRating.isPending,
    createRatingAsync: createRating.mutateAsync,
  };
};
