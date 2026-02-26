import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";

import { useAuthStore } from "@/store/useAuthStore";
import SafeScreen from "@/components/SafeScreen";
import FloatingInput from "@/components/FloatingInput";

const GENDERS = [
  { label: "Tidak Diketahui", value: "unknown" },
  { label: "Pria", value: "pria" },
  { label: "Wanita", value: "wanita" },
];

const EditProfileScreen = () => {
  const { user, updateProfile } = useAuthStore();
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState<"unknown" | "pria" | "wanita">(
    "unknown",
  );
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setGender(user.gender);
      setBirthday(user.birthday ? new Date(user.birthday) : null);
    }
  }, [user]);

  if (!user) return null;

  const hasValidImage =
    typeof user.imageUrl === "string" && user.imageUrl.length > 0;

  const avatarSource = imageBase64
    ? { uri: imageBase64 }
    : hasValidImage
      ? { uri: user.imageUrl }
      : require("../../assets/images/default-avatar.png");

  const birthdayLocked = !!user.birthday;

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert(
        "Izin untuk memasukkan gambar dari penyimpanan lokal tidak diberikan.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const mimeType = result.assets[0].mimeType ?? "image/jpeg";
      setImageBase64(`data:${mimeType};base64,${result.assets[0].base64}`);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload: any = {};

      if (imageBase64) payload.imageUrl = imageBase64;
      if (username && username !== user.username) payload.username = username;
      if (gender !== user.gender) payload.gender = gender;
      if (!birthdayLocked && birthday) {
        payload.birthday = birthday.toISOString();
      }

      await updateProfile(payload);
      router.back();
    } catch (error) {
      setError(`Gagal menyimpan profil. ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen>
      {/* Header */}
      <View className="px-4 py-3 mt-8 bg-background border-b border-background-light flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Image
            source={require("../../assets/images/icons/arrow-left.png")}
            className="size-6"
          />
        </TouchableOpacity>
        <Text className="text-center text-xl font-bold text-text-primary">
          Ubah Profil
        </Text>
      </View>

      {/* Main */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4 mt-2">
          {/* Foto Profil */}
          <View className="w-full justify-center items-center">
            <TouchableOpacity
              onPress={handlePickImage}
              className="items-center justify-center relative size-24 rounded-full"
              activeOpacity={0.7}
            >
              <Image
                source={avatarSource}
                className="size-full object-cover rounded-full"
              />
              <View className="absolute -bottom-1 -right-2 bg-primary-purple p-1 border-4 border-background rounded-full items-center justify-center shadow-xl">
                <Image
                  source={require("../../assets/images/profile/image-editing.png")}
                  className="size-7"
                />
              </View>
            </TouchableOpacity>
          </View>

          <View className="w-full mt-12">
            <Text className="text-sm font-bold text-text-gray/70 mb-2">
              Informasi akun Anda saat ini
            </Text>
            {/* ID */}
            <View className="relative mb-4">
              <Image
                source={require("../../assets/images/icons/id-card.png")}
                className="size-6 absolute right-2 top-5"
                style={{ tintColor: "#ffc586" }}
                resizeMode="contain"
              />
              <Text className="absolute left-0 top-0 text-[11px] text-accent-warning">
                ID Anda
              </Text>
              <Text className="border-b-2 border-accent-warning text-lg pt-6 pb-1 pl-1 text-text-primary">
                {user._id}
              </Text>
            </View>

            {/* Email */}
            <View className="relative">
              <Image
                source={require("../../assets/images/icons/email.png")}
                className="size-6 absolute right-2 top-5"
                style={{ tintColor: "#ffc586" }}
                resizeMode="contain"
              />
              <Text className="absolute left-0 top-0 text-[11px] text-accent-warning">
                Alamat Email
              </Text>
              <Text className="border-b-2 border-accent-warning text-lg pt-6 pb-1 pl-1 text-text-primary">
                {user.email}
              </Text>
            </View>
          </View>

          <View className="w-full mt-10">
            <Text className="text-sm font-bold text-text-gray/70 mb-2">
              Bagaimana cara Anda dalam mengelola profil Anda
            </Text>
            {/* Nama */}
            <FloatingInput
              label="Nama"
              value={username}
              onChangeText={setUsername}
              editable={true}
              autoCapitalize="none"
              icon={require("../../assets/images/icons/user.png")}
            />

            {/* Gender */}
            <View className="flex-col gap-3 mb-4">
              <Text className="text-[11px] font-semibold text-accent-warning">
                Jenis Kelamin
              </Text>
              <View className="flex-row gap-3">
                {GENDERS.map((g) => (
                  <TouchableOpacity
                    key={g.value}
                    onPress={() => setGender(g.value as any)}
                    activeOpacity={0.7}
                    className={`px-4 py-2 rounded-lg border ${gender === g.value ? "border-primary-purple bg-primary-purple/10" : "border-text-gray/40"}`}
                  >
                    <Text
                      className={`font-semibold text-base ${
                        gender === g.value
                          ? "text-primary-purple"
                          : "text-text-gray/70"
                      }`}
                    >
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tanggal Lahir */}
            <View className="relative mb-18">
              <Image
                source={require("../../assets/images/icons/date-of-birth.png")}
                className="size-6 absolute right-2 top-5"
                style={{ tintColor: "#ffc586" }}
                resizeMode="contain"
              />
              <Text className="absolute left-0 font-semibold top-0 text-[11px] text-accent-warning">
                Tanggal Lahir
              </Text>
              <TouchableOpacity
                disabled={birthdayLocked}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
                className={`border-b-2 border-text-gray pt-6 pb-1.5 pl-1 ${birthdayLocked && "border-accent-warning"}`}
              >
                {birthday ? (
                  <Text className="text-text-primary text-lg">
                    {birthday.toLocaleDateString("id-ID")}
                  </Text>
                ) : (
                  <Text className="text-text-gray/70 text-lg">Tentukan</Text>
                )}
              </TouchableOpacity>
              <View className="flex-row items-start gap-1">
                <Text className="text-xs mt-4 text-accent-error">*</Text>
                <Text className="text-xs mt-4 text-accent-error">
                  {birthdayLocked
                    ? "Tanggal lahir hanya dapat diatur satu kali saja."
                    : "Pastikan tanggal lahir Anda sudah benar."}
                </Text>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={birthday || new Date("2000-01-01")}
                  mode="date"
                  maximumDate={new Date()}
                  onChange={(_, date) => {
                    setShowDatePicker(false);
                    if (date) setBirthday(date);
                  }}
                />
              )}
            </View>

            {error && (
              <View className="mt-3 bg-accent-error/10 border border-accent-error/40 rounded-lg p-3">
                <Text className="text-accent-error text-sm font-semibold">
                  {error}
                </Text>
              </View>
            )}
            {/* Tombol Simpan */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              className="mt-6 rounded-xl py-4 items-center justify-center shadow-xl font-semibold bg-background-light"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-center text-white font-semibold text-base">
                  Simpan Perubahan
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

export default EditProfileScreen;
