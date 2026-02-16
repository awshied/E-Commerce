import { View } from "react-native";
import React from "react";

const SafeScreen = ({ children }: { children: React.ReactNode }) => {
  return <View className="flex-1 bg-background">{children}</View>;
};

export default SafeScreen;
