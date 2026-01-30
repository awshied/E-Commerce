import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";

interface FloatingInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  const isActive = focused || value.length > 0;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isActive && styles.labelActive]}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={[styles.input, focused && styles.inputFocused]}
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
    marginBottom: 24,
    position: "relative",
  },

  label: {
    position: "absolute",
    left: 0,
    top: 18,
    fontSize: 16,
    color: "#d6d6d6",
  },

  labelActive: {
    top: 0,
    fontSize: 12,
    color: "#ffc586",
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
