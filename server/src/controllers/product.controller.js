import { Product } from "../models/product.model.js";

// Menangkap Semua Produk yang Tersedia
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate("category", "name")
      .populate("type", "name");

    if (!product)
      return res.status(404).json({ message: "Produk tidak ditemukan." });

    const now = new Date();

    const newLabel = product.newUntil && product.newUntil > now;

    const isPromoActive =
      product.promo &&
      product.promo.startDate <= now &&
      product.promo.endDate >= now;

    const sizesWithFinalPrice = product.sizes.map((size) => {
      let finalPrice = size.price;

      if (isPromoActive) {
        finalPrice =
          size.price - (size.price * product.promo.discountPercent) / 100;
      }

      return {
        ...size.toObject(),
        finalPrice,
      };
    });

    res.status(200).json({
      ...product.toObject(),
      newLabel,
      isPromoActive,
      sizes: sizesWithFinalPrice,
    });
  } catch (error) {
    console.error("Produk tidak terbaca:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Mendapatkan Semua Produk yang Telah Difilter
export const getAllProductsPublic = async (req, res) => {
  try {
    const { category, type, gender } = req.query;

    let filter = {};
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (gender) filter.gender = gender;

    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("type", "name")
      .sort({ createdAt: -1 });

    const now = new Date();

    const formatted = products.map((product) => {
      const newLabel = product.newUntil && product.newUntil > now;

      const isPromoActive =
        product.promo &&
        product.promo.startDate <= now &&
        product.promo.endDate >= now;

      const sizesWithFinalPrice = product.sizes.map((size) => {
        let finalPrice = size.price;

        if (isPromoActive) {
          finalPrice =
            size.price - (size.price * product.promo.discountPercent) / 100;
        }

        return {
          ...size.toObject(),
          finalPrice,
        };
      });

      return {
        ...product.toObject(),
        newLabel,
        isPromoActive,
        sizes: sizesWithFinalPrice,
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Server internal error." });
  }
};
