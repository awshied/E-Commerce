import { View, Text } from "react-native";
import React from "react";

interface HeaderShownProps {
  title: string;
}

const HeaderShown = ({ title }: HeaderShownProps) => {
  return (
    <View className="py-2.5 mt-8 bg-background border-b border-background-light">
      <Text className="text-lg font-bold text-text-primary text-center">
        {title}
      </Text>
    </View>
  );
};

export default HeaderShown;
