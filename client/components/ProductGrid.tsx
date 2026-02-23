import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";

import { Product } from "@/types";
import useWishlist from "@/hooks/useWishlist";
import useCart from "@/hooks/useCart";
import { formatPriceCompact } from "@/lib/formatPriceCompact";

interface ProductGridProps {
  isLoading: boolean;
  isError: boolean;
  products: Product[];
}

const isPromoActive = (promo?: Product["promo"]) => {
  if (!promo?.startDate || !promo?.endDate) return false;

  const now = new Date();
  return now >= new Date(promo.startDate) && now <= new Date(promo.endDate);
};

const getDiscountedPrice = (price: number, discountPercent = 0) => {
  const discount = Math.max(0, Math.min(100, discountPercent));
  return Math.round(price - price * (discount / 100));
};

const ProductGrid = ({ products, isLoading, isError }: ProductGridProps) => {
  const [selectedSizes, setSelectedSizes] = useState<{
    [productId: string]: Product["sizes"][number];
  }>({});
  const [wishlistLoading, setWishlistLoading] = useState<
    Record<string, boolean>
  >({});
  const [cartLoading, setCartLoading] = useState<Record<string, boolean>>({});

  const { isInWishlist, toggleWishlist } = useWishlist();

  const { addToCart } = useCart();

  const heartOutline = require("../assets/images/icons/heart-outline.png");
  const heartFill = require("../assets/images/icons/heart-fill.png");

  const handleToggleWishlist = async (productId: string) => {
    setWishlistLoading((prev) => ({ ...prev, [productId]: true }));

    try {
      await toggleWishlist(productId);
    } catch (error: any) {
      Alert.alert(
        "Gagal",
        error?.response?.data?.error || "Gagal menambahkan sebagai favorit.",
      );
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [productId]: false }));
    }
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
    setCartLoading((prev) => ({ ...prev, [productId]: true }));

    addToCart(
      { productId, size, quantity: 1 },
      {
        onSuccess: () => {
          Alert.alert(
            "Sukses",
            `${productName} telah ditambahkan ke dalam keranjang.`,
          );
        },
        onError: (error: any) => {
          Alert.alert(
            "Gagal",
            error?.response?.data?.error ||
              "Gagal menambahkan barang ke dalam keranjang.",
          );
        },
        onSettled: () => {
          setCartLoading((prev) => ({ ...prev, [productId]: false }));
        },
      },
    );
  };

  const renderProduct = ({ item: product }: { item: Product }) => {
    if (!product.sizes.length) return null;

    const isWishlistLoading = wishlistLoading[product._id];
    const availableSizes = product.sizes.filter((s) => s.stock > 0);
    const selectedSize =
      selectedSizes[product._id] || availableSizes[0] || product.sizes[0];
    const isOutOfStock = selectedSize?.stock === 0;
    const isCartLoading = cartLoading[product._id];

    return (
      <TouchableOpacity
        className="bg-background-light rounded-xl overflow-hidden mb-3"
        style={{ width: "48%" }}
        activeOpacity={0.8}
        onPress={() => router.push(`/product/${product._id}`)}
      >
        <View className="relative">
          {product.images?.[0]?.url ? (
            <Image
              source={{ uri: product.images[0].url }}
              className="w-full h-44 bg-background-darker"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-44 bg-background-darker" />
          )}

          <TouchableOpacity
            className="absolute top-2 right-2 bg-black/30 backdrop-blur-xl p-2 rounded-full"
            activeOpacity={0.7}
            onPress={() => handleToggleWishlist(product._id)}
            disabled={isWishlistLoading}
          >
            {isWishlistLoading ? (
              <ActivityIndicator size="small" color="#d2d2d2" />
            ) : (
              <Image
                source={isInWishlist(product._id) ? heartFill : heartOutline}
                className="size-5"
              />
            )}
          </TouchableOpacity>

          <View className="absolute bottom-1 left-1 bg-black/30 backdrop-blur-xl rounded-xl">
            {isPromoActive(product.promo) && (
              <Text className="py-1 px-3 font-bold text-accent-warning text-xs">
                {product.promo?.title}
              </Text>
            )}
          </View>
        </View>

        <View className="py-3 px-2">
          <View className="flex-row items-center justify-between px-1">
            <Text className="text-text-gray/70 text-xs font-bold mb-1">
              {product.category}
            </Text>
            <View className="flex-row items-center mb-2">
              <Image
                source={require("../assets/images/icons/full-star.png")}
                className="size-4"
              />
              <Text className="text-text-primary text-xs font-semibold ml-1">
                {(product.averageRating ?? 0).toFixed(1)}
              </Text>
              <Text className="text-text-gray/70 text-xs ml-1">
                ({product.totalReviews ?? 0})
              </Text>
            </View>
          </View>
          <Text
            className="text-text-primary font-extrabold text-base mb-2 mt-1 px-1"
            numberOfLines={2}
          >
            {product.name}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-2"
          >
            <View className="flex-row gap-2 pr-2 pl-1">
              {product.sizes.map((sizeItem) => {
                const isOutOfStock = sizeItem.stock === 0;
                const isActive = selectedSize.size === sizeItem.size;

                return (
                  <TouchableOpacity
                    key={sizeItem.size}
                    disabled={isOutOfStock}
                    onPress={() =>
                      !isOutOfStock && handleSelectSize(product._id, sizeItem)
                    }
                    activeOpacity={0.7}
                    className={`px-3 py-1 rounded-full border ${
                      isOutOfStock
                        ? "border-text-gray/10 bg-text-gray/5"
                        : isActive
                          ? "border-primary-purple bg-primary-purple/10"
                          : "border-text-gray/40"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isOutOfStock
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

          {/* Harga */}
          <View className="mt-2 px-1">
            {isPromoActive(product.promo) ? (
              <View>
                {/* Harga Asli */}
                <View className="flex-row gap-2 items-center">
                  <Text className="text-xs font-semibold text-text-gray/70 line-through">
                    Rp. {formatPriceCompact(selectedSize.price)}
                  </Text>
                  <Text className="font-bold text-accent-error text-xs">
                    -{product.promo?.discountPercent}%
                  </Text>
                </View>

                {/* Harga Promo */}
                <View className="flex-row gap-2 items-center">
                  <Text className="text-accent-warning font-extrabold text-lg">
                    Rp.{" "}
                    {formatPriceCompact(
                      getDiscountedPrice(
                        selectedSize.price,
                        product.promo?.discountPercent,
                      ),
                    )}
                  </Text>
                  <Text className="text-text-gray/70 font-semibold text-xs">
                    / Pcs
                  </Text>
                </View>
              </View>
            ) : (
              <View className="flex-row gap-2 items-center">
                <Text className="text-text-primary font-extrabold text-lg">
                  Rp. {formatPriceCompact(selectedSize.price)}
                </Text>
                <Text className="text-text-gray/70 font-semibold text-xs">
                  / Pcs
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            className={`bg-primary-purple/10 border border-primary-purple rounded-md w-full flex-row items-center justify-center mt-3 ${
              isOutOfStock ? "opacity-40" : ""
            }`}
            activeOpacity={0.7}
            onPress={() =>
              handleAddToCart(product._id, product.name, selectedSize.size)
            }
            disabled={isCartLoading || isOutOfStock}
          >
            {isCartLoading ? (
              <ActivityIndicator size="small" color="#d2d2d2" />
            ) : (
              <Text className="text-sm py-2 font-semibold text-primary-purple">
                Keranjang
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View className="py-20 items-center justify-center">
        <ActivityIndicator size="large" color="#2fd4bf" />
        <Text className="text-text-gray/70 mt-6">Memindai barang...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="py-20 items-center justify-center">
        <Image
          source={require("../assets/images/not-found.png")}
          className="size-20"
        />
        <Text className="text-text-primary text-xl font-bold mt-6">
          Gagal memuat barang
        </Text>
        <Text className="text-text-gray/70 text-center text-sm mt-2">
          Coba lagi nanti.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item) => item._id}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={NoProductsFound}
    />
  );
};

export default ProductGrid;

const NoProductsFound = () => {
  return (
    <View className="py-20 items-center justify-center">
      <Image
        source={require("../assets/images/not-found.png")}
        className="size-20"
      />
      <Text className="text-text-primary text-xl font-bold mt-6">
        Barang tidak ditemukan
      </Text>
      <Text className="text-text-gray/70 text-center text-sm mt-2">
        Sesuaikan pencarian Anda untuk menemukan barang yang tersedia.
      </Text>
    </View>
  );
};
