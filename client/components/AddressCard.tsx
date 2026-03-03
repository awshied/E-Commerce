import { View, Text, TouchableOpacity, Image } from "react-native";
import { Address } from "@/types";

const residences = {
  rumah: require("@/assets/images/addresses/home.png"),
  apartemen: require("@/assets/images/addresses/apartment.png"),
  hotel: require("@/assets/images/addresses/hotel.png"),
  kantor: require("@/assets/images/addresses/office.png"),
};

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string, label: string) => void;
  isUpdatingAddress: boolean;
  isDeletingAddress: boolean;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  isUpdatingAddress,
  isDeletingAddress,
}: AddressCardProps) {
  return (
    <View className="bg-background-light rounded-3xl p-5 mb-3 overflow-hidden">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="bg-primary-purple/20 border border-primary-purple rounded-full w-10 h-10 items-center justify-center mr-3">
            <Image
              source={residences[address.label]}
              className="size-6"
              resizeMode="contain"
            />
          </View>
          <Text className="text-text-primary font-bold text-lg capitalize">
            {address.label}
          </Text>
        </View>
        {address.isDefault && (
          <View className="bg-accent-warning/20 border border-accent-warning px-3 py-1 rounded-full">
            <Text className="text-accent-warning text-xs font-bold">
              Alamat Utama
            </Text>
          </View>
        )}
      </View>
      <View>
        <Text
          className="text-text-primary font-bold text-xl mb-1"
          numberOfLines={1}
        >
          {address.fullName}
        </Text>
        <View className="flex-row gap-2 items-center mb-1">
          <Image
            source={require("../assets/images/addresses/phone.png")}
            accessibilityLabel="Phone Icon"
            className="size-3"
          />
          <Text className="text-text-gray/70 font-semibold text-sm">
            {address.phoneNumber}
          </Text>
        </View>
        <View className="flex-row gap-2 items-center mb-1 mr-6">
          <Image
            source={require("../assets/images/profile/addresses.png")}
            alt="icon"
            className="size-3"
          />
          <Text className="text-text-gray/70 font-semibold text-sm">
            {address.streetAddress}, Kel. {address.village}, Kec.{" "}
            {address.district}, {address.city}, {address.province},{" "}
            {address.zipCode}
          </Text>
        </View>
      </View>
      <View className="flex-row mt-4 gap-2">
        <TouchableOpacity
          className="flex-1 bg-accent-info/20 py-3 rounded-xl items-center"
          activeOpacity={0.7}
          onPress={() => onEdit(address)}
          disabled={isUpdatingAddress}
        >
          <Text className="text-accent-info font-bold">Ganti</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-accent-error/20 py-3 rounded-xl items-center"
          activeOpacity={0.7}
          onPress={() => onDelete(address._id, address.label)}
          disabled={isDeletingAddress}
        >
          <Text className="text-accent-error font-bold">Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
