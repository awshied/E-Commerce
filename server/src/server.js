import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";

dotenv.config();

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.route.js";

const app = express();
const __dirname = path.resolve();

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Sukses" });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../admin/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../admin", "dist", "index.html"));
  });
}

const startServer = async () => {
  await connectDB();
  app.listen(process.env.PORT, () => {
    console.log("Servernya jalan kok");
  });
};

startServer();
