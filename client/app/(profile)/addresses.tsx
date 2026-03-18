import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { useAddresses } from "@/hooks/useAddresses";
import SafeScreen from "@/components/SafeScreen";
import { router } from "expo-router";
import { Address, AddressFormType } from "@/types";
import AddressFormModal from "@/components/AddressFormModal";
import AddressCard from "@/components/AddressCard";

const AddressesScreen = () => {
  const {
    addresses,
    addAddress,
    deleteAddress,
    isUpdatingAddress,
    isDeletingAddress,
    isError,
    isLoading,
    isAddingAddress,
    updateAddress,
  } = useAddresses();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormType>({
    label: "rumah",
    fullName: "",
    streetAddress: "",
    village: "",
    district: "",
    city: "",
    zipCode: "",
    province: "",
    phoneNumber: "",
    isDefault: false,
  });

  const handleAddAddress = () => {
    setShowAddressForm(true);
    setEditingAddressId(null);
    setAddressForm({
      label: "rumah",
      fullName: "",
      streetAddress: "",
      village: "",
      district: "",
      city: "",
      zipCode: "",
      province: "",
      phoneNumber: "",
      isDefault: false,
    });
  };

  const handleEditAddress = (address: Address) => {
    setShowAddressForm(true);
    setEditingAddressId(address._id);
    setAddressForm({
      label: address.label,
      fullName: address.fullName,
      streetAddress: address.streetAddress,
      village: address.village,
      district: address.district,
      city: address.city,
      zipCode: address.zipCode,
      province: address.province,
      phoneNumber: address.phoneNumber,
      isDefault: address.isDefault,
    });
  };

  const handleDeleteAddress = (addressId: string, label: string) => {
    Alert.alert("Hapus Alamat", `Apakah Anda yakin ingin menghapus ${label}`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => deleteAddress(addressId),
      },
    ]);
  };

  const handleSaveAddress = () => {
    if (
      !addressForm.label ||
      !addressForm.fullName ||
      !addressForm.streetAddress ||
      !addressForm.village ||
      !addressForm.district ||
      !addressForm.city ||
      !addressForm.zipCode ||
      !addressForm.province ||
      !addressForm.phoneNumber
    ) {
      Alert.alert("Error", "Mohon lengkapi semua form");
      return;
    }

    if (editingAddressId) {
      updateAddress(
        {
          addressId: editingAddressId,
          addressData: addressForm,
        },
        {
          onSuccess: () => {
            setShowAddressForm(false);
            setEditingAddressId(null);
            Alert.alert("Yeay", "Alamat berhasil diperbarui");
          },
          onError: (error: any) => {
            Alert.alert(
              "Error",
              error?.response?.data?.error || "Gagal memperbarui alamat",
            );
          },
        },
      );
    } else {
      addAddress(addressForm, {
        onSuccess: () => {
          setShowAddressForm(false);
          Alert.alert("Yeay", "Alamat baru saja ditambahkan");
        },
        onError: (error: any) => {
          Alert.alert(
            "Error",
            error?.response?.data?.error || "Gagal menambahkan alamat",
          );
        },
      });
    }
  };

  const handleCloseAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  if (isLoading) return <AddressLoading />;
  if (isError) return <AddressError />;

  return (
    <SafeScreen>
      <View className="px-4 py-3 mt-8 bg-background border-b border-background-light flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Image
            source={require("../../assets/images/icons/arrow-left.png")}
            className="size-6"
          />
        </TouchableOpacity>
        <Text className="text-center text-xl font-bold text-text-primary">
          Alamat Domisili
        </Text>
      </View>

      {addresses.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          <Image
            source={require("../../assets/images/empty-address.png")}
            className="size-32"
          />
          <Text className="text-text-primary text-xl font-bold mt-6">
            Anda belum menyimpan satu alamat
          </Text>
          <Text className="text-text-gray/70 text-center text-sm mt-2">
            Tambahkan alamat pengiriman Anda agar barang yang dipesan dapat
            sampai ke tangan Anda
          </Text>
          <TouchableOpacity
            className="bg-background-light rounded-2xl px-8 py-4 mt-6"
            activeOpacity={0.7}
            onPress={handleAddAddress}
          >
            <Text className="text-text-primary font-bold text-base">
              Tambah Alamat
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4">
            {addresses.map((address) => (
              <AddressCard
                key={address._id}
                address={address}
                onEdit={handleEditAddress}
                onDelete={handleDeleteAddress}
                isUpdatingAddress={isUpdatingAddress}
                isDeletingAddress={isDeletingAddress}
              />
            ))}

            <TouchableOpacity
              className="bg-background-light rounded-xl py-4 items-center mt-2"
              activeOpacity={0.7}
              onPress={handleAddAddress}
            >
              <Text className="text-text-primary font-bold text-base">
                Tambah Alamat Baru
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
      <AddressFormModal
        visible={showAddressForm}
        isEditing={!!editingAddressId}
        addressForm={addressForm}
        isAddingAddress={isAddingAddress}
        isUpdatingAddress={isUpdatingAddress}
        onClose={handleCloseAddressForm}
        onSave={handleSaveAddress}
        onFormChange={setAddressForm}
      />
    </SafeScreen>
  );
};

export default AddressesScreen;

function AddressLoading() {
  return (
    <SafeScreen>
      <View className="px-4 py-3 mt-8 bg-background border-b border-background-light flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Image
            source={require("../../assets/images/icons/arrow-left.png")}
            className="size-6"
          />
        </TouchableOpacity>
        <Text className="text-center text-xl font-bold text-text-primary">
          Alamat Domisili
        </Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#00d9ff" />
        <Text className="text-text-gray/70 mt-6">
          Memuat alamat domisili Anda...
        </Text>
      </View>
    </SafeScreen>
  );
}

function AddressError() {
  return (
    <SafeScreen>
      <View className="px-4 py-3 mt-8 bg-background border-b border-background-light flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Image
            source={require("../../assets/images/icons/arrow-left.png")}
            className="size-6"
          />
        </TouchableOpacity>
        <Text className="text-center text-xl font-bold text-text-primary">
          Alamat Domisili
        </Text>
      </View>
      <View className="flex-1 items-center justify-center px-4">
        <Image
          source={require("../../assets/images/empty-address.png")}
          className="size-32"
        />
        <Text className="text-text-primary text-xl font-bold mt-6">
          Gagal memuat alamat domisili Anda
        </Text>
        <Text className="text-text-gray/70 text-center text-sm mt-2">
          Mohon periksa kembali internet Anda dan pastikan koneksinya stabil
          untuk memuat alamat domisili Anda.
        </Text>
      </View>
    </SafeScreen>
  );
}
