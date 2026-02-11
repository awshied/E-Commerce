import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import SafeScreen from "@/components/SafeScreen";
import { Image } from "react-native";

const HomeScreen = () => {
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
              <Text className="text-primary-purple text-base font-extrabold tracking-tight mt-1">
                Aryo Wibisono
              </Text>
            </View>

            <TouchableOpacity>
              <Image
                source={require("../../assets/images/icons/filter.png")}
                className="size-7"
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

export default HomeScreen;
