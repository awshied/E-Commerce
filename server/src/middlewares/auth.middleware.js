import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded)
      return res.status(401).json({ message: "Token tidak valid." });

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(401).json({ message: "Pengguna tidak ada." });

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token tidak valid." });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token sudah kadaluarsa." });
    }

    console.error("Ada kesalahan di middleware protectRoute:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Pengguna tidak ditemukan." });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Hanya admin yang bisa akses." });
  }

  next();
};
