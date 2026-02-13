import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import SafeScreen from "@/components/SafeScreen";
import { useAuthStore } from "@/store/useAuthStore";

const HomeScreen = () => {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pb-4 pt-6">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-text-gray text-xs font-semibold">
                Selamat Datang,
              </Text>
              <Text className="text-primary-purple text-lg font-extrabold tracking-tight mt-1">
                {user?.username ? user.username.split(" ")[0] : "User"}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Image
                source={require("../../assets/images/icons/location.png")}
                className="size-4"
              />
              <Text className="text-text-gray text-sm font-semibold">
                {user?.addresses?.[0]?.city ?? "Belum Diatur"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <View className="flex-1 bg-surface flex-row items-center px-5 py-2 shadow-xl rounded-xl">
              <Image
                source={require("../../assets/images/icons/search.png")}
                className="size-6"
              />
              <TextInput
                placeholder="Cari..."
                placeholderTextColor={"#d6d6d6"}
                className="flex-1 ml-3 text-base text-text-primary"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <TouchableOpacity>
              <View className="bg-surface rounded-xl py-[17px] px-[17px]">
                <Image
                  source={require("../../assets/images/icons/filter.png")}
                  className="size-7"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

export default HomeScreen;
