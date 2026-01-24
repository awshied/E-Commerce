import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";

const products = [
  {
    name: "Hoodie Hitam",
    description:
      "Hoodie hitam ini sangat tebal dan cocok banget buat melindungi diri kamu dari kedinginan",
    price: 750,
    category: "Pakaian",
    types: "Hoodie",
    sizes: [
      { size: "S", stock: 13 },
      { size: "M", stock: 20 },
      { size: "L", stock: 26 },
      { size: "XL", stock: 15 },
    ],
    images: [
      "https://res.cloudinary.com/dklwk5p2h/image/upload/v1769138812/profile/m33keic4cutlffhuuzxd.jpg",
    ],
    averageRating: 4,
    totalReviews: 128,
  },
  {
    name: "Vivo v15 Pro",
    description:
      "Ponsel tahan lama, dibanting pun LCD tidak pecah. Cocok buat gamers.",
    price: 5700,
    category: "Elektronik",
    types: "Ponsel",
    sizes: [
      { size: "R", stock: 19 },
      { size: "J", stock: 7 },
    ],
    images: [
      "https://res.cloudinary.com/dklwk5p2h/image/upload/v1769138812/profile/m33keic4cutlffhuuzxd.jpg",
    ],
    averageRating: 4.3,
    totalReviews: 211,
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ Berhasil terhubung dengan MongoDB.");

    await Product.deleteMany({});
    console.log("🗑️  Produk telah dibersihkan.");

    await Product.insertMany(products);
    console.log(`✅ Berhasil menambahkan ${products.length} produk.`);

    const categories = [...new Set(products.map((p) => p.category))];
    console.log("\n📊 Hasil produk:");
    console.log(`Total Produk: ${products.length}`);
    console.log(`Kategori: ${categories.join(", ")}`);

    await mongoose.connection.close();
    console.log("\n✅ Database berhasil ditambahkan dan koneksi berakhir.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Gagal menambahkan database:", error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
  process.exit(1);
};

// Run the seed function
seedDatabase();
