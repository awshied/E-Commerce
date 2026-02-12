import { Category } from "../models/category.model.js";
import { Type } from "../models/type.model.js";
import { Product } from "../models/product.model.js";

// Menangkap Semua Kategori Yang Tersedia
export const getAllCategories = async (_, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server internal error." });
  }
};

// Membuat Kategori Baru
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name)
      return res.status(400).json({ message: "Nama kategori wajib diisi." });

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Kategori sudah ada." });
    }

    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Server internal error." });
  }
};

// Memperbarui Kategori
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true },
    );

    if (!category)
      return res.status(404).json({ message: "Kategori tidak ditemukan." });

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menghapus Kategori
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const used = await Product.findOne({ category: id });
    if (used)
      return res
        .status(400)
        .json({ message: "Kategori masih digunakan produk." });

    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: "Kategori dihapus." });
  } catch (error) {
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menangkap Semua Tipe Yang Tersedia
export const getAllTypes = async (req, res) => {
  try {
    const { category } = req.query;

    let filter = {};
    if (category) filter.category = category;

    const types = await Type.find(filter)
      .populate("category", "name")
      .sort({ name: 1 });

    res.status(200).json(types);
  } catch (error) {
    res.status(500).json({ message: "Server internal error." });
  }
};

// Membuat Tipe Baru
export const createType = async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name || !category)
      return res
        .status(400)
        .json({ message: "Nama dan kategori wajib diisi." });

    const existingType = await Type.findOne({ name, category });
    if (existingType) {
      return res.status(400).json({ message: "Tipe sudah ada." });
    }

    const type = await Type.create({ name, category });
    res.status(201).json(type);
  } catch (error) {
    res.status(500).json({ message: "Server internal error." });
  }
};

// Memperbarui Tipe
export const updateType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    const type = await Type.findByIdAndUpdate(
      id,
      { name, category },
      { new: true },
    );

    if (!type)
      return res.status(404).json({ message: "Tipe tidak ditemukan." });

    res.status(200).json(type);
  } catch (error) {
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menghapus Tipe
export const deleteType = async (req, res) => {
  try {
    const { id } = req.params;

    const used = await Product.findOne({ type: id });
    if (used)
      return res.status(400).json({ message: "Tipe masih digunakan produk." });

    await Type.findByIdAndDelete(id);
    res.status(200).json({ message: "Tipe dihapus." });
  } catch (error) {
    res.status(500).json({ message: "Server internal error." });
  }
};
