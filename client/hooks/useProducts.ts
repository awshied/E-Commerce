import { useApi } from "@/lib/api";
import { productService } from "@/services/product.service";
import { useQuery } from "@tanstack/react-query";

const useProducts = () => {
  const api = useApi();
  const service = productService(api);

  const result = useQuery({
    queryKey: ["products"],
    queryFn: service.getAll,
  });
  return result;
};

export default useProducts;
