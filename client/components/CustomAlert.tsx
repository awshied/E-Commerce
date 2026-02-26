import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";

type AlertType = "success" | "error" | "info" | "warning";

const alertImages = {
  success: require("../assets/images/success.png"),
  error: require("../assets/images/error.png"),
  info: require("../assets/images/info.png"),
  warning: require("../assets/images/warning.png"),
};

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  type?: AlertType;
  buttons?: {
    text: string;
    onPress: () => void;
  }[];
}

const CustomAlert = ({
  visible,
  title,
  message,
  type = "info",
  buttons = [],
}: CustomAlertProps) => {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.container} accessibilityViewIsModal>
          <Image
            source={alertImages[type]}
            style={styles.image}
            resizeMode="contain"
            accessibilityLabel={`${type} alert icon`}
            accessible={true}
          />

          <Text style={styles.title}>{title}</Text>

          {message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.buttonContainer}>
            {buttons.map((btn, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.button]}
                onPress={btn.onPress}
              >
                <Text style={styles.buttonText}>{btn.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#6366f1",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  secondaryBtn: {
    backgroundColor: "#475569",
  },
  dangerBtn: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
});
