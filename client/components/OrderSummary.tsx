import { View, Text } from "react-native";

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

const formatPrice = (price: number) => {
  return `Rp. ${price.toLocaleString("id-ID")}`;
};

export default function OrderSummary({
  subtotal,
  shipping,
  tax,
  total,
}: OrderSummaryProps) {
  return (
    <View className="px-4">
      <View className="bg-background-light rounded-3xl p-5">
        <Text className="text-text-primary text-xl font-extrabold mb-4">
          Ringkasan Pesanan
        </Text>

        <View className="space-y-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-text-gray/70 text-base font-semibold">
              Subtotal Produk
            </Text>
            <Text className="text-text-primary font-semibold text-base">
              {formatPrice(subtotal)}
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-text-gray/70 text-base font-semibold">
              Ongkos Kirim
            </Text>
            <Text className="text-text-primary font-semibold text-base">
              {formatPrice(shipping)}
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-text-gray/70 text-base font-semibold">
              Pajak (4%)
            </Text>
            <Text className="text-text-primary font-semibold text-base">
              {formatPrice(tax)}
            </Text>
          </View>

          <View className="border-t border-text-gray/20 pt-3 mt-2" />

          <View className="flex-row justify-between items-center">
            <Text className="text-text-primary font-extrabold text-lg">
              Total
            </Text>
            <Text className="text-accent-warning font-extrabold text-xl">
              {formatPrice(total)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
