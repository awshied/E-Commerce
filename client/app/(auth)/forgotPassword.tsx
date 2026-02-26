import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";

import FloatingInput from "@/components/FloatingInput";
import CustomAlert from "@/components/CustomAlert";
import { useAuthStore } from "@/store/useAuthStore";

const ForgotPasswordScreen = () => {
  const { forgotPassword, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [token, setToken] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) return;

    try {
      const resetToken = await forgotPassword({ email });
      setToken(resetToken);
      setAlertVisible(true);
    } catch {
      setToken("");
      setAlertVisible(true);
    }
  };

  return (
    <View className="flex-1 bg-background px-8 justify-center">
      <Text className="text-white text-2xl font-bold mb-2">
        Lupa Kata Sandi?
      </Text>
      <Text className="text-text-gray/70 text-sm mb-6">
        Masukkan alamat email Anda untuk mendapatkan token atur ulang kata
        sandi.
      </Text>

      <FloatingInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        icon={require("../../assets/images/icons/email.png")}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading}
        className={`mt-6 py-4 rounded-xl items-center ${
          isLoading ? "bg-gray-500" : "bg-indigo-600"
        }`}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text className="text-white font-semibold">Kirim Token</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-6 items-center"
        onPress={() => router.back()}
      >
        <Text className="text-primary-purple text-sm font-semibold">
          Kembali ke Login
        </Text>
      </TouchableOpacity>

      <CustomAlert
        visible={alertVisible}
        title={token ? "Yeay!" : "Terjadi Kesalahan"}
        message={
          token
            ? `Gunakan token berikut:\n\n${token}`
            : "Email tidak ditemukan. Mohon diingat kembali dan coba lagi."
        }
        type={token ? "success" : "error"}
        buttons={[
          {
            text: "Tutup",
            onPress: () => setAlertVisible(false),
          },
          ...(token
            ? [
                {
                  text: "Atur Ulang",
                  onPress: () => {
                    setAlertVisible(false);
                    setToken("");
                    router.push({
                      pathname: "/(auth)/resetPassword",
                      params: { token },
                    });
                  },
                },
              ]
            : []),
        ]}
      />
    </View>
  );
};

export default ForgotPasswordScreen;
