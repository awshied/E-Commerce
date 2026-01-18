import cloudinary from "../config/cloudinary.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";

// Membuat atau Menambahkan Produk Baru
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
    console.error("Tidak bisa menambahkan produk baru:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menangkap Semua Produk Yang Tersedia
export const getAllProducts = async (_, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Produk tidak terbaca:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Memperbarui Produk
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
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

// Menghapus Produk
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((imageUrl) => {
        const publicId =
          "products/" + imageUrl.split("/products/")[1]?.split(".")[0];
        if (publicId) return cloudinary.uploader.destroy(publicId);
      });
      await Promise.all(deletePromises.filter(Boolean));
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Produk berhasil dihapus." });
  } catch (error) {
    console.error("Tidak bisa menghapus produk:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menangkap Semua Pesanan Yang Tersedia
export const getAllOrders = async (_, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error pada controller getAllOrders:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Memperbarui Pesanan
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["Dikemas", "Dikirim", "Diterima"].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid." });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({ message: "Pesanan tidak ditemukan." });
    }

    order.status = status;

    if (status === "Dikirim" && !order.shippedAt) {
      order.shippedAt = new Date();
    }

    if (status === "Diterima" && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    await order.save();

    res
      .status(200)
      .json({ message: "Status pesanan berhasil diperbarui.", order });
  } catch (error) {
    console.error("Error pada controller updateOrderStatus:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menangkap Semua Pelanggan Yang Tersedia
export const getAllCustomers = async (_, res) => {
  try {
    const customers = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ customers });
  } catch (error) {
    console.error("Customer tidak terbaca:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menangkap Semua Data Dashboard Yang Tersedia
export const getDashboardStats = async (_, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    const deliveredOrders = await Order.countDocuments({
      status: "Diterima",
    });

    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    const totalCustomers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    res.status(200).json({
      totalRevenue,
      totalOrders,
      deliveredOrders,
      totalCustomers,
      totalProducts,
    });
  } catch (error) {
    console.error("Dashboard tidak terbaca:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};
