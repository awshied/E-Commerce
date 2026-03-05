import { useApi } from "@/lib/api";
import { productService } from "@/services/product.service";
import { Product } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useProduct = (productId: string) => {
  const api = useApi();
  const service = productService(api);

  const result = useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: () => service.getById(productId),
    enabled: !!productId,
  });
  return result;
};
