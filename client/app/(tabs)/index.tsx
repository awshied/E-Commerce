import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  useWindowDimensions,
} from "react-native";
import React, { useMemo, useState, useEffect, useRef } from "react";

import SafeScreen from "@/components/SafeScreen";
import { useAuthStore } from "@/store/useAuthStore";
import ProductGrid from "@/components/ProductGrid";
import useProducts from "@/hooks/useProducts";
import ProductList from "@/components/ProductList";
import FilterModal from "@/components/FilterModal";
import { ProductFilter } from "@/types/index";

const Kategori = [
  {
    name: "Semua",
    imageOutline: require("@/assets/images/categories/all-categories-outline.png"),
    imageFill: require("@/assets/images/categories/all-categories-fill.png"),
  },
  {
    name: "Pakaian",
    imageOutline: require("@/assets/images/categories/outfits-outline.png"),
    imageFill: require("@/assets/images/categories/outfits-fill.png"),
  },
  {
    name: "Aksesoris",
    imageOutline: require("@/assets/images/categories/accessories-outline.png"),
    imageFill: require("@/assets/images/categories/accessories-fill.png"),
  },
  {
    name: "Elektronik",
    imageOutline: require("@/assets/images/categories/electronics-outline.png"),
    imageFill: require("@/assets/images/categories/electronics-fill.png"),
  },
  {
    name: "Kosmetik",
    imageOutline: require("@/assets/images/categories/cosmetics-outline.png"),
    imageFill: require("@/assets/images/categories/cosmetics-fill.png"),
  },
];

const promoBanner = [
  require("../../assets/images/ramadhan-sale.png"),
  require("../../assets/images/christmas-sale.png"),
  require("../../assets/images/dirgahayu-sale.png"),
  require("../../assets/images/new-arrival-sale.png"),
];

const HomeScreen = () => {
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const bannerRef = useRef<ScrollView>(null);
  const [activeBanner, setActiveBanner] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState<ProductFilter>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const BANNER_HEIGHT = 175;
  const activeCategory = filters.category ?? "Semua";

  const { data: products, isLoading, isError } = useProducts();

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex =
        activeBanner === promoBanner.length - 1 ? 0 : activeBanner + 1;

      bannerRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });

      setActiveBanner(nextIndex);
    }, 3500);

    return () => clearInterval(interval);
  }, [activeBanner, width]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;

    if (filters.category) {
      filtered = filtered.filter(
        (product) => product.category === filters.category,
      );
    }

    if (filters.type) {
      filtered = filtered.filter((product) => product.type === filters.type);
    }

    if (filters.promoRange) {
      const now = new Date();

      filtered = filtered.filter((product) => {
        const promo = product.promo;
        if (!promo) return false;

        const discount = promo.discountPercent;

        const startDate = promo.startDate ? new Date(promo.startDate) : null;
        const endDate = promo.endDate ? new Date(promo.endDate) : null;

        const isPromoActive =
          (!startDate || now >= startDate) && (!endDate || now <= endDate);

        if (!isPromoActive) return false;

        return (
          discount >= filters.promoRange!.min &&
          discount <= filters.promoRange!.max
        );
      });
    }

    if (filters.gender) {
      filtered = filtered.filter((p) => p.gender === filters.gender);
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filtered = filtered.filter((p) =>
        p.sizes.some((s) => {
          const aboveMin =
            filters.minPrice === undefined || s.price >= filters.minPrice;
          const belowMax =
            filters.maxPrice === undefined || s.price <= filters.maxPrice;
          return aboveMin && belowMax;
        }),
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }, [products, filters, searchQuery]);

  return (
    <SafeScreen>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="relative">
          <Image
            source={require("../../assets/images/home-banner.jpg")}
            style={{ height: BANNER_HEIGHT }}
            className="w-full opacity-80"
            resizeMode="cover"
          />
          <View className="absolute top-12 left-0 right-0 px-4">
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <Text className="text-text-primary text-sm font-semibold">
                  Alamat
                </Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <Image
                    source={require("../../assets/images/icons/location.png")}
                    className="size-4"
                  />
                  <Text className="text-text-primary text-sm font-bold">
                    {user?.addresses?.[0]?.city ?? "Belum Diatur"}
                  </Text>
                </View>
              </View>
              <View className="flex-col items-end">
                <Text className="text-text-primary text-sm font-semibold">
                  Selamat Datang,
                </Text>
                <Text className="text-text-primary text-lg font-extrabold tracking-tight">
                  {user?.username?.trim()
                    ? user.username.split(" ")[0]
                    : "Tamu"}
                </Text>
              </View>
            </View>
          </View>

          <View
            className="px-4 z-10"
            style={{ position: "absolute", bottom: 16, left: 0, right: 0 }}
          >
            <View className="flex-row items-center gap-2">
              <View className="flex-1 bg-background-light flex-row items-center px-5 shadow-xl rounded-full">
                <Image
                  source={require("../../assets/images/icons/search.png")}
                  className="size-5"
                />
                <TextInput
                  placeholder="Telusuri..."
                  placeholderTextColor={"#d6d6d6"}
                  className="flex-1 ml-3 text-base text-text-primary"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity
                className="shadow-xl"
                onPress={() => setFilterVisible(true)}
                activeOpacity={0.7}
              >
                <View className="bg-background-light rounded-full p-[14px]">
                  <Image
                    source={require("../../assets/images/icons/filter.png")}
                    className="size-5"
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View
            className="absolute bottom-0 left-0 right-0 bg-background"
            style={{
              height: 36,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
            }}
          />
        </View>

        {/* Promo Spesial */}
        <View className="mb-6">
          <Text className="text-text-primary px-4 text-lg font-bold">
            Nikmati Promo Sepuasmu
          </Text>
          {/* Promo Carousel */}
          <View className="mt-3">
            <ScrollView
              ref={bannerRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setActiveBanner(index);
              }}
            >
              {promoBanner.map((banner, index) => (
                <View key={index} style={{ width }} className="px-4">
                  <Image
                    source={banner}
                    className="w-full h-[140px] rounded-2xl shadow-xl"
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>

            {/* Indikator */}
            <View className="flex-row justify-center mt-4 gap-2">
              {promoBanner.map((_, index) => (
                <View
                  key={index}
                  className={`h-2 rounded-full ${
                    activeBanner === index
                      ? "w-6 bg-primary-purple"
                      : "w-2 bg-gray-300"
                  }`}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Filter Kategori */}
        <View className="px-4 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-primary text-lg font-bold">
              Kategori
            </Text>
            <Text className="text-text-gray/70 text-sm">
              ({Kategori.length}) Kategori
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Kategori.map((category) => {
              const isSelected = activeCategory === category.name;
              return (
                <TouchableOpacity
                  key={category.name}
                  onPress={() =>
                    setFilters((prev) => ({
                      ...prev,
                      category:
                        category.name === "Semua" ? undefined : category.name,
                    }))
                  }
                  className={`mx-1 rounded-xl size-20 overflow-hidden items-center justify-center ${isSelected ? "bg-surface" : ""}`}
                  activeOpacity={0.7}
                >
                  <Image
                    source={
                      isSelected ? category.imageFill : category.imageOutline
                    }
                    className="size-7"
                    resizeMode="contain"
                  />
                  <Text
                    className={`text-xs font-semibold mt-2 ${
                      isSelected ? "text-primary-purple" : "text-text-gray/70"
                    }`}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Produk */}
        <View className="px-4 mb-3">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-primary text-lg font-bold">
              Jelajahi
            </Text>
            <View className="flex-row items-center gap-3">
              <Text className="text-text-gray/70 text-sm">
                ({filteredProducts.length}) Tersedia
              </Text>
              <View className="flex-row items-center bg-background-darker rounded-lg">
                {/* Mode Grid */}
                <TouchableOpacity
                  onPress={() => setViewMode("grid")}
                  activeOpacity={0.7}
                  className={`p-2 ${viewMode === "grid" ? "bg-primary-purple/20 rounded-lg border border-primary-purple" : ""}`}
                >
                  <Image
                    source={
                      viewMode === "grid"
                        ? require("../../assets/images/icons/grid-fill.png")
                        : require("../../assets/images/icons/grid-outline.png")
                    }
                    className="size-5"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-primary-purple/20 rounded-lg border border-primary-purple" : ""}`}
                >
                  <Image
                    source={
                      viewMode === "list"
                        ? require("../../assets/images/icons/list-fill.png")
                        : require("../../assets/images/icons/list-outline.png")
                    }
                    className="size-5"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {viewMode === "grid" ? (
            <ProductGrid
              products={filteredProducts}
              isLoading={isLoading}
              isError={isError}
            />
          ) : (
            <ProductList
              products={filteredProducts}
              isLoading={isLoading}
              isError={isError}
            />
          )}
        </View>
      </ScrollView>

      <FilterModal
        visible={filterVisible}
        products={products ?? []}
        onClose={() => setFilterVisible(false)}
        onApply={(data) => setFilters(data)}
      />
    </SafeScreen>
  );
};

export default HomeScreen;
