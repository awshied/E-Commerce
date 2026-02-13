import { Product } from "../models/product.model.js";
import {
  calculateProductStatus,
  attachFinalPrice,
} from "../lib/productStatus.js";

// Menangkap Produk Berdasarkan Id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({ message: "Produk tidak ditemukan." });

    const { isNewActive, isPromoActive } = calculateProductStatus(product);

    const sizesWithFinalPrice = attachFinalPrice(product, isPromoActive);

    res.status(200).json({
      ...product.toObject(),
      newLabel: isNewActive,
      isPromoActive,
      sizes: sizesWithFinalPrice,
    });
  } catch (error) {
    console.error("Produk tidak terbaca:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};
