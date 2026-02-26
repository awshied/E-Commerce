import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ImageSourcePropType,
} from "react-native";
import React, { useState } from "react";
import SafeScreen from "@/components/SafeScreen";
import { useAuthStore } from "@/store/useAuthStore";
import { router } from "expo-router";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";
import useWishlist from "@/hooks/useWishlist";

const menuItems = [
  {
    id: 1,
    icon: require("@/assets/images/profile/addresses.png"),
    title: "Alamat Domisili",
    action: "/addresses",
  },
  {
    id: 2,
    icon: require("@/assets/images/profile/orders.png"),
    title: "Riwayat Pesanan",
    action: "/orders",
  },
  {
    id: 3,
    icon: require("@/assets/images/profile/favorites.png"),
    title: "Barang Favorit",
    action: "/wishlist",
  },
  {
    id: 4,
    icon: require("@/assets/images/profile/comments.png"),
    title: "Ulasan Anda",
    action: "/comments",
  },
] as const;

const supportItems = [
  {
    id: 1,
    icon: require("@/assets/images/profile/about.png"),
    title: "Tentang GlacioCore",
  },
  {
    id: 2,
    icon: require("@/assets/images/profile/privacy.png"),
    title: "Kebijakan Privasi",
  },
  {
    id: 3,
    icon: require("@/assets/images/profile/faq.png"),
    title: "FAQs",
  },
] as const;

const ProfileScreen = () => {
  const { user } = useAuthStore();
  const { wishlistCount, isLoading } = useWishlist();

  const defaultAvatar = require("../../assets/images/default-avatar.png");
  const [avatarSource, setAvatarSource] = useState<ImageSourcePropType>(
    user?.imageUrl ? { uri: user.imageUrl } : defaultAvatar,
  );

  React.useEffect(() => {
    setAvatarSource(user?.imageUrl ? { uri: user.imageUrl } : defaultAvatar);
  }, [user?.imageUrl, defaultAvatar]);

  const [logoutVisible, setLogoutVisible] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  const handleMenuPress = (action: (typeof menuItems)[number]["action"]) => {
    router.push(action);
  };

  const handleLogout = () => {
    setLogoutVisible(true);
  };

  const handleConfirmLogout = async () => {
    try {
      setLogoutLoading(true);
      await logout();
      setLogoutVisible(false);
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLogoutLoading(false);
    }
  };
  return (
    <SafeScreen>
      {/* Header */}
      <View className="px-4 py-3 mt-8 bg-background border-b border-background-light flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Image
            source={require("../../assets/images/icons/arrow-left.png")}
            className="size-6"
          />
        </TouchableOpacity>
        <Text className="text-center text-xl font-bold text-text-primary">
          Anda
        </Text>
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 my-6">
          <View className="flex-row items-center px-4 gap-5">
            <Image
              source={avatarSource}
              onError={() =>
                setAvatarSource(
                  require("../../assets/images/default-avatar.png"),
                )
              }
              accessibilityLabel="Profile Picture"
              className="size-28 rounded-2xl"
            />
            <View className="flex-col gap-1">
              <Text className="text-lg font-bold text-text-primary">
                {user?.username?.trim() ? user.username : "Tamu"}
              </Text>
              <View className="flex-row gap-2 items-center mt-1">
                <Image
                  source={require("../../assets/images/icons/email.png")}
                  alt="icon"
                  className="size-3"
                />
                <Text className="text-xs font-semibold text-text-gray/70">
                  {user?.email}
                </Text>
              </View>
              <View className="flex-row gap-2 items-center">
                <Image
                  source={require("../../assets/images/icons/location.png")}
                  alt="icon"
                  className="size-3"
                />
                {user?.addresses?.[0]?.city ||
                user?.addresses?.[0]?.province ? (
                  <Text className="text-xs font-semibold text-text-gray/70 mt-0.5">
                    {[
                      user?.addresses?.[0]?.city,
                      user?.addresses?.[0]?.province,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                ) : (
                  <Text className="text-xs font-semibold text-text-gray/70 mt-0.5">
                    Belum Diatur
                  </Text>
                )}
              </View>
              <View className="flex-row gap-2 items-center">
                <Image
                  source={require("../../assets/images/addresses/phone.png")}
                  alt="icon"
                  className="size-3"
                />
                <Text className="text-xs font-semibold text-text-gray/70 mt-0.5">
                  12345678901234
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center justify-center gap-10 mt-6">
            <View className="flex-col gap-1">
              <Text className="text-2xl font-bold text-center text-text-primary">
                367
              </Text>
              <Text className="text-sm font-semibold text-text-gray/70">
                Ulasan
              </Text>
            </View>
            <View className="w-0.5 h-6 bg-text-gray/20" />
            <View className="flex-col gap-1">
              <Text className="text-2xl font-bold text-center text-text-primary">
                367
              </Text>
              <Text className="text-sm font-semibold text-text-gray/70">
                Pesanan
              </Text>
            </View>
            <View className="w-0.5 h-6 bg-text-gray/20" />
            <View className="flex-col gap-1">
              {isLoading ? (
                <Text className="text-2xl font-bold text-center text-text-gray/40">
                  —
                </Text>
              ) : (
                <Text className="text-2xl font-bold text-center text-text-primary">
                  {wishlistCount}
                </Text>
              )}
              <Text className="text-sm font-semibold text-text-gray/70">
                Favorit
              </Text>
            </View>
          </View>

          {/* Akun Profil */}
          <View className="flex-col flex-wrap gap-2 mt-6">
            <Text className="text-text-gray/60 font-bold text-sm mb-1">
              Profil Anda
            </Text>
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 bg-background-light rounded-xl shadow-xl"
              activeOpacity={0.7}
              onPress={() => router.push("/editProfile")}
            >
              <View className="flex-row gap-4 items-center">
                <Image
                  source={require("../../assets/images/profile/account-profile.png")}
                  alt="icon"
                  className="size-7"
                />
                <Text className="text-text-gray text-lg font-semibold">
                  Ubah Profil Anda
                </Text>
              </View>
              <Image
                source={require("../../assets/images/profile/right-arrow.png")}
                alt="icon"
                className="size-5"
              />
            </TouchableOpacity>
          </View>

          {/* Penggunaan GlacioCore */}
          <View className="flex-col gap-2 mt-6">
            <Text className="text-text-gray/60 font-bold text-sm mb-1">
              Cara Anda menggunakan GlacioCore
            </Text>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="flex-row items-center justify-between p-4 bg-background-light rounded-xl shadow-xl"
                activeOpacity={0.7}
                onPress={() => handleMenuPress(item.action)}
              >
                <View className="flex-row gap-4 items-center">
                  <Image source={item.icon} alt="icon" className="size-7" />
                  <Text className="text-text-gray text-lg font-semibold">
                    {item.title}
                  </Text>
                </View>
                <Image
                  source={require("../../assets/images/profile/right-arrow.png")}
                  alt="icon"
                  className="size-5"
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Informasi dan Dukungan */}
          <View className="flex-col gap-2 mt-6">
            <Text className="text-text-gray/60 font-bold text-sm mb-1">
              Info dan dukungan selengkapnya
            </Text>
            {supportItems.map((i) => (
              <TouchableOpacity
                key={i.id}
                className="flex-row items-center justify-between p-4 bg-background-light rounded-xl shadow-xl"
                activeOpacity={0.7}
              >
                <View className="flex-row gap-4 items-center">
                  <Image source={i.icon} alt="icon" className="size-7" />
                  <Text className="text-text-gray text-lg font-semibold">
                    {i.title}
                  </Text>
                </View>
                <Image
                  source={require("../../assets/images/profile/right-arrow.png")}
                  alt="icon"
                  className="size-5"
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Tombol Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            className="w-full bg-background-light rounded-xl mt-6"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-center w-full py-4 gap-4">
              <Image
                source={require("../../assets/images/profile/logout.png")}
                alt="icon"
                className="size-7"
              />
              <Text className="text-accent-error text-lg font-semibold">
                Keluar
              </Text>
            </View>
          </TouchableOpacity>

          <Text className="mx-6 mt-6 text-center text-text-gray/70 text-sm font-semibold">
            Versi 1.0.0
          </Text>
        </View>
      </ScrollView>

      <LogoutConfirmModal
        visible={logoutVisible}
        loading={logoutLoading}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={handleConfirmLogout}
      />
    </SafeScreen>
  );
};

export default ProfileScreen;
