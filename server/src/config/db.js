import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL);
    console.log(`✔️  MongoDB berhasil terkoneksi: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB tidak bisa terkoneksi");
    process.exit(1);
  }
};
