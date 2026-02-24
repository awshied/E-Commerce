import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { Link, router } from "expo-router";

import FloatingInput from "@/components/FloatingInput";
import CustomAlert from "@/components/CustomAlert";
import { useAuthStore } from "@/store/useAuthStore";

const RegisterScreen = () => {
  const { register, isLoading } = useAuthStore();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "info">(
    "info",
  );
  const [onAlertClose, setOnAlertClose] = useState<() => void>(() => {});

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info",
    onClose?: () => void,
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setOnAlertClose(() => onClose || (() => {}));
    setAlertVisible(true);
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      showAlert("Oops!", "Semua field tidak boleh kosong.", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert(
        "Email tidak valid",
        "Masukkan alamat email dengan format yang benar.",
        "error",
      );
      return;
    }

    if (password.length < 8) {
      showAlert(
        "Kata sandi lemah",
        "Minimal kata sandi harus ada 8 karakter.",
        "error",
      );
      return;
    }

    if (password !== confirmPassword) {
      showAlert(
        "Kata sandi tidak cocok",
        "Mohon untuk cek ulang kata sandi kamu.",
        "error",
      );
      return;
    }

    try {
      await register({ username, email, password });

      showAlert(
        "Yeay!",
        "Akun baru kamu berhasil dibuat. Mohon untuk selalu diingat baik-baik.",
        "success",
        () => router.replace("/(auth)"),
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Gagal melakukan registrasi.";
      showAlert("Registrasi Gagal", message, "error");
    }
  };

  return (
    <View className="px-8 flex-1 items-center justify-center bg-[#0f172a]">
      <View className="items-center mb-6">
        <Image
          source={require("../../assets/images/logo-web.png")}
          className="size-40"
          resizeMode="contain"
        />
        <Text className="text-white text-xl font-semibold mt-4">
          Buat Akun Baru
        </Text>
        <Text className="text-gray-400 text-sm mt-1">
          Daftarkan dirimu untuk bergabung bersama kami.
        </Text>
      </View>

      <View className="w-full">
        <FloatingInput
          label="Nama"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          icon={require("../../assets/images/icons/user.png")}
        />

        <FloatingInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          icon={require("../../assets/images/icons/email.png")}
        />

        <FloatingInput
          label="Kata Sandi"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          icon={require("../../assets/images/icons/password.png")}
        />

        <FloatingInput
          label="Konfirmasi Kata Sandi"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          icon={require("../../assets/images/icons/key.png")}
        />
      </View>

      <TouchableOpacity
        onPress={handleRegister}
        disabled={isLoading}
        className={`mt-6 rounded-xl py-4 w-full ${
          isLoading ? "bg-gray-500" : "bg-indigo-600"
        }`}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text className="text-center text-white font-semibold text-base">
            Registrasi
          </Text>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-center mt-6">
        <Text className="text-text-gray/70 text-sm">Sudah punya akun?</Text>
        <Link href="." asChild>
          <TouchableOpacity>
            <Text className="text-primary-purple text-sm ml-1 font-semibold">
              Login
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        buttons={[
          {
            text: "Lanjut",
            onPress: () => {
              setAlertVisible(false);
              onAlertClose();
            },
          },
        ]}
      />
    </View>
  );
};

export default RegisterScreen;
