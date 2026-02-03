import { View, Image } from "react-native";
import React, { useState } from "react";
import FloatingInput from "@/components/FloatingInput";

const AuthScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View className="px-8 flex-1 items-center justify-center bg-[#0f172a]">
      <Image
        source={require("../../assets/images/logo-web.png")}
        className="size-48"
        resizeMode="contain"
      />
      <View className="w-full gap-2 mt-2">
        <FloatingInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <FloatingInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
    </View>
  );
};

export default AuthScreen;
