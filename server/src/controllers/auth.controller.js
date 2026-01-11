import { generateToken } from "../lib/utils.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

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
      return res.status(400).json({ message: "Duh, emailnya ga valid nih." });
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
