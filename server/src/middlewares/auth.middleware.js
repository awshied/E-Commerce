import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token)
      return res.status(401).json({ message: "Token tidak tersedia." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded)
      return res.status(401).json({ message: "Token tidak valid." });

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(404).json({ message: "Pengguna tidak ada." });

    req.user = user;
    next();
  } catch (error) {
    console.error("Ada kesalahan di middleware protectRoute:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Pengguna tidak ditemukan." });
  }

  if (req.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ message: "Hanya admin yang bisa akses." });
  }

  next();
};
