import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
} from "react-native";
import React, { useMemo, useState } from "react";

import SafeScreen from "@/components/SafeScreen";
import { useAuthStore } from "@/store/useAuthStore";
import ProductGrid from "@/components/ProductGrid";
import useProducts from "@/hooks/useProducts";
import ProductList from "@/components/ProductList";

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

const HomeScreen = () => {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const BANNER_HEIGHT = 165;

  const { data: products, isLoading, isError } = useProducts();

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;

    if (selectedCategory !== "Semua") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory,
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="relative">
          <Image
            source={require("../../assets/images/home-banner.jpg")}
            style={{ height: BANNER_HEIGHT }}
            className="w-full opacity-80"
            resizeMode="cover"
          />
          <View className="absolute top-10 left-0 right-0 px-6">
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
            className="px-6 z-10"
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

              <TouchableOpacity className="shadow-xl">
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

        {/* Filter Kategori */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-primary text-lg font-bold">
              Kategori
            </Text>
            <Text className="text-text-gray/70 text-sm">(5) Kategori</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Kategori.map((category) => {
              const isSelected = selectedCategory === category.name;
              return (
                <TouchableOpacity
                  key={category.name}
                  onPress={() => setSelectedCategory(category.name)}
                  className={`mx-1 rounded-xl size-20 overflow-hidden items-center justify-center ${isSelected ? "bg-surface" : ""}`}
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
        <View className="px-6 mb-6">
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
                  className={`p-2 ${viewMode === "grid" ? "bg-primary-purple/10 rounded-lg border border-primary-purple" : ""}`}
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
                  onPress={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-primary-purple/10 rounded-lg border border-primary-purple" : ""}`}
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
    </SafeScreen>
  );
};

export default HomeScreen;
