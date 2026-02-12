import { Alert, Text, TouchableOpacity } from "react-native";
import React from "react";
import SafeScreen from "@/components/SafeScreen";
import { useAuthStore } from "@/store/useAuthStore";

const ProfileScreen = () => {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    Alert.alert("Konfirmasi", "Apakah Anda yakin ingin logout?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error("Logout failed", error);
            Alert.alert("Error", "Logout gagal. Silakan coba lagi.");
          }
        },
      },
    ]);
  };
  return (
    <SafeScreen>
      <Text className="text-white">ProfileScreen</Text>
      <TouchableOpacity onPress={handleLogout}>
        <Text className="text-accent-error text-lg">Logout</Text>
      </TouchableOpacity>
    </SafeScreen>
  );
};

export default ProfileScreen;
