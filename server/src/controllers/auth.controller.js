import { generateToken } from "../lib/utils.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import cloudinary from "../config/cloudinary.js";
import { Notification } from "../models/notification.model.js";

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

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    await Notification.create({
      type: "user",
      title: "User Baru",
      message: `${newUser.username} baru saja bergabung bersama GlacioCore.`,
      relatedUser: newUser._id,
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
          birthday: user.birthday,
          role: user.role,
          gender: user.gender,
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

// Meminta untuk Mengatur Ulang Token
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email wajib diisi." });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Email tidak ditemukan." });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    return res.status(200).json({
      message: "Token reset password berhasil dibuat.",
      resetToken: rawToken,
    });
  } catch (error) {
    console.error("Error request reset:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Mengatur Ulang Password dengan Token
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword)
    return res
      .status(400)
      .json({ message: "Token dan password baru wajib diisi." });

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({
        message: "Token tidak valid atau sudah kadaluarsa.",
      });

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password minimal 8 karakter.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Error reset password:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Keluar Dari Aplikasi
export const logout = async (_, res) => {
  res
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .status(200)
    .json({ message: "Anda baru saja logout." });
};

// Memperbarui Profil Akun
export const updateProfile = async (req, res) => {
  try {
    const { imageUrl, birthday, gender, username } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }

    const updateData = {};

    if (imageUrl) {
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

      const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
        folder: "profile",
        resource_type: "image",
      });

      updateData.imageUrl = uploadResponse.secure_url;
    }

    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) {
        return res.status(400).json({
          message: "Username sudah digunakan",
        });
      }

      updateData.username = username;
    }

    if (birthday) {
      if (user.birthday) {
        return res.status(400).json({
          message: "Tanggal lahir tidak dapat diubah.",
        });
      }

      const parsedDate = new Date(birthday);

      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          message: "Format tanggal lahir tidak valid.",
        });
      }

      updateData.birthday = parsedDate;
    }

    if (gender) {
      const allowedGenders = ["unknown", "pria", "wanita"];

      if (!allowedGenders.includes(gender)) {
        return res.status(400).json({
          message: "Jenis kelamin tidak valid.",
        });
      }

      updateData.gender = gender;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "Tidak ada data yang diperbarui.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      message: "Profil berhasil diperbarui.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Gagal memperbarui profil:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};
