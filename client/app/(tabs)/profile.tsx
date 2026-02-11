import { Alert, Text, TouchableOpacity } from "react-native";
import React from "react";
import SafeScreen from "@/components/SafeScreen";
import { useAuthStore } from "@/store/useAuthStore";

const ProfileScreen = () => {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      Alert.alert("Konfirmasi", "Apakah Anda yakin ingin logout?", [
        { text: "Batal", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ]);
    } catch (error) {
      console.log("Anda tidak bisa keluar", error);
    }
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
