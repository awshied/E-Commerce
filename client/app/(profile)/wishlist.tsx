import {
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import React from "react";
import SafeScreen from "@/components/SafeScreen";
import useWishlist from "@/hooks/useWishlist";
import useCart from "@/hooks/useCart";
import { router } from "expo-router";
import { Product } from "@/types";

const isPromoActive = (promo?: Product["promo"]) => {
  if (!promo?.startDate || !promo?.endDate) return false;

  const now = new Date();
  return now >= new Date(promo.startDate) && now <= new Date(promo.endDate);
};

const getDiscountedPrice = (price: number, discountPercent = 0) => {
  const discount = Math.max(0, Math.min(100, discountPercent));
  return Math.round(price - price * (discount / 100));
};

const WishlistScreen = () => {
  const {
    wishlist,
    isLoading,
    isError,
    removeFromWishlist,
    isRemovingFromWishlist,
  } = useWishlist();
  const { addToCart, isAddingToCart } = useCart();

  const [selectedSizes, setSelectedSizes] = React.useState<{
    [productId: string]: Product["sizes"][number];
  }>({});

  const handleRemoveFromWishlist = (productId: string, productName: string) => {
    Alert.alert("Hapus dari favorit", `Hapus ${productName} dari favorit`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => removeFromWishlist(productId),
      },
    ]);
  };

  const handleSelectSize = (
    productId: string,
    sizeObj: Product["sizes"][number],
  ) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: sizeObj,
    }));
  };

  const handleAddToCart = (
    productId: string,
    productName: string,
    size: string,
  ) => {
    addToCart(
      { productId, size, quantity: 1 },
      {
        onSuccess: () =>
          Alert.alert(
            "Berhasil",
            `${productName} baru saja ditambahkan ke dalam keranjang.`,
          ),
        onError: (error: any) => {
          Alert.alert(
            "Gagal",
            error?.response?.data?.error ||
              "Gagal menambahkan produk ini ke dalam keranjang.",
          );
        },
      },
    );
  };

  if (isLoading) return <WishlistLoading />;
  if (isError) return <WishlistError />;

  return (
    <SafeScreen>
      <View className="px-4 py-3 mt-8 bg-background border-b border-background-light flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Image
              source={require("../../assets/images/icons/arrow-left.png")}
              className="size-6"
            />
          </TouchableOpacity>
          <Text className="text-center text-xl font-bold text-text-primary">
            Menu Favorit
          </Text>
        </View>
        <Text className="text-text-gray/70 text-sm">
          ({wishlist.length}) Favorit
        </Text>
      </View>

      {wishlist.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <Image
            source={require("../../assets/images/empty-wishlist.png")}
            className="size-20"
          />
          <Text className="text-text-primary text-xl font-bold mt-6">
            Anda belum memiliki barang favorit
          </Text>
          <Text className="text-text-gray/70 text-center text-sm mt-2">
            Temukan barang yang Anda inginkan dan simpan sebagai barang favorit.
          </Text>
          <TouchableOpacity
            className="bg-background-light rounded-2xl px-8 py-4 mt-6"
            activeOpacity={0.7}
            onPress={() => router.push("/(tabs)")}
          >
            <Text className="text-text-primary font-bold text-base">
              Cari Barang
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4">
            {wishlist.map((item) => {
              const availableSizes = item.sizes.filter((s) => s.stock > 0);
              const selectedSize =
                selectedSizes[item._id] || availableSizes[0] || item.sizes[0];
              return (
                <TouchableOpacity
                  key={item._id}
                  className="bg-background-light rounded-xl overflow-hidden mb-3"
                  activeOpacity={0.7}
                  // onPress={() => router.push(`/product/${item._id}`)}
                >
                  <View className="flex-row p-3 gap-4">
                    <Image
                      source={{ uri: item.images?.[0]?.url }}
                      className="size-32 rounded-2xl bg-background-darker"
                    />
                    <View className="flex-1">
                      <View className="flex-row justify-between mb-1 items-start">
                        <View className="flex-1 gap-1 pr-3">
                          <Text
                            className="text-text-primary font-bold text-lg"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {item.name}
                          </Text>
                          <View className="flex-row gap-2 items-center mb-2">
                            <View className="flex-row gap-1 items-center">
                              <Image
                                source={require("../../assets/images/icons/full-star.png")}
                                className="size-4"
                              />
                              <Text className="text-text-primary text-xs font-semibold">
                                {(item.averageRating ?? 0).toFixed(1)}
                              </Text>
                            </View>
                            {isPromoActive(item.promo) && (
                              <View className="flex-row items-center gap-2">
                                <View className="w-1 h-1 rounded-full bg-text-gray/70" />
                                <Text className="font-bold text-accent-warning text-xs">
                                  {item.promo?.title}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <TouchableOpacity
                          className="shadow-xl self-start"
                          activeOpacity={0.7}
                          onPress={() =>
                            handleRemoveFromWishlist(item._id, item.name)
                          }
                          disabled={isRemovingFromWishlist}
                        >
                          <View className="rounded-lg p-1.5 border bg-accent-error/20 border-accent-error">
                            <Image
                              source={require("../../assets/images/icons/unwishlist.png")}
                              className="size-5"
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-2"
                      >
                        <View className="flex-row gap-2 pr-2">
                          {item.sizes.map((sizeItem) => {
                            const isSizeOut = sizeItem.stock === 0;
                            const isActive =
                              selectedSize?.size === sizeItem.size;

                            return (
                              <TouchableOpacity
                                key={sizeItem.size}
                                disabled={isSizeOut}
                                onPress={() =>
                                  !isSizeOut &&
                                  handleSelectSize(item._id, sizeItem)
                                }
                                activeOpacity={0.7}
                                className={`px-3 py-1 rounded-full border ${
                                  isSizeOut
                                    ? "border-text-gray/10 bg-text-gray/5"
                                    : isActive
                                      ? "border-primary-purple bg-primary-purple/10"
                                      : "border-text-gray/40"
                                }`}
                              >
                                <Text
                                  className={`text-[8px] font-bold ${
                                    isSizeOut
                                      ? "text-text-gray/30"
                                      : isActive
                                        ? "text-primary-purple"
                                        : "text-text-gray/70"
                                  }`}
                                >
                                  {sizeItem.size}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </ScrollView>

                      {selectedSize.stock > 0 ? (
                        <Text className="text-xs font-semibold text-accent-warning">
                          {selectedSize.stock}{" "}
                          <Text className="text-text-gray/70">
                            {" "}
                            Stok Tersisa
                          </Text>
                        </Text>
                      ) : (
                        <Text className="text-xs font-semibold text-text-gray/50">
                          Stok Habis
                        </Text>
                      )}

                      <View className="mb-2">
                        {isPromoActive(item.promo) ? (
                          <View className="flex-row gap-2 items-center">
                            <Text className="text-text-primary font-extrabold text-lg">
                              Rp.{" "}
                              {getDiscountedPrice(
                                selectedSize.price,
                                item.promo?.discountPercent,
                              ).toLocaleString("id-ID")}
                            </Text>
                            <Text className="text-xs font-semibold text-text-gray/70 line-through">
                              Rp. {selectedSize.price.toLocaleString("id-ID")}
                            </Text>
                          </View>
                        ) : (
                          <Text className="text-text-primary font-extrabold text-lg">
                            Rp. {selectedSize.price.toLocaleString("id-ID")}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                  {selectedSize.stock > 0 && (
                    <View className="px-3 mb-4">
                      <TouchableOpacity
                        className="bg-primary-purple/20 rounded-xl py-3 items-center border border-primary-purple"
                        activeOpacity={0.7}
                        onPress={() =>
                          handleAddToCart(
                            item._id,
                            item.name,
                            selectedSize.size,
                          )
                        }
                        disabled={isAddingToCart}
                      >
                        {isAddingToCart ? (
                          <ActivityIndicator size="small" color="#818cf8" />
                        ) : (
                          <Text className="text-text-primary font-bold">
                            Masukkan Keranjang
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeScreen>
  );
};

export default WishlistScreen;

function WishlistLoading() {
  return (
    <SafeScreen>
      <View className="px-4 py-3 mt-8 bg-background border-b border-background-light flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Image
            source={require("../../assets/images/icons/arrow-left.png")}
            className="size-6"
          />
        </TouchableOpacity>
        <Text className="text-center text-xl font-bold text-text-primary">
          Menu Favorit
        </Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#00d9ff" />
        <Text className="text-text-gray/70 mt-6">
          Memuat barang favorit Anda...
        </Text>
      </View>
    </SafeScreen>
  );
}

function WishlistError() {
  return (
    <SafeScreen>
      <View className="px-4 py-3 mt-8 bg-background border-b border-background-light flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Image
            source={require("../../assets/images/icons/arrow-left.png")}
            className="size-6"
          />
        </TouchableOpacity>
        <Text className="text-center text-xl font-bold text-text-primary">
          Menu Favorit
        </Text>
      </View>
      <View className="flex-1 items-center justify-center px-4">
        <Image
          source={require("../../assets/images/empty-wishlist.png")}
          className="size-20"
        />
        <Text className="text-text-primary text-xl font-bold mt-6">
          Gagal memuat barang favorit Anda
        </Text>
        <Text className="text-text-gray/70 text-center text-sm mt-2">
          Mohon periksa kembali internet Anda dan pastikan koneksinya stabil
          untuk memuat barang favorit Anda.
        </Text>
      </View>
    </SafeScreen>
  );
}
