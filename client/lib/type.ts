import { Address, User } from "@/types";

export type TypeOption = {
  name: string;
  available: boolean;
};

export type AddressFormType = Omit<Address, "_id">;

export type UserRole = "user" | "admin";

export type UserGender = "unknown" | "pria" | "wanita";

export type NewsContent = unknown[] | Record<string, unknown> | string;

export type PopulatedUser = Omit<
  User,
  "newsLikes" | "newsDislikes" | "wishlist"
>;
