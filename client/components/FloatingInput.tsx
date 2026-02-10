import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  Animated,
  Image,
} from "react-native";

interface FloatingInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: any;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  value,
  onChangeText,
  icon,
  secureTextEntry = false,
  keyboardType = "default",
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const animated = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animated, {
      toValue: focused || value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focused, value]);

  const labelStyle = {
    top: animated.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 0],
    }),
    fontSize: animated.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 11],
    }),
    color: animated.interpolate({
      inputRange: [0, 1],
      outputRange: ["#d6d6d6", "#ffc586"],
    }),
  };

  return (
    <View style={styles.container}>
      {icon && (
        <Image
          source={icon}
          style={[styles.icon, { tintColor: focused ? "#ffc586" : "#d6d6d6" }]}
          resizeMode="contain"
        />
      )}

      <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={[
          styles.input,
          focused && styles.inputFocused,
          icon && { paddingRight: 40 },
        ]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
    </View>
  );
};

export default FloatingInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    position: "relative",
  },

  icon: {
    position: "absolute",
    right: 5,
    top: 16,
    width: 20,
    height: 20,
  },

  label: {
    position: "absolute",
    left: 0,
  },

  input: {
    borderBottomWidth: 2,
    borderBottomColor: "#d6d6d6",
    paddingTop: 22,
    paddingBottom: 6,
    fontSize: 16,
    color: "#ffffff",
  },

  inputFocused: {
    borderBottomColor: "#ffc586",
  },
});
