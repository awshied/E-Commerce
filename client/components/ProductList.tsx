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

interface ProductListProps {
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

const ProductList = ({ products, isLoading, isError }: ProductListProps) => {
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

    const selectedSize = selectedSizes[product._id] || product.sizes[0];
    const isCartLoading = cartLoading[product._id];

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push(`/product/${product._id}`)}
        className="flex-row bg-background-light rounded-xl overflow-hidden mb-3"
      >
        <View className="relative">
          <Image
            source={{ uri: product.images?.[0]?.url }}
            className="h-40 w-28 bg-background-darker"
            resizeMode="cover"
          />
          <View className="absolute bottom-1 left-1 bg-background-light/70 rounded-xl">
            <View className="flex-row items-center px-2 py-1">
              <Image
                source={require("../assets/images/icons/full-star.png")}
                className="size-4"
              />
              <Text className="text-text-primary text-xs font-semibold ml-1">
                {product.averageRating.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-1">
          <View className="p-4">
            <View className="flex-row items-start justify-between">
              <Text
                className="flex-1 text-text-primary font-extrabold text-lg mb-2 mr-3"
                numberOfLines={1}
              >
                {product.name}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleToggleWishlist(product._id)}
                disabled={isWishlistLoading}
              >
                {isWishlistLoading ? (
                  <ActivityIndicator size="small" color="#d2d2d2" />
                ) : (
                  <Image
                    source={
                      isInWishlist(product._id) ? heartFill : heartOutline
                    }
                    className="size-5"
                  />
                )}
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center gap-4 mb-3">
              <View className="flex-row items-center gap-1">
                <Image
                  source={require("../assets/images/icons/product-category.png")}
                  className="size-4"
                />
                <Text className="text-text-gray/70 text-xs font-bold">
                  {product.category}
                </Text>
              </View>

              <View className="flex-row items-center gap-1">
                <Image
                  source={require("../assets/images/icons/product-gender-fit.png")}
                  className="size-4"
                />
                <Text className="text-text-gray/70 text-xs font-bold">
                  {product.gender}
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-2"
            >
              <View className="flex-row gap-2 pr-2">
                {product.sizes.map((sizeItem) => {
                  const isActive = selectedSize.size === sizeItem.size;

                  return (
                    <TouchableOpacity
                      key={sizeItem.size}
                      onPress={() => handleSelectSize(product._id, sizeItem)}
                      activeOpacity={0.7}
                      className={`px-3 py-1 rounded-full border ${
                        isActive
                          ? "border-primary-purple bg-primary-purple/10"
                          : "border-text-gray/40"
                      }`}
                    >
                      <Text
                        className={`text-[8px] font-bold ${
                          isActive ? "text-primary-purple" : "text-text-gray/70"
                        }`}
                      >
                        {sizeItem.size}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View className="flex-row justify-between items-center mt-1">
              <View>
                {isPromoActive(product.promo) ? (
                  <View className="flex-row gap-2 items-center">
                    {/* Harga Promo */}
                    <Text className="text-accent-warning font-extrabold text-xl">
                      Rp.{" "}
                      {getDiscountedPrice(
                        selectedSize.price,
                        product.promo?.discountPercent,
                      ).toLocaleString("id-ID")}
                    </Text>
                    <Text className="text-xs font-semibold text-text-gray/70 line-through">
                      Rp. {formatPriceCompact(selectedSize.price)}
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row gap-2 items-center">
                    <Text className="text-text-primary font-extrabold text-xl">
                      Rp. {selectedSize.price.toLocaleString("id-ID")}
                    </Text>
                    <Text className="text-text-gray/70 font-semibold text-xs">
                      / Pcs
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  handleAddToCart(product._id, product.name, selectedSize.size)
                }
                disabled={isCartLoading}
              >
                {isCartLoading ? (
                  <ActivityIndicator size="small" color="#d2d2d2" />
                ) : (
                  <Image
                    source={require("../assets/images/icons/shopping-cart.png")}
                    className="size-5"
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
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
      numColumns={1}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={NoProductsFound}
    />
  );
};

export default ProductList;

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
