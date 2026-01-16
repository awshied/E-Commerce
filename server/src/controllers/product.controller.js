import { Product } from "../models/product.model.js";

// Menangkap Semua Produk yang Tersedia
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({ message: "Produk tidak ditemukan." });

    res.status(200).json(product);
  } catch (error) {
    console.error("Produk tidak terbaca:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};
