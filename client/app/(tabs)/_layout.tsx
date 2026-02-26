import React, { useEffect, useState } from "react";
import { Redirect, Tabs } from "expo-router";
import { Image, ImageSourcePropType } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TabsLayout = () => {
  const { user, isLoading } = useAuthStore();
  const insets = useSafeAreaInsets();

  const defaultAvatar = require("../../assets/images/default-avatar.png");
  const [avatarSource, setAvatarSource] =
    useState<ImageSourcePropType>(defaultAvatar);

  useEffect(() => {
    setAvatarSource(user?.imageUrl ? { uri: user.imageUrl } : defaultAvatar);
  }, [user?.imageUrl, defaultAvatar]);

  if (isLoading) return null;
  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#d2d2d2",
        tabBarStyle: {
          backgroundColor: "#0a1120",
          height: 56 + insets.bottom,
          borderTopWidth: 0,
          paddingTop: 4,
          overflow: "hidden",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("../../assets/images/icons/home-fill.png")
                  : require("../../assets/images/icons/home-outline.png")
              }
              className="size-7"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Keranjang",
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("../../assets/images/icons/cart-fill.png")
                  : require("../../assets/images/icons/cart-outline.png")
              }
              className="size-7"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="blog"
        options={{
          title: "Blog",
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("../../assets/images/icons/blog-fill.png")
                  : require("../../assets/images/icons/blog-outline.png")
              }
              className="size-7"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Anda",
          tabBarIcon: () => (
            <Image
              source={avatarSource}
              onError={() =>
                setAvatarSource(
                  require("../../assets/images/default-avatar.png"),
                )
              }
              className="size-8 rounded-full"
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
