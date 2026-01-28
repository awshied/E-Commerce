import * as SecureStore from "expo-secure-store";

export const saveToken = async (token: string) => {
  await SecureStore.setItemAsync("accessToken", token);
};

export const getToken = async () => {
  return await SecureStore.getItemAsync("accessToken");
};

export const removeToken = async () => {
  await SecureStore.deleteItemAsync("accessToken");
};
