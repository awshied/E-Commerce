import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import React from "react";

interface LogoutConfirmModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const LogoutConfirmModal = ({
  visible,
  onCancel,
  onConfirm,
  loading = false,
}: LogoutConfirmModalProps) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="w-full bg-background-light rounded-2xl p-6 shadow-2xl">
          <View className="items-center mb-4">
            <Image
              source={require("@/assets/images/logo-web.png")}
              className="size-36"
            />
          </View>

          <Text className="text-xl font-extrabold text-text-primary text-center">
            GlacioCore
          </Text>

          <Text className="text-text-gray/70 text-center mt-2 text-sm leading-relaxed">
            Jangan lupa untuk mampir kembali bersama kami hanya di{" "}
            <Text className="font-bold text-primary-purple">GlacioCore</Text>.
          </Text>

          <View className="flex-row gap-3 mt-6">
            <TouchableOpacity
              onPress={onCancel}
              activeOpacity={0.7}
              disabled={loading}
              className="flex-1 border border-text-gray/40 rounded-xl py-3 items-center"
            >
              <Text className="font-bold text-text-gray">Batal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.7}
              disabled={loading}
              className="flex-1 bg-primary-indigo rounded-xl py-3 items-center"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#d2d2d2" />
              ) : (
                <Text className="font-bold text-white">Keluar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutConfirmModal;
