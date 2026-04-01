import { useApi } from "@/lib/api";
import { orderService } from "@/services/order.service";
import { Order } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useOrders = () => {
  const api = useApi();
  const service = orderService(api);

  return useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: service.getAll,
  });
};
