import { generateToken } from "../lib/utils.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";

// Registrasi atau Membuat Akun Baru
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Semua field wajib diisi." });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Passwordnya minimal harus ada 8 karakter." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Duh, emailnya tidak valid nih." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email ini sudah terdaftar." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message:
        "Registrasi berhasil. Anda dapat segera login untuk menjelajahi GlacioCore.",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Username atau email sudah digunakan.",
      });
    }

    console.error("Error di controller registrasi:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Login ke Dalam Aplikasi
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email dan kata sandi tidak boleh kosong." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Email atau kata sandi salah." });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Email atau kata sandi salah." });

    const accessToken = generateToken(user._id);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      })
      .json({
        accessToken,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          imageUrl: user.imageUrl,
          addresses: user.addresses,
          wishlist: user.wishlist,
          lastActive: user.lastActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
  } catch (error) {
    console.error("Error di controller login:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Keluar Dari Aplikasi
export const logout = async (_, res) => {
  res.status(200).json({ message: "Anda baru saja logout." });
};

// Memperbarui Profil Akun
export const updateProfile = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl)
      return res.status(400).json({ message: "Gambar wajib diunggah." });

    const base64Regex = /^data:image\/(png|jpeg|jpg|webp);base64,/;

    if (!base64Regex.test(imageUrl)) {
      return res.status(400).json({
        message: "Format gambar tidak valid.",
      });
    }

    const base64Data = imageUrl.split(",")[1];
    const fileSizeInBytes = Buffer.from(base64Data, "base64").length;

    const MAX_SIZE = 5 * 1024 * 1024;

    if (fileSizeInBytes > MAX_SIZE) {
      return res.status(400).json({
        message: "Ukuran gambar maksimal 5MB.",
      });
    }

    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
      folder: "profile",
      resource_type: "image",
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { imageUrl: uploadResponse.secure_url },
      { new: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Gagal update foto profil:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};
