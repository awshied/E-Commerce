import React, { useEffect, useRef } from "react";
import { Animated, Text } from "react-native";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  visible: boolean;
  message: string;
  type: ToastType;
  onHide: () => void;
  duration?: number;
}

const typeStyle: Record<ToastType, string> = {
  success: "bg-emerald-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  warning: "bg-amber-500",
};

export default function Toast({
  visible,
  message,
  type,
  onHide,
  duration = 2500,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(hideToast, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, opacity, translateY]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(onHide);
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
      }}
      className={`absolute top-12 self-center w-[90%] px-4 py-3 rounded-2xl shadow-lg z-50 ${typeStyle[type]}`}
    >
      <Text className="text-white text-center font-semibold text-sm">
        {message}
      </Text>
    </Animated.View>
  );
}
