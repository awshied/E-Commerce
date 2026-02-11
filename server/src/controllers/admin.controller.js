import cloudinary from "../config/cloudinary.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { Expense } from "../models/expense.model.js";

// Membuat atau Menambahkan Produk Baru
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, types, sizes } = req.body;

    if (!name || !description || !price || !category || !types || !sizes) {
      return res
        .status(400)
        .json({ message: "Semua field tidak boleh kosong." });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: "Harga tidak valid." });
    }

    let parsedSizes;
    try {
      parsedSizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
    } catch {
      return res.status(400).json({ message: "Format sizes tidak valid." });
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
      price: parsedPrice,
      category,
      types,
      sizes: parsedSizes,
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
    const { name, description, price, category, types, sizes } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
    if (category) product.category = category;
    if (types) product.types = types;

    if (sizes) {
      try {
        product.sizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
      } catch (error) {
        return res.status(400).json({ message: "Format sizes tidak valid." });
      }
    }

    if (req.files && req.files.length > 0) {
      if (req.files.length > 3) {
        return res.status(400).json({ message: "Maksimal hanya 3 gambar." });
      }

      if (product.images && product.images.length > 0) {
        const deletePromises = product.images.map((imageUrl) => {
          const publicId =
            "products/" + imageUrl.split("/products/")[1]?.split(".")[0];
          if (publicId) return cloudinary.uploader.destroy(publicId);
        });
        await Promise.all(deletePromises.filter(Boolean));
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

    if (!["dikemas", "dikirim", "diterima"].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid." });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }

    order.status = status;

    if (status === "dikirim" && !order.shippedAt) {
      order.shippedAt = new Date();
    }

    if (status === "diterima" && !order.deliveredAt) {
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
    const customers = await User.find({ role: "user" })
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });
    res.status(200).json({ total: customers.length, customers });
  } catch (error) {
    console.error("Customer tidak terbaca:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menangkap Semua Stats Pelanggan
export const getCustomersWithStats = async (_, res) => {
  try {
    const customers = await User.find({ role: "user" }).select(
      "_id username email addresses createdAt",
    );

    const customerIds = customers.map((u) => u._id);

    const orders = await Order.find({
      user: { $in: customerIds },
      status: "diterima",
    });

    const orderMap = {};

    orders.forEach((order) => {
      const uid = order.user.toString();

      if (!orderMap[uid]) {
        orderMap[uid] = {
          totalSpent: 0,
          lastOrder: null,
        };
      }

      orderMap[uid].totalSpent += order.totalPrice;

      if (
        !orderMap[uid].lastOrder ||
        order.createdAt > orderMap[uid].lastOrder.createdAt
      ) {
        orderMap[uid].lastOrder = order;
      }
    });

    const result = customers.map((user) => {
      const stats = orderMap[user._id.toString()] || {};

      return {
        ...user.toObject(),
        totalSpent: stats.totalSpent || 0,
        lastOrderAmount: stats.lastOrder?.totalPrice || 0,
        lastOrderDate: stats.lastOrder?.createdAt || null,
      };
    });

    res.status(200).json({ customers: result });
  } catch (error) {
    console.error("Gagal menangkap stats pelanggan:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menangkap Semua Data Dashboard Yang Tersedia
export const getDashboardStats = async (_, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    const deliveredOrders = await Order.countDocuments({
      status: "diterima",
    });

    const revenueResult = await Order.aggregate([
      {
        $match: { status: "diterima" },
      },
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

// Menangkap Data Pendapatan dan Pengeluaran Setiap Bulan dalam Setahun
export const getRevenueExpenseChart = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const revenue = Array(12).fill(0);
    const expense = Array(12).fill(0);

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          },
          status: "diterima",
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalPrice" },
        },
      },
    ]);

    revenueData.forEach((item) => {
      revenue[item._id - 1] = item.total;
    });

    const expenseData = await Expense.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    expenseData.forEach((item) => {
      expense[item._id - 1] = item.total;
    });

    res.status(200).json({
      year,
      revenue,
      expense,
    });
  } catch (error) {
    console.error("Chart tidak terbaca:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menangkap Status Keaktifan Pelanggan yang Tersedia
export const getUserOnlineStatus = async (_, res) => {
  try {
    const customers = await User.find({ role: "user" })
      .select("-password -refreshToken")
      .sort({ lastActive: -1 });

    const now = new Date();

    const ONLINE_THRESHOLD = 30 * 1000;

    const onlineUsers = [];
    const offlineUsers = [];

    customers.forEach((user) => {
      const diff = now - new Date(user.lastActive);

      if (diff <= ONLINE_THRESHOLD) {
        onlineUsers.push(user);
      } else {
        offlineUsers.push(user);
      }
    });

    res.status(200).json({
      totalOnline: onlineUsers.length,
      totalOffline: offlineUsers.length,
      onlineUsers,
      offlineUsers,
    });
  } catch (error) {
    console.error("Gagal mengambil status user:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};
