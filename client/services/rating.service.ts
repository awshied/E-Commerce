import { AxiosInstance } from "axios";

interface CreateRatingData {
  productId: string;
  orderId: string;
  rating: number;
}

export const ratingService = (api: AxiosInstance) => ({
  postRating: async (data: CreateRatingData) => {
    const response = await api.post("/reviews", data);
    return response.data;
  },
});
