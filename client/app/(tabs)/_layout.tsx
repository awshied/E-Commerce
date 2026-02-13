import React from "react";
import { Redirect, Tabs } from "expo-router";
import { Image } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TabsLayout = () => {
  const { user, isLoading } = useAuthStore();
  const insets = useSafeAreaInsets();

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
        name="wishlist"
        options={{
          title: "Wishlist",
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("../../assets/images/icons/wishlist-fill.png")
                  : require("../../assets/images/icons/wishlist-outline.png")
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
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("../../assets/images/icons/profile-fill.png")
                  : require("../../assets/images/icons/profile-outline.png")
              }
              className="size-7"
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
