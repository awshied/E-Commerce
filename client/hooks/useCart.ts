import { useApi } from "@/lib/api";
import { cartService } from "@/services/cart.service";
import { Cart } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const isPromoActive = (promo?: any) => {
  if (!promo?.startDate || !promo?.endDate) return false;

  const now = new Date();
  return now >= new Date(promo.startDate) && now <= new Date(promo.endDate);
};

const getDiscountedPrice = (price: number, discountPercent = 0) => {
  const discount = Math.max(0, Math.min(100, discountPercent));
  return Math.round(price - price * (discount / 100));
};

const useCart = () => {
  const api = useApi();
  const service = cartService(api);
  const queryClient = useQueryClient();

  const {
    data: cart,
    isLoading,
    isError,
  } = useQuery({ queryKey: ["cart"], queryFn: service.getAll });

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

  const updateQuantityMutation = useMutation({
    mutationFn: async ({
      productId,
      size,
      quantity,
    }: {
      productId: string;
      size?: string;
      quantity?: number;
    }) => {
      const { data } = await api.put<{ cart: Cart }>(`/cart/${productId}`, {
        size,
        quantity,
      });
      return data.cart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async ({
      productId,
      size,
    }: {
      productId: string;
      size: string;
    }) => {
      const { data } = await api.delete<{ cart: Cart }>(`/cart/${productId}`, {
        data: { size },
      });
      return data.cart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<{ cart: Cart }>("/cart");
      return data.cart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const cartTotal =
    cart?.items.reduce((sum, item) => {
      const sizeItem = item.product.sizes.find(
        (s: any) => s.size === item.size,
      );

      if (!sizeItem) return sum;

      let price = sizeItem.price;

      if (isPromoActive(item.product.promo)) {
        price = getDiscountedPrice(
          sizeItem.price,
          item.product.promo?.discountPercent,
        );
      }

      return sum + price * item.quantity;
    }, 0) ?? 0;

  const cartItemCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return {
    cart,
    isLoading,
    isError,
    cartTotal,
    cartItemCount,
    addToCart: addToCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutateAsync,
    isAddingToCart: addToCartMutation.isPending,
    isUpdating: updateQuantityMutation.isPending,
    isRemoving: removeFromCartMutation.isPending,
    isClearing: clearCartMutation.isPending,
  };
};

export default useCart;
