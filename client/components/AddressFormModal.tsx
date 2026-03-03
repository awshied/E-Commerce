import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React from "react";
import FloatingInput from "./FloatingInput";
import { SafeAreaView } from "react-native-safe-area-context";

interface AddressFormData {
  _id?: string;
  label: "rumah" | "apartemen" | "hotel" | "kantor";
  fullName: string;
  streetAddress: string;
  village: string;
  district: string;
  city: string;
  zipCode: string;
  province: string;
  phoneNumber: string;
  isDefault: boolean;
}

const labelOptions: AddressFormData["label"][] = [
  "rumah",
  "apartemen",
  "hotel",
  "kantor",
];

interface AddressFormModalProps {
  visible: boolean;
  isEditing: boolean;
  addressForm: AddressFormData;
  isAddingAddress: boolean;
  isUpdatingAddress: boolean;
  onClose: () => void;
  onSave: () => void;
  onFormChange: (form: AddressFormData) => void;
}

const AddressFormModal = ({
  addressForm,
  isAddingAddress,
  isEditing,
  isUpdatingAddress,
  onClose,
  onFormChange,
  onSave,
  visible,
}: AddressFormModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-transparent justify-end">
          <SafeAreaView
            edges={["bottom"]}
            className="bg-background-darker rounded-t-3xl flex-1"
          >
            <View className="flex-1">
              {/* Header */}
              <View className="flex-row items-center justify-between p-6">
                <View className="flex-row gap-3 items-center">
                  <Image
                    source={require("../assets/images/profile/addresses.png")}
                    className="size-6"
                  />
                  <Text className="text-text-primary text-xl font-extrabold">
                    {isEditing ? "Ubah Alamat" : "Tambah Alamat"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="items-center mr-2"
                  activeOpacity={0.7}
                >
                  <Image
                    source={require("../assets/images/icons/close.png")}
                    className="size-5 opacity-70"
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                }}
              >
                <View className="flex-col gap-3">
                  <Text className="text-[11px] font-semibold text-accent-warning">
                    Label Alamat
                  </Text>
                  <View className="flex-row flex-wrap gap-3">
                    {labelOptions.map((option) => (
                      <TouchableOpacity
                        key={option}
                        onPress={() =>
                          onFormChange({ ...addressForm, label: option })
                        }
                        activeOpacity={0.7}
                        className={`px-4 py-2 rounded-lg border ${addressForm.label === option ? "border-primary-purple bg-primary-purple/10" : "border-text-gray/40"}`}
                      >
                        <Text
                          className={`font-semibold capitalize text-base ${
                            addressForm.label === option
                              ? "text-primary-purple"
                              : "text-text-gray/70"
                          }`}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View className="mt-4">
                  <FloatingInput
                    label="Nama Lengkap"
                    value={addressForm.fullName}
                    onChangeText={(text) =>
                      onFormChange({ ...addressForm, fullName: text })
                    }
                    autoCapitalize="none"
                    icon={require("../assets/images/icons/user.png")}
                  />
                </View>

                <FloatingInput
                  label="Jalan/Gang"
                  value={addressForm.streetAddress}
                  onChangeText={(text) =>
                    onFormChange({ ...addressForm, streetAddress: text })
                  }
                  autoCapitalize="none"
                  icon={require("../assets/images/addresses/street.png")}
                />

                <FloatingInput
                  label="Kelurahan"
                  value={addressForm.village}
                  onChangeText={(text) =>
                    onFormChange({ ...addressForm, village: text })
                  }
                  autoCapitalize="none"
                  icon={require("../assets/images/addresses/village.png")}
                />

                <FloatingInput
                  label="Kecamatan"
                  value={addressForm.district}
                  onChangeText={(text) =>
                    onFormChange({ ...addressForm, district: text })
                  }
                  autoCapitalize="none"
                  icon={require("../assets/images/addresses/district.png")}
                />

                <FloatingInput
                  label="Kabupaten/Kota"
                  value={addressForm.city}
                  onChangeText={(text) =>
                    onFormChange({ ...addressForm, city: text })
                  }
                  autoCapitalize="none"
                  icon={require("../assets/images/addresses/city.png")}
                />

                <FloatingInput
                  label="Kode Pos"
                  value={addressForm.zipCode}
                  onChangeText={(text) =>
                    onFormChange({ ...addressForm, zipCode: text })
                  }
                  autoCapitalize="none"
                  icon={require("../assets/images/addresses/zipcode.png")}
                />

                <FloatingInput
                  label="Provinsi"
                  value={addressForm.province}
                  onChangeText={(text) =>
                    onFormChange({ ...addressForm, province: text })
                  }
                  autoCapitalize="none"
                  icon={require("../assets/images/addresses/province.png")}
                />

                <FloatingInput
                  label="No. Telepon"
                  value={addressForm.phoneNumber}
                  onChangeText={(text) =>
                    onFormChange({ ...addressForm, phoneNumber: text })
                  }
                  autoCapitalize="none"
                  icon={require("../assets/images/addresses/phone.png")}
                />

                <View className="bg-background-light rounded-2xl px-4 py-1 flex-row items-center justify-between mt-4">
                  <Text className="text-text-primary font-semibold">
                    Atur sebagai alamat utama
                  </Text>
                  <Switch
                    value={addressForm.isDefault}
                    onValueChange={(value) =>
                      onFormChange({ ...addressForm, isDefault: value })
                    }
                    thumbColor="white"
                  />
                </View>
              </ScrollView>

              <View className="p-6">
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="bg-background-light rounded-xl items-center justify-center"
                  onPress={onSave}
                  disabled={isAddingAddress || isUpdatingAddress}
                >
                  {isAddingAddress || isUpdatingAddress ? (
                    <View className="py-4">
                      <ActivityIndicator size="small" color="#ffffff" />
                    </View>
                  ) : (
                    <Text className="font-bold text-text-primary py-4">
                      {isEditing ? "Simpan" : "Tambah"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddressFormModal;
