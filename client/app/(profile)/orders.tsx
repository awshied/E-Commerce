import {
  View,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useRating } from "@/hooks/useRatings";
import { Order } from "@/types";
import SafeScreen from "@/components/SafeScreen";
import { router } from "expo-router";
import { formatDate } from "@/lib/formatDate";
import { capitalizeLetter, getStatusColor } from "@/lib/statusAndCapitalize";
import RatingModal from "@/components/RatingModal";

const OrdersScreen = () => {
  const { data: orders, isLoading, isError } = useOrders();
  const { createRatingAsync, isCreatingRating } = useRating();

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [productRatings, setProductRatings] = useState<{
    [key: string]: number;
  }>({});

  const handleOpenRating = (order: Order) => {
    setShowRatingModal(true);
    setSelectedOrder(order);

    const initialRatings: { [key: string]: number } = {};
    order.orderItems.forEach((item) => {
      initialRatings[item._id] = 0;
    });

    setProductRatings(initialRatings);
  };

  const handleSubmitRating = async () => {
    if (!selectedOrder) return;

    const allRated = Object.values(productRatings).every(
      (rating) => rating > 0,
    );
    if (!allRated) {
      Alert.alert("Error", "Mohon untuk memberi penilaian pada semua barang.");
      return;
    }

    try {
      await Promise.all(
        selectedOrder.orderItems.map((item) =>
          createRatingAsync({
            productId: item.product._id,
            orderId: selectedOrder._id,
            rating: productRatings[item._id],
          }),
        ),
      );

      Alert.alert(
        "Yeay!",
        "Terima kasih karena berkenan memberi penilaian pada semua barang.",
      );
      setShowRatingModal(false);
      setSelectedOrder(null);
      setProductRatings({});
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.error || "Gagal menilai barang.",
      );
    }
  };

  if (isLoading) {
    return <SafeScreen>{orderLoading()}</SafeScreen>;
  }

  if (isError) {
    return <SafeScreen>{orderError()}</SafeScreen>;
  }

  if (!orders || orders.length === 0) {
    return <SafeScreen>{orderEmpty()}</SafeScreen>;
  }

  return (
    <SafeScreen>
      {/* Header */}
      <View className="px-4 py-3 mt-8 bg-background border-b border-background-light flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Image
            source={require("../../assets/images/icons/arrow-left.png")}
            className="size-6"
          />
        </TouchableOpacity>
        <Text className="text-center text-xl font-bold text-text-primary">
          Riwayat Pesanan
        </Text>
      </View>

      {/* Main */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {orders.map((order) => {
            const totalItems = order.orderItems.reduce(
              (sum, item) => sum + item.quantity,
              0,
            );

            return (
              <View
                key={order._id}
                className="bg-background-light rounded-xl overflow-hidden my-3 p-4"
              >
                <View className="flex-row mb-3">
                  <View className="relative">
                    <Image
                      source={{ uri: order.orderItems[0]?.image || "" }}
                      className="size-20 rounded-xl bg-background-darker"
                      resizeMode="cover"
                    />
                    {order.orderItems.length > 1 && (
                      <View className="absolute -bottom-1 -right-1 bg-primary-purple rounded-full size-7 items-center justify-center">
                        <Text className="text-text-primary text-xs font-extrabold">
                          +{order.orderItems.length - 1}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-1 ml-4 gap-2">
                    <Text className="text-text-primary font-extrabold text-base">
                      Pesanan #{order._id.slice(-8).toUpperCase()}
                    </Text>
                    <Text className="text-text-gray/70 font-semibold text-sm">
                      {formatDate(order.createdAt)}
                    </Text>
                    <View
                      className="self-start px-3 py-1.5 rounded-full"
                      style={{
                        backgroundColor: getStatusColor(order.status) + "20",
                      }}
                    >
                      <Text
                        className="text-xs font-bold"
                        style={{ color: getStatusColor(order.status) }}
                      >
                        {capitalizeLetter(order.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                {order.orderItems.map((item, index) => (
                  <View
                    key={item._id}
                    className="flex-1 flex-row justify-between items-center gap-2"
                  >
                    <Text
                      className="text-text-gray/70 text-sm font-semibold"
                      numberOfLines={1}
                    >
                      {item.name} -{" "}
                      <Text className="text-primary-purple">{item.size}</Text>
                    </Text>
                    <Text
                      className="text-text-gray/70 text-sm font-semibold"
                      numberOfLines={1}
                    >
                      x {item.quantity}
                    </Text>
                  </View>
                ))}

                <View className="border-t border-text-gray/20 mt-2 pt-3 flex-row justify-between items-center">
                  <View className="gap-2">
                    <Text className="text-text-gray/70 font-semibold text-xs">
                      ({totalItems}) Barang
                    </Text>
                    <Text className="text-accent-warning font-extrabold text-xl">
                      Rp. {order.totalPrice.toLocaleString("id-ID")}
                    </Text>
                  </View>

                  {order.status === "diterima" &&
                    (order.hasReviewed ? (
                      <View className="px-2">
                        <Image
                          source={require("@/assets/images/success.png")}
                          className="size-8"
                        />
                      </View>
                    ) : (
                      <TouchableOpacity
                        className="bg-primary-purple/20 border border-primary-purple px-4 py-2 rounded-full items-center"
                        activeOpacity={0.7}
                        onPress={() => handleOpenRating(order)}
                      >
                        <Text className="text-text-primary font-bold text-sm">
                          Beri Penilaian
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        order={selectedOrder}
        productRatings={productRatings}
        onSubmit={handleSubmitRating}
        isSubmitting={isCreatingRating}
        onRatingChange={(productId, rating) =>
          setProductRatings((prev) => ({ ...prev, [productId]: rating }))
        }
      />
    </SafeScreen>
  );
};

export default OrdersScreen;

function orderLoading() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size="large" color="#00d9ff" />
      <Text className="text-text-gray/70 mt-6">Memuat Pesanan...</Text>
    </View>
  );
}

function orderError() {
  return (
    <View className="flex-1 bg-background items-center justify-center px-4">
      <Image
        source={require("../../assets/images/empty-order.png")}
        className="size-40"
      />
      <Text className="text-text-primary text-xl font-bold mt-4">
        Gagal memuat pesanan
      </Text>
      <Text className="text-text-gray/70 text-center text-sm mt-2">
        Mohon periksa kembali internet Anda dan pastikan koneksinya stabil untuk
        memuat riwayat pesanan Anda.
      </Text>
    </View>
  );
}

function orderEmpty() {
  return (
    <View className="flex-1 bg-background">
      <View className="px-4 py-3 mt-8 bg-background border-b border-background-light flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Image
            source={require("../../assets/images/icons/arrow-left.png")}
            className="size-6"
          />
        </TouchableOpacity>
        <Text className="text-center text-xl font-bold text-text-primary">
          Riwayat Pesanan
        </Text>
      </View>
      <View className="flex-1 items-center justify-center px-10">
        <Image
          source={require("../../assets/images/empty-order.png")}
          className="size-40"
        />
        <Text className="text-text-primary text-xl font-bold mt-6">
          Anda belum memesan apapun
        </Text>
        <Text className="text-text-gray/70 text-center text-sm mt-2">
          Semua riwayat pesanan Anda akan muncul pada halaman ini jika Anda
          telah memesan sesuatu.
        </Text>
      </View>
    </View>
  );
}
