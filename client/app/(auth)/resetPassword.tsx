import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";

import FloatingInput from "@/components/FloatingInput";
import CustomAlert from "@/components/CustomAlert";
import { useAuthStore } from "@/store/useAuthStore";

const ResetPasswordScreen = () => {
  const { token: tokenParam } = useLocalSearchParams();
  const { resetPassword, isLoading } = useAuthStore();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleReset = async () => {
    if (!tokenParam) {
      return (
        <View className="flex-1 bg-background px-8 justify-center">
          <Text className="text-white">
            Link tidak valid atau sudah kedaluwarsa.
          </Text>
        </View>
      );
    }

    if (!password || password.length < 8) {
      setSuccess(false);
      setAlertVisible(true);
      return;
    }

    if (password !== confirm) {
      setSuccess(false);
      setAlertVisible(true);
      return;
    }

    try {
      await resetPassword({
        token: String(tokenParam),
        newPassword: password,
      });
      setSuccess(true);
      setAlertVisible(true);
    } catch (err) {
      setSuccess(false);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan. Silakan coba lagi.",
      );
      setAlertVisible(true);
    }
  };

  return (
    <View className="flex-1 bg-background px-8 justify-center">
      <Text className="text-white text-2xl font-bold mb-2">
        Atur Ulang Kata Sandi
      </Text>
      <Text className="text-text-gray/70 text-sm mb-6">
        Masukkan kata sandi baru Anda untuk memperbarui.
      </Text>

      <FloatingInput
        label="Kata Sandi Baru"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        icon={require("../../assets/images/icons/password.png")}
      />

      <FloatingInput
        label="Konfirmasi Kata Sandi Baru"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        icon={require("../../assets/images/icons/key.png")}
      />

      <TouchableOpacity
        onPress={handleReset}
        disabled={isLoading}
        className={`mt-6 py-4 rounded-xl items-center ${
          isLoading ? "bg-gray-500" : "bg-indigo-600"
        }`}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold">Perbarui</Text>
        )}
      </TouchableOpacity>

      <CustomAlert
        visible={alertVisible}
        title={success ? "Yeay!" : "Gagal Mengatur Ulang"}
        message={
          success
            ? "Mohon diingat baik-baik kata sandi baru Anda. Jangan sampai Anda melupakan kata sandi Anda lagi."
            : errorMessage || "Kata sandi yang Anda masukkan tidak sesuai."
        }
        type={success ? "success" : "error"}
        buttons={[
          {
            text: success ? "Login" : "Tutup",
            onPress: () => {
              setAlertVisible(false);
              if (success) {
                router.replace("/(auth)");
              }
            },
          },
        ]}
      />
    </View>
  );
};

export default ResetPasswordScreen;
