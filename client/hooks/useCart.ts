import { useApi } from "@/lib/api";
import { cartService } from "@/services/cart.service";
import { Cart } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useCart = () => {
  const api = useApi();
  const service = cartService(api);
  const queryClient = useQueryClient();

  const cartQuery = useQuery({ queryKey: ["cart"], queryFn: service.getAll });

  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      size,
      quantity = 1,
    }: {
      productId: string;
      size?: string;
      quantity?: number;
    }) => {
      const { data } = await api.post<{ cart: Cart }>("/cart", {
        productId,
        size,
        quantity,
      });
      return data.cart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    error: cartQuery.error,
    addToCart: addToCartMutation.mutate,
  };
};

export default useCart;
