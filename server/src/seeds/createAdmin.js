import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const adminExist = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (adminExist) {
      console.log("Admin sudah ada.");
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

    await User.create({
      username: process.env.ADMIN_USERNAME,
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin berhasil dibuat.");
    process.exit();
  } catch (error) {
    console.error("Gagal membuat admin:", error);
    process.exit(1);
  }
};

createAdmin();
