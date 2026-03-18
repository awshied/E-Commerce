import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import React, { useCallback, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useProduct } from "@/hooks/useProduct";
import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";
import SafeScreen from "@/components/SafeScreen";
import { Product } from "@/types";
import { formatDate } from "@/lib/formatDate";

const { width } = Dimensions.get("window");

const isPromoActive = (promo?: Product["promo"]) => {
  if (!promo?.startDate || !promo?.endDate) return false;

  const now = new Date();
  return now >= new Date(promo.startDate) && now <= new Date(promo.endDate);
};

const getDiscountedPrice = (price: number, discountPercent = 0) => {
  const discount = Math.max(0, Math.min(100, discountPercent));
  return Math.round(price - price * (discount / 100));
};

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isError, isLoading } = useProduct(id);
  const { addToCart, isAddingToCart } = useCart();
  const {
    isInWishlist,
    toggleWishlist,
    isAddingToWishlist,
    isRemovingFromWishlist,
  } = useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState<{
    [productId: string]: Product["sizes"][number];
  }>({});
  const [quantity, setQuantity] = useState(1);

  const heartOutline = require("../../assets/images/icons/heart-outline.png");
  const heartFill = require("../../assets/images/icons/heart-fill.png");

  const availableSizes = product?.sizes.filter((s) => s.stock > 0);
  const selectedSize = product
    ? (selectedSizes[product._id] ??
      availableSizes?.[0] ??
      product.sizes[0] ??
      null)
    : null;

  const handleSelectSize = useCallback(
    (productId: string, sizeObj: Product["sizes"][number]) => {
      setSelectedSizes((prev) => ({
        ...prev,
        [productId]: sizeObj,
      }));
      setQuantity(1);
    },
    [],
  );

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;

    addToCart(
      { productId: product._id, size: selectedSize.size, quantity },
      {
        onSuccess: () =>
          Alert.alert(
            "Yeay",
            `Anda baru saja menambahkan ${product.name} ke dalam keranjang.`,
          ),
        onError: (error: any) => {
          Alert.alert(
            "Error",
            error?.response?.data?.error ||
              "Gagal menambahkan ke dalam keranjang",
          );
        },
      },
    );
  };

  if (isLoading) return <ProductDetailLoading />;
  if (isError || !product || !selectedSize) return <ProductDetailError />;

  const unitPrice = isPromoActive(product.promo)
    ? getDiscountedPrice(selectedSize.price, product.promo?.discountPercent)
    : selectedSize.price;

  const totalPrice = unitPrice * quantity;

  const inStock = product.sizes.some((size) => size.stock > 0);

  return (
    <SafeScreen>
      {/* Header */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View className="relative">
          <View className="absolute -top-8 left-0 right-0 z-10 px-4 pt-20 pb-4 flex-row items-center justify-between">
            <TouchableOpacity
              className="bg-black/30 backdrop-blur-xl w-12 h-12 rounded-full items-center justify-center"
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Image
                source={require("../../assets/images/icons/arrow-left.png")}
                className="size-6"
              />
            </TouchableOpacity>
            <TouchableOpacity
              className={`w-12 h-12 rounded-full items-center justify-center ${isInWishlist(product._id) ? "bg-background-light" : "bg-black/30 backdrop-blur-xl"}`}
              onPress={() => toggleWishlist(product._id)}
              disabled={isAddingToWishlist || isRemovingFromWishlist}
              activeOpacity={0.7}
            >
              {isAddingToWishlist || isRemovingFromWishlist ? (
                <ActivityIndicator size="small" color="#d2d2d2" />
              ) : (
                <Image
                  source={isInWishlist(product._id) ? heartFill : heartOutline}
                  className="size-6"
                />
              )}
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            pagingEnabled
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
          >
            {product.images?.map((image, index) => (
              <View key={image.public_id} style={{ width }}>
                <Image
                  source={{ uri: image.url }}
                  style={{ width, height: 400 }}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>

          {/* Indikator */}
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
            {product.images?.map((_: any, index: number) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  index === selectedImageIndex
                    ? "bg-primary-purple w-6"
                    : "bg-gray-300 w-2"
                }`}
              />
            ))}
          </View>
        </View>

        {/* Informasi Barang */}
        <View className="px-4 py-6 overflow-hidden">
          {isPromoActive(product.promo) && (
            <View className="flex-row items-center gap-2 mb-4">
              <View className="flex-row items-center gap-2">
                <Image
                  source={require("../../assets/images/icons/calendar.png")}
                  className="size-4"
                />
                <Text className="font-semibold text-text-gray/70 text-xs">
                  {product.promo?.startDate &&
                    formatDate(product.promo.startDate)}{" "}
                  -{" "}
                  {product.promo?.endDate && formatDate(product.promo.endDate)}
                </Text>
              </View>
              <View className="w-1 h-1 bg-text-primary/70 rounded-full" />
              <Text className="font-bold text-accent-warning text-xs">
                {product.promo?.title}
              </Text>
            </View>
          )}
          <View className="flex-row items-center gap-5 mb-3">
            <View className="flex-row items-center gap-2">
              <Image
                source={require("../../assets/images/icons/product-category.png")}
                className="size-4"
              />
              <Text className="text-text-gray text-sm font-bold">
                {product.category}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Image
                source={require("../../assets/images/icons/product-type.png")}
                className="size-4"
              />
              <Text className="text-text-gray text-sm font-bold">
                {product.type}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Image
                source={require("../../assets/images/icons/product-gender-fit.png")}
                className="size-4"
              />
              <Text className="text-text-gray text-sm font-bold">
                {product.gender}
              </Text>
            </View>
          </View>

          <Text
            className="text-text-primary text-3xl font-extrabold mb-3"
            numberOfLines={2}
          >
            {product.name}
          </Text>

          <View className="flex-row items-center mb-4 justify-between">
            <View className="flex-row items-center gap-2">
              <Image
                source={require("../../assets/images/icons/full-star.png")}
                className="size-4"
              />
              <Text className="text-text-primary font-bold text-base">
                {(product.averageRating ?? 0).toFixed(1)}
              </Text>
            </View>
            <Text className="text-text-gray/70 text-sm">
              ({product.totalReviews}) rating
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            <View className="flex-row gap-2">
              {product.sizes.map((sizeItem) => {
                const isSizeOut = sizeItem.stock === 0;
                const isActive = selectedSize?.size === sizeItem.size;

                return (
                  <TouchableOpacity
                    key={sizeItem.size}
                    disabled={isSizeOut}
                    onPress={() =>
                      !isSizeOut && handleSelectSize(product._id, sizeItem)
                    }
                    activeOpacity={0.7}
                    className={`px-4 py-2 rounded-lg border ${
                      isSizeOut
                        ? "border-text-gray/10 bg-text-gray/5"
                        : isActive
                          ? "border-primary-purple bg-primary-purple/10"
                          : "border-text-gray/40"
                    }`}
                  >
                    <Text
                      className={`text-lg font-extrabold ${
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

          <View className="mb-4">
            {!isPromoActive(product.promo) && (
              <Text className="text-sm font-semibold text-accent-error mb-2">
                {selectedSize.stock}{" "}
                <Text className="text-text-gray/70"> Stok Tersedia</Text>
              </Text>
            )}
            {isPromoActive(product.promo) ? (
              <View className="gap-3 justify-center">
                <View className="flex-row gap-2 items-center">
                  <Text className="text-sm font-semibold text-text-gray/70 line-through">
                    Rp. {selectedSize.price.toLocaleString("id-ID")}
                  </Text>
                  <View className="w-1 h-1 bg-text-gray/70 rounded-full" />
                  {selectedSize && selectedSize.stock > 0 ? (
                    <Text className="text-sm font-semibold text-accent-error">
                      {selectedSize.stock}{" "}
                      <Text className="text-text-gray/70"> Stok Tersedia</Text>
                    </Text>
                  ) : (
                    <View className="flex-row items-start gap-1">
                      <Text className="text-xs font-semibold text-accent-error">
                        *
                      </Text>
                      <Text className="text-sm font-semibold text-accent-error">
                        Stok Habis
                      </Text>
                    </View>
                  )}
                </View>
                <View className="flex-row gap-3 items-start">
                  <View className="flex-row gap-2 items-end">
                    <Text className="text-accent-warning font-extrabold text-lg">
                      Rp.
                    </Text>
                    <Text className="text-accent-warning font-extrabold text-4xl">
                      {getDiscountedPrice(
                        selectedSize.price,
                        product.promo?.discountPercent,
                      ).toLocaleString("id-ID")}
                    </Text>
                  </View>
                  {isPromoActive(product.promo) && (
                    <Text className="text-accent-error font-bold text-lg">
                      -{product.promo?.discountPercent}%
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              <View className="flex-row gap-2 items-end">
                <Text className="text-accent-warning font-extrabold text-lg">
                  Rp.
                </Text>
                <Text className="text-accent-warning font-extrabold text-4xl">
                  {selectedSize.price.toLocaleString("id-ID")}
                </Text>
              </View>
            )}
          </View>
          <View className="mb-4">
            <View className="flex-row items-center">
              <TouchableOpacity
                className="bg-background-light rounded-full w-10 h-10 items-center justify-center"
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                activeOpacity={0.7}
                disabled={!inStock}
              >
                <Image
                  source={require("../../assets/images/icons/minus.png")}
                  className="size-5"
                />
              </TouchableOpacity>

              <Text className="text-text-primary text-xl font-bold mx-4">
                {quantity}
              </Text>

              <TouchableOpacity
                className="bg-background-light rounded-full w-10 h-10 items-center justify-center"
                onPress={() =>
                  setQuantity((prev) => Math.min(selectedSize.stock, prev + 1))
                }
                activeOpacity={0.7}
                disabled={!inStock || quantity >= selectedSize.stock}
              >
                <Image
                  source={require("../../assets/images/icons/plus.png")}
                  className="size-5"
                />
              </TouchableOpacity>
            </View>

            {quantity >= selectedSize.stock && inStock && (
              <View className="flex-row items-start gap-1">
                <Text className="text-xs mt-2 text-accent-error">*</Text>
                <Text className="text-sm mt-2 text-accent-error">
                  Anda sudah mencapai stok maksimum
                </Text>
              </View>
            )}
          </View>

          <View className="mb-8">
            <Text className="text-text-primary text-lg font-bold mb-3">
              Deskripsi Barang
            </Text>
            <Text className="text-text-gray/70 font-semibold text-base leading-6">
              {product.description}
            </Text>
          </View>
        </View>
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-background-light p-4 pb-12">
        <View className="flex-row items-center gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-text-gray/70 text-sm font-semibold">
              Jumlah Harga
            </Text>
            <Text className="text-text-primary text-2xl font-bold">
              Rp. {totalPrice.toLocaleString("id-ID")}
            </Text>
          </View>
          <TouchableOpacity
            className={`rounded-2xl px-6 py-3 flex-row items-center ${
              !inStock ? "bg-surface" : "bg-background-light"
            }`}
            activeOpacity={0.8}
            onPress={handleAddToCart}
            disabled={!inStock || isAddingToCart}
          >
            {isAddingToCart ? (
              <ActivityIndicator size="small" color="#d2d2d2" />
            ) : (
              <Text
                className={`font-bold text-lg ${
                  !inStock ? "" : "text-text-primary"
                }`}
              >
                {!inStock ? "Stok Habis" : "Keranjang"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeScreen>
  );
};

export default ProductDetailScreen;

function ProductDetailLoading() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#00d9ff" />
        <Text className="text-text-gray/70 mt-6">Memindai barang...</Text>
      </View>
    </SafeScreen>
  );
}

function ProductDetailError() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-4">
        <Image
          source={require("../../assets/images/not-found.png")}
          className="size-24"
        />
        <Text className="text-text-primary text-xl font-bold mt-6">
          Barang tidak ditemukan
        </Text>
        <Text className="text-text-gray/70 text-center text-sm mt-2">
          Barang ini mungkin sudah disingkirkan atau memang tidak pernah ada
          dalam toko
        </Text>
        <TouchableOpacity
          className="bg-background-light rounded-xl px-6 py-3 mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-text-primary font-bold text-base">Kembali</Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}
