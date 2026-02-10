import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { Link } from "expo-router";

import FloatingInput from "@/components/FloatingInput";
import { useAuthStore } from "@/store/useAuthStore";

const AuthScreen = () => {
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Oops!", "Email dan password tidak boleh kosong.");
      return;
    }

    try {
      await login({ email, password });
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Anda tidak bisa login.";
      Alert.alert("Login gagal", message);
    }
  };

  return (
    <View className="px-8 flex-1 items-center justify-center bg-[#0f172a]">
      <View className="items-center mb-8">
        <Image
          source={require("../../assets/images/logo-web.png")}
          className="size-48"
          resizeMode="contain"
        />
        <Text className="text-white text-xl font-semibold mt-4">
          Selamat Datang
        </Text>
        <Text className="text-gray-400 text-sm mt-1">
          Ayo jelajahi{" "}
          <Text className="text-indigo-400 font-bold">GlacioCore</Text> bersama
          kami.
        </Text>
      </View>
      <View className="w-full mt-2">
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
      </View>

      <TouchableOpacity
        onPress={handleLogin}
        disabled={isLoading}
        className={`mt-6 rounded-xl py-4 w-full items-center justify-center ${
          isLoading ? "bg-gray-500" : "bg-indigo-600"
        }`}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text className="text-center text-white font-semibold text-base">
            Masuk
          </Text>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-center mt-6">
        <Text className="text-gray-400 text-sm">Belum punya akun?</Text>
        <Link href="register" asChild>
          <TouchableOpacity>
            <Text className="text-indigo-400 text-sm ml-1 font-semibold">
              Daftar
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default AuthScreen;
