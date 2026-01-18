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

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email ini sudah ada." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      const savedUser = await newUser.save();
      generateToken(savedUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        imageUrl: newUser.imageUrl,
        addresses: newUser.addresses,
        wishlist: newUser.wishlist,
      });
    } else {
      res.status(400).json({ message: "Datamu ga valid, coba lagi!" });
    }
  } catch (error) {
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
      .json({ message: "Email dan password jangan kosong." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Akun tidak ada." });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Akun tidak ada." });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      imageUrl: user.imageUrl,
      addresses: user.addresses,
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error di controller login:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Keluar Dari Aplikasi
export const logout = async (_, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Anda baru saja logout." });
};

// Memperbarui Profil Akun
export const updateProfile = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl)
      return res.status(400).json({ message: "Komuknya harus ada." });

    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader.upload(imageUrl);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { imageUrl: uploadResponse.secure_url },
      { new: true },
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Ada kesalahan saat memperbarui komuknya:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};
