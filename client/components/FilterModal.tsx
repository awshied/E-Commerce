import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Product, ProductFilter } from "@/types";
import { TypeOption } from "@/lib/type";

import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { SafeAreaView } from "react-native-safe-area-context";

interface FilterModalProps {
  visible: boolean;
  products: Product[];
  onClose: () => void;
  onApply: (filters: ProductFilter) => void;
}

const PRICE_MIN = 0;
const PRICE_MAX = 100_000_000;

const categories = [
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

const genders: ProductFilter["gender"][] = [
  "Campuran",
  "Pria",
  "Wanita",
  "Anak-anak",
];

const FilterModal = ({
  visible,
  products,
  onClose,
  onApply,
}: FilterModalProps) => {
  const [filters, setFilters] = useState<ProductFilter>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([
    PRICE_MIN,
    PRICE_MAX,
  ]);
  const [availableTypes, setAvailableTypes] = useState<TypeOption[]>([]);

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const handleApply = () => {
    onApply({
      ...filters,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    });
    onClose();
  };

  useEffect(() => {
    let filteredProducts = products;

    if (filters.category) {
      filteredProducts = filteredProducts.filter(
        (p) => p.category === filters.category,
      );
    }

    const typeMap = new Map<string, boolean>();

    filteredProducts.forEach((product) => {
      const hasStock = product.sizes?.some((s) => s.stock > 0);

      if (!typeMap.has(product.type)) {
        typeMap.set(product.type, hasStock);
      } else if (hasStock) {
        typeMap.set(product.type, true);
      }
    });

    const types: TypeOption[] = Array.from(typeMap.entries())
      .map(([name, available]) => ({ name, available }))
      .sort((a, b) => a.name.localeCompare(b.name, "id"));

    setAvailableTypes(types);

    if (
      filters.type &&
      !types.find((t) => t.name === filters.type && t.available)
    ) {
      setFilters((p) => ({ ...p, type: undefined }));
    }
  }, [filters.category, filters.type, products]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-transparent justify-end">
        <SafeAreaView
          edges={["bottom"]}
          className="bg-background-darker rounded-t-3xl flex-1"
        >
          <View className="flex-1">
            {/* Header */}
            <View className="flex-row justify-between items-center p-6">
              <View className="flex-row gap-3 items-center">
                <Image
                  source={require("../assets/images/icons/filter.png")}
                  className="size-6"
                />
                <Text className="text-text-primary text-xl font-extrabold">
                  Filter Barang
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} className="items-center mr-2">
                <Image
                  source={require("../assets/images/icons/close.png")}
                  className="size-5 opacity-70"
                />
              </TouchableOpacity>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="flex-1"
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingVertical: 12,
              }}
            >
              {/* Kategori Barang */}
              <View>
                <View className="flex-row items-center justify-between">
                  <Text className="font-bold text-text-primary">Kategori</Text>
                  <Text className="text-text-gray/70 text-sm">
                    ({categories.length}) Kategori
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {categories.map((cat) => {
                    const isAll = cat.name === "Semua";
                    const active = isAll
                      ? !filters.category
                      : filters.category === cat.name;

                    return (
                      <TouchableOpacity
                        key={cat.name}
                        className="w-[48%]"
                        onPress={() =>
                          setFilters((prev) => ({
                            ...prev,
                            category: isAll ? undefined : cat.name,
                          }))
                        }
                      >
                        <View
                          className={`flex-col justify-center items-center gap-1 p-4 rounded-lg border ${
                            active
                              ? "bg-primary-purple/10 border-primary-purple"
                              : "border-text-gray/40"
                          }`}
                        >
                          <Image
                            source={active ? cat.imageFill : cat.imageOutline}
                            className="size-6"
                            resizeMode="contain"
                          />

                          <Text
                            className={`text-sm font-semibold ${
                              active
                                ? "text-primary-purple"
                                : "text-text-gray/70"
                            }`}
                          >
                            {cat.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Rentang Harga Barang */}
              <View className="mt-4">
                <Text className="font-bold text-text-primary">
                  Rentang Harga
                </Text>
                <View className="flex-row justify-between mt-3 -mb-2">
                  <Text className="text-text-gray/70 font-semibold">
                    Rp {priceRange[0].toLocaleString("id-ID") ?? PRICE_MIN}
                  </Text>
                  <Text className="text-text-gray/70 font-semibold">
                    Rp {priceRange[1].toLocaleString("id-ID") ?? PRICE_MAX}
                  </Text>
                </View>

                <View className="mx-2">
                  <MultiSlider
                    values={priceRange}
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={1000}
                    sliderLength={300}
                    onValuesChange={handlePriceChange}
                    onValuesChangeFinish={(values) =>
                      setPriceRange([values[0], values[1]])
                    }
                    selectedStyle={{
                      backgroundColor: "#818cf8",
                    }}
                    unselectedStyle={{
                      backgroundColor: "#4a4a4a",
                    }}
                    markerStyle={{
                      backgroundColor: "#818cf8",
                      height: 16,
                      width: 16,
                      borderRadius: 8,
                    }}
                  />
                </View>
              </View>

              {/* Jenis/Tipe Barang */}
              <View className="mt-1">
                <View className="flex-row items-center justify-between">
                  <Text className="font-bold text-text-primary">
                    Jenis Barang
                  </Text>
                  <Text className="text-text-gray/70 text-sm">
                    ({availableTypes.length}) Jenis
                  </Text>
                </View>

                {availableTypes.length === 0 ? (
                  <Text className="text-text-gray/70 text-sm mt-3">
                    Belum ada jenis barang yang tersedia untuk kategori ini.
                  </Text>
                ) : (
                  <View className="flex-row flex-wrap gap-2 mt-3">
                    {availableTypes.map((t) => {
                      const active = filters.type === t.name;

                      return (
                        <TouchableOpacity
                          key={t.name}
                          disabled={!t.available}
                          onPress={() =>
                            setFilters((prev) => ({
                              ...prev,
                              type: active ? undefined : t.name,
                            }))
                          }
                          className={`px-4 py-2 rounded-full border ${
                            active
                              ? "bg-primary-purple/10 border-primary-purple"
                              : "border-text-gray/40"
                          } ${!t.available ? "opacity-40" : ""}`}
                        >
                          <Text
                            className={`text-sm font-semibold ${
                              active
                                ? "text-primary-purple"
                                : "text-text-gray/70"
                            }`}
                          >
                            {t.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Kecocokan Barang Berdasarkan Gender */}
              <View className="mt-5">
                <View className="flex-row items-center justify-between">
                  <Text className="font-bold text-text-primary">
                    Cocok Untuk
                  </Text>
                  <Text className="text-text-gray/70 text-sm">
                    ({genders.length}) Pilihan
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {genders.map((g) => {
                    const active = filters.gender === g;
                    return (
                      <TouchableOpacity
                        key={g}
                        onPress={() =>
                          setFilters((p) => ({
                            ...p,
                            gender: active ? undefined : g,
                          }))
                        }
                        className={`px-4 py-2 rounded-full border ${
                          active
                            ? "bg-primary-purple/10 border-primary-purple"
                            : "border-text-gray/40"
                        }`}
                      >
                        <Text
                          className={`text-sm font-semibold ${
                            active ? "text-primary-purple" : "text-text-gray/70"
                          }`}
                        >
                          {g}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <View className="p-6">
              <TouchableOpacity
                onPress={handleApply}
                className="bg-background-light w-full rounded-xl items-center"
              >
                <Text className="font-bold text-text-primary py-4">
                  Terapkan
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default FilterModal;
