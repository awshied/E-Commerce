import cloudinary from "../config/cloudinary.js";
import { Product } from "../models/product.model.js";

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;

    if (!name || !description || !price || !stock || !category) {
      return res
        .status(400)
        .json({ message: "Semua field tidak boleh kosong." });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Unggah minimal 1 gambar." });
    }

    if (req.files.length > 3) {
      return res.status(400).json({ message: "Maksimal hanya 3 gambar." });
    }

    const uploadPromises = req.files.map((file) => {
      return cloudinary.uploader.upload(file.path, {
        folder: "products",
      });
    });

    const uploadResults = await Promise.all(uploadPromises);

    const imageUrls = uploadResults.map((result) => result.secure_url);

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      images: imageUrls,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Tidak bisa menambahkan produk baru", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

export const getAllProduct = async (_, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Produk tidak terbaca:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (stock !== undefined) product.stock = parseInt(stock);
    if (category) product.category = category;

    if (req.files && req.files.length > 0) {
      if (req.files.length > 3) {
        return res.status(400).json({ message: "Maksimal hanya 3 gambar." });
      }

      const uploadPromises = req.files.map((file) => {
        return cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
      });

      const uploadResults = await Promise.all(uploadPromises);
      product.images = uploadResults.map((result) => result.secure_url);
    }

    await product.save();
    res.status(200).json(product);
  } catch (error) {
    console.error("Tidak bisa memperbarui produk:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};
