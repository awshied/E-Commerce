import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    enum: ["rumah", "apartemen", "hotel", "kantor"],
    default: "rumah",
  },
  fullName: {
    type: String,
    required: true,
  },
  streetAddress: {
    type: String,
    required: true,
  },
  village: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  province: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    birthday: {
      type: Date,
      validate: {
        validator: (v) =>
          !v || (v <= new Date() && v >= new Date("1900-01-01")),
        message: "Birthday must be a past date after 1900-01-01",
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    gender: {
      type: String,
      enum: ["unknown", "pria", "wanita"],
      default: "unknown",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    addresses: [addressSchema],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);
