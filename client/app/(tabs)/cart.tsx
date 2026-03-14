import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useState } from "react";
import SafeScreen from "@/components/SafeScreen";
import useCart from "@/hooks/useCart";
import { useApi } from "@/lib/api";
import { useAddresses } from "@/hooks/useAddresses";
import { useStripe } from "@stripe/stripe-react-native";
import { Address } from "@/types";
import { router } from "expo-router";
import { formatPriceCompact } from "@/lib/formatPriceCompact";
import OrderSummary from "@/components/OrderSummary";
import AddressSelectionModal from "@/components/AddressSelectionModal";

const isPromoActive = (promo?: any) => {
  if (!promo?.startDate || !promo?.endDate) return false;

  const now = new Date();
  return now >= new Date(promo.startDate) && now <= new Date(promo.endDate);
};

const getDiscountedPrice = (price: number, discountPercent = 0) => {
  const discount = Math.max(0, Math.min(100, discountPercent));
  return Math.round(price - price * (discount / 100));
};

const CartScreen = () => {
  const api = useApi();
  const {
    addToCart,
    isAddingToCart,
    cart,
    cartItemCount,
    cartTotal,
    clearCart,
    isClearing,
    isError,
    isLoading,
    isRemoving,
    isUpdating,
    removeFromCart,
    updateQuantity,
  } = useCart();
  const { addresses } = useAddresses();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [updatingItemKey, setUpdatingItemKey] = useState<string | null>(null);

  const cartItems = cart?.items || [];
  const subtotal = cartTotal;
  const shipping = 8000;
  const tax = subtotal * 0.04;
  const total = subtotal + shipping + tax;

  const handleQuantityChange = async (
    productId: string,
    size: string,
    currentQuantity: number,
    change: number,
  ) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    const key = `${productId}-${size}`;
    setUpdatingItemKey(key);

    try {
      await updateQuantity({ productId, size, quantity: newQuantity });
    } finally {
      setUpdatingItemKey(null);
    }
  };

  const handleRemoveItem = (
    productId: string,
    productName: string,
    size: string,
  ) => {
    Alert.alert(
      "Hapus",
      `Yakin ingin menghapus ${productName} dengan ukuran ${size} dari keranjang?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Buang",
          style: "destructive",
          onPress: () => removeFromCart({ productId, size }),
        },
      ],
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    if (!addresses || addresses.length === 0) {
      Alert.alert(
        "Tidak Ada Alamat",
        "Mohon untuk menambahkan alamat pengiriman terlebih dahulu sebelum checkout.",
        [{ text: "OK" }],
      );
      return;
    }
    setAddressModalVisible(true);
  };

  const handleProceedWithPayment = async (selectedAddress: Address) => {};

  if (isLoading) {
    return <SafeScreen>{cartLoading()}</SafeScreen>;
  }

  if (isError) {
    return <SafeScreen>{cartError()}</SafeScreen>;
  }

  if (cartItems.length === 0) {
    return <SafeScreen>{cartEmpty()}</SafeScreen>;
  }

  return (
    <SafeScreen>
      {/* Header */}
      <View className="px-4 py-3 mt-8 bg-background flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Image
            source={require("../../assets/images/icons/arrow-left.png")}
            className="size-6"
          />
        </TouchableOpacity>
        <Text className="text-center text-xl font-bold text-text-primary">
          Keranjang
        </Text>
      </View>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 135 }}
      >
        <View className="p-4 gap-3">
          {cartItems.map((item, index) => {
            const selectedSize = item.product.sizes.find(
              (s) => s.size === item.size,
            );
            const itemKey = `${item.product._id}-${item.size}`;
            const isItemUpdating = updatingItemKey === itemKey;
            return (
              <View
                key={item._id}
                className="bg-background-light rounded-xl overflow-hidden"
              >
                <View className="flex-row p-3 gap-4">
                  <View className="relative">
                    <Image
                      source={{ uri: item.product.images?.[0]?.url }}
                      className="rounded-2xl bg-background-darker"
                      resizeMode="cover"
                      style={{
                        width: 102,
                        height: 126,
                        borderRadius: 16,
                      }}
                    />
                    <View className="absolute top-2 right-2 bg-background-light rounded-full px-2 py-0.5">
                      <Text className="text-text-primary text-xs font-bold">
                        {item.quantity}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-1 justify-between">
                    <View>
                      <View className="flex-row items-start">
                        <Text
                          className="flex-1 text-text-primary font-bold text-lg leading-tight"
                          numberOfLines={2}
                        >
                          {item.product.name}
                        </Text>

                        <TouchableOpacity
                          className="shadow-xl ml-2"
                          activeOpacity={0.7}
                          onPress={() =>
                            handleRemoveItem(
                              item.product._id,
                              item.product.name,
                              item.size,
                            )
                          }
                          disabled={isRemoving}
                        >
                          <View className="rounded-lg p-1 border bg-accent-error/20 border-accent-error">
                            <Image
                              source={require("../../assets/images/icons/trash.png")}
                              className="size-6"
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                      {selectedSize && (
                        <View>
                          {isPromoActive(item.product.promo) ? (
                            <>
                              <View className="flex-row items-center mt-2 gap-2">
                                <Text className="text-text-gray/70 text-xs font-semibold">
                                  Ukuran{" "}
                                  <Text className="text-accent-warning">
                                    {item.size}
                                  </Text>
                                </Text>
                                <View className="w-1 h-1 rounded-full bg-text-gray/70" />
                                <Text className="text-accent-warning text-xs font-semibold">
                                  {item.product.promo?.title}
                                </Text>
                              </View>

                              <View className="flex-row items-center mt-2 gap-3">
                                <Text className="text-text-gray/70 text-xs font-semibold line-through">
                                  Rp.{" "}
                                  {selectedSize.price.toLocaleString("id-ID")}
                                </Text>
                                <Text className="text-accent-error text-xs font-bold">
                                  -{item.product.promo?.discountPercent}%
                                </Text>
                              </View>

                              <View className="flex-row items-center mt-2 gap-2">
                                <Text className="text-accent-warning font-extrabold text-lg">
                                  Rp.{" "}
                                  {(
                                    getDiscountedPrice(
                                      selectedSize.price,
                                      item.product.promo?.discountPercent,
                                    ) * item.quantity
                                  ).toLocaleString("id-ID")}
                                </Text>
                                <Text className="text-text-gray/70 font-semibold text-[10px]">
                                  Rp.{" "}
                                  {formatPriceCompact(
                                    getDiscountedPrice(
                                      selectedSize.price,
                                      item.product.promo?.discountPercent,
                                    ),
                                  )}{" "}
                                  / Pcs
                                </Text>
                              </View>
                            </>
                          ) : (
                            <View className="mt-3">
                              <Text className="text-text-gray/70 text-xs font-semibold">
                                Ukuran{" "}
                                <Text className="text-accent-warning">
                                  {item.size}
                                </Text>
                              </Text>
                              <View className="flex-row items-center mt-2 gap-2">
                                <Text className="text-accent-warning font-extrabold text-lg">
                                  Rp.{" "}
                                  {(
                                    selectedSize.price * item.quantity
                                  ).toLocaleString("id-ID")}
                                </Text>
                                <Text className="text-text-gray/70 font-semibold text-[10px]">
                                  Rp. {formatPriceCompact(selectedSize.price)} /
                                  Pcs
                                </Text>
                              </View>
                            </View>
                          )}
                        </View>
                      )}
                    </View>

                    <View className="flex-row items-center mt-3">
                      <TouchableOpacity
                        className="bg-background-darker rounded-full w-8 h-8 items-center justify-center"
                        activeOpacity={0.7}
                        onPress={() =>
                          handleQuantityChange(
                            item.product._id,
                            item.size,
                            item.quantity,
                            -1,
                          )
                        }
                        disabled={isItemUpdating}
                      >
                        {isItemUpdating ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Image
                            source={require("../../assets/images/icons/minus.png")}
                            className="size-4"
                          />
                        )}
                      </TouchableOpacity>

                      <View className="mx-2 min-w-[32px] items-center">
                        <Text className="text-text-primary font-bold text-lg">
                          {item.quantity}
                        </Text>
                      </View>

                      <TouchableOpacity
                        className="bg-background-darker rounded-full w-8 h-8 items-center justify-center"
                        activeOpacity={0.7}
                        onPress={() =>
                          handleQuantityChange(
                            item.product._id,
                            item.size,
                            item.quantity,
                            1,
                          )
                        }
                        disabled={isItemUpdating}
                      >
                        {isItemUpdating ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Image
                            source={require("../../assets/images/icons/plus.png")}
                            className="size-4"
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <OrderSummary
          subtotal={subtotal}
          shipping={shipping}
          tax={tax}
          total={total}
        />
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-background-darker border-t border-background-light p-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Image
              source={require("../../assets/images/icons/shopping-cart.png")}
              className="size-5"
            />
            <Text className="text-text-gray/70 text-sm font-semibold">
              ({cartItemCount}) Barang
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-text-primary font-bold text-xl">
              Rp. {total.toLocaleString("id-ID")}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-background-light rounded-xl overflow-hidden"
          activeOpacity={0.8}
          onPress={handleCheckout}
          disabled={paymentLoading}
        >
          <View className="py-4 flex-row gap-2 items-center justify-center">
            {paymentLoading ? (
              <ActivityIndicator size="small" color="#121212" />
            ) : (
              <>
                <Image
                  source={require("../../assets/images/icons/checkout.png")}
                  className="size-5"
                />
                <Text className="text-accent-warning font-bold text-lg">
                  Checkout
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <AddressSelectionModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onProceed={handleProceedWithPayment}
        isProcessing={paymentLoading}
      />
    </SafeScreen>
  );
};

export default CartScreen;

function cartLoading() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size="large" color="#00d9ff" />
      <Text className="text-text-gray/70 mt-6">Memuat Keranjang...</Text>
    </View>
  );
}

function cartError() {
  return (
    <View className="flex-1 bg-background items-center justify-center px-4">
      <Image
        source={require("../../assets/images/empty-cart.png")}
        className="size-20"
      />
      <Text className="text-text-primary text-xl font-bold mt-6">
        Gagal memuat keranjang
      </Text>
      <Text className="text-text-gray/70 text-center text-sm mt-2">
        Mohon periksa kembali internet Anda dan pastikan koneksinya stabil untuk
        memuat keranjang Anda.
      </Text>
    </View>
  );
}

function cartEmpty() {
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
          Keranjang
        </Text>
      </View>
      <View className="flex-1 items-center justify-center px-4">
        <Image
          source={require("../../assets/images/empty-cart.png")}
          className="size-20"
        />
        <Text className="text-text-primary text-xl font-bold mt-6">
          Keranjang Anda kosong
        </Text>
        <Text className="text-text-gray/70 text-center text-sm mt-2">
          Mohon jelajahi barang-barang yang tersedia dan masukkan ke dalam
          keranjang untuk melanjutkan proses pemesanan.
        </Text>
      </View>
    </View>
  );
}
