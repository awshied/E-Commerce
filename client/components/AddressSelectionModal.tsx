import { useAddresses } from "@/hooks/useAddresses";
import { Address } from "@/types";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";

interface AddressSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onProceed: (address: Address) => void;
  isProcessing: boolean;
}

const AddressSelectionModal = ({
  visible,
  onClose,
  onProceed,
  isProcessing,
}: AddressSelectionModalProps) => {
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const { addresses, isLoading: addressesLoading } = useAddresses();

  useEffect(() => {
    if (visible && addresses) {
      const defaultAddress = addresses.find((addr) => addr.isDefault) ?? null;
      setSelectedAddress(defaultAddress);
    }
  }, [visible, addresses]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-background-darker rounded-t-3xl h-1/2">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6">
            <View className="flex-row gap-3 items-center">
              <Image
                source={require("../assets/images/profile/addresses.png")}
                className="size-6"
              />
              <Text className="text-text-primary text-xl font-extrabold">
                Tentukan Alamat
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="items-center mr-2">
              <Image
                source={require("../assets/images/icons/close.png")}
                className="size-5 opacity-70"
                accessibilityLabel="Close Icon"
              />
            </TouchableOpacity>
          </View>

          {/* Daftar Alamat */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingVertical: 12,
            }}
          >
            {addressesLoading ? (
              <View className="py-8">
                <ActivityIndicator size="large" color="#ffc586" />
              </View>
            ) : (
              <View className="gap-4">
                {addresses?.length === 0 ? (
                  <View className="py-8 items-center">
                    <Text className="text-text-gray/70 text-center">
                      Belum ada alamat tersimpan. Silakan tambah alamat terlebih
                      dahulu.
                    </Text>
                  </View>
                ) : (
                  addresses?.map((address: Address) => (
                    <TouchableOpacity
                      key={address._id}
                      className={`bg-background rounded-3xl p-6 border ${
                        selectedAddress?._id === address._id
                          ? "border-accent-warning"
                          : "border-background-light"
                      }`}
                      activeOpacity={0.7}
                      onPress={() => setSelectedAddress(address)}
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1">
                          <View className="flex-row items-center mb-3">
                            <Text className="text-primary-purple font-semibold text-lg mr-2">
                              {address.label}
                            </Text>
                            {address.isDefault && (
                              <View className="bg-accent-warning/20 border border-accent-warning px-3 py-1 rounded-full ml-3">
                                <Text className="text-accent-warning text-xs font-semibold">
                                  Alamat Utama
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text className="text-text-primary font-extrabold text-xl mb-2">
                            {address.fullName}
                          </Text>
                          <View className="flex-row gap-3 items-center mb-2">
                            <Image
                              source={require("../assets/images/profile/addresses.png")}
                              accessibilityLabel="Address Icon"
                              className="size-3"
                            />
                            <Text className="text-text-gray/70 font-semibold text-sm">
                              {address.streetAddress}, Kel. {address.village},
                              Kec. {address.district}, {address.city},{" "}
                              {address.province}, {address.zipCode}
                            </Text>
                          </View>
                          <View className="flex-row gap-3 items-center">
                            <Image
                              source={require("../assets/images/addresses/phone.png")}
                              accessibilityLabel="Phone Icon"
                              className="size-3"
                            />
                            <Text className="text-text-gray/70 font-semibold text-sm">
                              {address.phoneNumber}
                            </Text>
                          </View>
                        </View>
                        {selectedAddress?._id === address._id && (
                          <View className="bg-primary rounded-full p-2 ml-3">
                            <Image
                              source={require("../assets/images/icons/checked.png")}
                              className="size-5"
                            />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </ScrollView>

          <View className="p-4 border-t border-background-light">
            <TouchableOpacity
              className="bg-background-light rounded-2xl py-4"
              activeOpacity={0.8}
              onPress={() => {
                if (selectedAddress) onProceed(selectedAddress);
              }}
              disabled={!selectedAddress || isProcessing}
            >
              <View className="flex-row gap-2 items-center justify-center">
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Image
                      source={require("../assets/images/icons/money.png")}
                      className="size-5"
                    />
                    <Text className="text-accent-warning font-bold text-lg">
                      Bayar Sekarang
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddressSelectionModal;
