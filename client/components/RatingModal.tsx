import {
  View,
  Text,
  Image,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { Order } from "@/types";

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  order: Order | null;
  productRatings: { [key: string]: number };
  onRatingChange: (productId: string, rating: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const RatingModal = ({
  visible,
  onClose,
  order,
  productRatings,
  onRatingChange,
  onSubmit,
  isSubmitting,
}: RatingModalProps) => {
  if (!order) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <TouchableWithoutFeedback>
            <View className="bg-background-light rounded-2xl p-6 shadow-2xl w-full max-w-md max-h-[80%]">
              <View className="items-center mb-4">
                <Image
                  source={require("@/assets/images/logo-web.png")}
                  className="size-28"
                />
                <Text className="text-xl font-extrabold text-text-primary text-center">
                  Beri Nilai
                </Text>
                <Text className="text-sm font-semibold text-text-gray/70 text-center mt-2 leading-relaxed">
                  Silahkan nilai setiap barang yang Anda pesan.
                </Text>
              </View>

              <ScrollView className="mb-4">
                {order?.orderItems.map((item, index) => {
                  const productId = item.product?._id;
                  if (!productId) return null;
                  const currentRating = productRatings[productId] || 0;

                  return (
                    <View
                      key={item._id}
                      className={`p-1 ${index < order.orderItems.length - 1 ? "mb-3" : ""}`}
                    >
                      <View className="flex-row items-center mb-3">
                        <Image
                          source={{ uri: item.image }}
                          style={{ height: 80, width: 80, borderRadius: 8 }}
                        />
                        <View className="flex-1 ml-3 gap-2">
                          <Text
                            className="text-text-primary font-extrabold text-base"
                            numberOfLines={2}
                          >
                            {item.name}
                          </Text>
                          <View className="flex-row items-center gap-3">
                            <Text className="text-accent-warning font-semibold text-sm">
                              {item.quantity} Pcs
                            </Text>
                            <Text className="text-text-gray/70 font-semibold text-sm">
                              {item.size}
                            </Text>
                            <Text className="text-text-gray/70 font-semibold text-sm">
                              Rp. {item.price.toLocaleString("id-ID")}
                            </Text>
                          </View>

                          <View className="flex-row items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <TouchableOpacity
                                key={star}
                                onPress={() => onRatingChange(productId, star)}
                                activeOpacity={0.7}
                                className="mx-1.5"
                              >
                                <Image
                                  source={
                                    star <= currentRating
                                      ? require("@/assets/images/icons/full-star.png")
                                      : require("@/assets/images/icons/empty-star.png")
                                  }
                                  className="size-6"
                                />
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              <View className="flex-row gap-3 mt-6">
                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.7}
                  disabled={isSubmitting}
                  className="flex-1 border border-text-gray/40 rounded-xl py-3 items-center"
                >
                  <Text className="font-bold text-text-gray">Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onSubmit}
                  activeOpacity={0.7}
                  disabled={isSubmitting}
                  className="flex-1 bg-primary-indigo rounded-xl py-3 items-center"
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#d2d2d2" />
                  ) : (
                    <Text className="font-bold text-white">Beri Nilai</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default RatingModal;
