import slugify from "slugify";

import cloudinary from "../config/cloudinary.js";
import { Notification } from "../models/notification.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { Expense } from "../models/expense.model.js";
import { News } from "../models/news.model.js";
import { Comment } from "../models/comment.model.js";
import {
  calculateProductStatus,
  attachFinalPrice,
} from "../lib/productStatus.js";
import { validatePromo } from "../lib/validatePromo.js";

// Menangkap Semua Notifikasi yang Tersedia
export const getNotifications = async (_, res) => {
  try {
    const notifications = await Notification.find()
      .populate("relatedUser")
      .sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error di controller getNotifications:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menandai Notifikasi yang Sudah Dibaca
export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.notificationId, {
      isRead: true,
    });

    res.status(200).json({ message: "Notifikasi telah dibaca." });
  } catch (error) {
    console.error("Error di controller markAsRead:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menghapus Satu Notifikasi
export const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.notificationId);
    res.status(200).json({ message: "Notifikasi telah dihapus." });
  } catch (error) {
    console.error("Error di controller deleteNotification:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menghapus Semua Notifikasi yang Ada
export const deleteAllNotifications = async (_, res) => {
  try {
    await Notification.deleteMany();
    res.status(200).json({ message: "Semua notifikasi berhasil dihapus." });
  } catch (error) {
    console.error("Error di controller deleteAllNotifications:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Membuat atau Menambahkan Produk Baru
export const createProduct = async (req, res) => {
  try {
    const { name, description, category, type, gender, sizes, promo } =
      req.body;

    if (!name || !description || !category || !type || !sizes) {
      return res
        .status(400)
        .json({ message: "Semua field tidak boleh kosong." });
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

    const imageUrls = uploadResults.map((result) => ({
      url: result.secure_url,
      public_id: result.public_id,
    }));

    let parsedPromo = null;
    if (promo) {
      try {
        parsedPromo = typeof promo === "string" ? JSON.parse(promo) : promo;

        validatePromo(parsedPromo);
      } catch (error) {
        return res.status(400).json({
          message: error.message || "Promo tidak valid.",
        });
      }
    }

    const product = await Product.create({
      name,
      description,
      category,
      type,
      gender,
      sizes: parsedSizes,
      images: imageUrls,
      promo: parsedPromo,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Tidak bisa menambahkan produk baru:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menangkap Semua Produk Yang Tersedia
export const getAllProducts = async (req, res) => {
  try {
    const { promoOnly, newOnly } = req.query;

    const products = await Product.find().sort({ createdAt: -1 });

    const formattedProducts = products.map((product) => {
      const { isNewActive, isPromoActive } = calculateProductStatus(product);

      if (promoOnly && !isPromoActive) return null;
      if (newOnly && !isNewActive) return null;

      const sizesWithFinalPrice = attachFinalPrice(product, isPromoActive);

      return {
        ...product.toObject(),
        newLabel: isNewActive,
        isPromoActive,
        sizes: sizesWithFinalPrice,
      };
    });

    res.status(200).json(formattedProducts.filter(Boolean));
  } catch (error) {
    console.error("Produk tidak terbaca:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Memperbarui Produk
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, type, gender, sizes, promo } =
      req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan." });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (type) product.type = type;
    if (gender) product.gender = gender;

    if (sizes) {
      try {
        product.sizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes;
      } catch (error) {
        return res.status(400).json({ message: "Format sizes tidak valid." });
      }
    }

    if (promo !== undefined) {
      try {
        const parsedPromo =
          typeof promo === "string" ? JSON.parse(promo) : promo;

        validatePromo(parsedPromo);

        product.promo = parsedPromo;
      } catch (error) {
        return res.status(400).json({
          message: error.message || "Promo tidak valid.",
        });
      }
    }

    if (req.files && req.files.length > 0) {
      if (req.files.length > 3) {
        return res.status(400).json({ message: "Maksimal hanya 3 gambar." });
      }

      if (product.images && product.images.length > 0) {
        const deletePromises = product.images.map((image) =>
          cloudinary.uploader.destroy(image.public_id),
        );

        await Promise.all(deletePromises);
      }

      const uploadPromises = req.files.map((file) => {
        return cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
      });

      const uploadResults = await Promise.all(uploadPromises);
      product.images = uploadResults.map((result) => ({
        url: result.secure_url,
        public_id: result.public_id,
      }));
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
      const deletePromises = product.images.map((image) =>
        cloudinary.uploader.destroy(image.public_id),
      );

      await Promise.all(deletePromises);
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Produk berhasil dihapus." });
  } catch (error) {
    console.error("Tidak bisa menghapus produk:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Helper
const generateUniqueSlug = async (title) => {
  const base = slugify(title, { lower: true, strict: true });
  const exists = await News.exists({ slug: base });
  if (!exists) return base;
  return `${base}-${Date.now()}`;
};

// Membuat atau Menambahkan Berita Baru
export const createNews = async (req, res) => {
  try {
    const { title, caption, content, tags, draft } = req.body;

    if (!title || !caption || !content || !tags || draft === undefined) {
      return res
        .status(400)
        .json({ message: "Semua field tidak boleh kosong." });
    }

    if (caption.length > 300) {
      return res.status(400).json({
        message: "Caption berita ini tidak boleh lebih dari 300 karakter.",
      });
    }

    let parsedContent, parsedTags;
    try {
      parsedContent = JSON.parse(content);
      parsedTags = JSON.parse(tags);
    } catch {
      return res
        .status(400)
        .json({ message: "Format konten atau tags tidak valid." });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Unggah minimal 1 gambar." });
    }

    if (req.files.length > 3) {
      return res.status(400).json({ message: "Maksimal hanya 3 gambar." });
    }

    const uploadPromises = req.files.map((file) => {
      return cloudinary.uploader.upload(file.path, {
        folder: "news",
      });
    });

    const uploadResults = await Promise.all(uploadPromises);

    const imageUrls = uploadResults.map((result) => ({
      url: result.secure_url,
      public_id: result.public_id,
    }));

    const slug = await generateUniqueSlug(title);

    const news = await News.create({
      title,
      slug,
      caption,
      content: parsedContent,
      tags: parsedTags,
      newsImages: imageUrls,
      draft: draft === "true" || draft === true,
      userId: req.user._id,
    });

    res.status(201).json({ message: "Berita berhasil diterbitkan.", news });
  } catch (error) {
    console.error("Tidak bisa menambahkan berita baru:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menangkap Semua Berita Yang Tersedia
export const getAllNews = async (req, res) => {
  try {
    const { page = 1, limit = 10, tag, draft } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter = {};

    if (tag) filter.tags = tag;
    if (draft !== undefined) filter.draft = draft === "true";

    const [news, total] = await Promise.all([
      News.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select(
          "title slug caption tags newsImages activity userId createdAt draft",
        )
        .populate("userId", "username imageUrl"),
      News.countDocuments(filter),
    ]);

    res.status(200).json({
      message: "Tinjau semua berita yang telah Anda terbitkan.",
      news,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Berita tidak terbaca:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Memperbarui Berita
export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, caption, content, tags, draft } = req.body;

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: "Berita tidak ditemukan." });
    }

    if (title) news.title = title;
    if (caption) news.caption = caption;

    if (content) {
      try {
        news.content = JSON.parse(content);
      } catch {
        return res.status(400).json({ message: "Format konten tidak valid." });
      }
    }

    if (tags) {
      try {
        news.tags = JSON.parse(tags);
      } catch {
        return res.status(400).json({ message: "Format tags tidak valid." });
      }
    }

    if (draft !== undefined) news.draft = draft === "true" || draft === true;

    if (req.files && req.files.length > 0) {
      if (req.files.length > 3) {
        return res.status(400).json({ message: "Maksimal hanya 3 gambar." });
      }

      if (news.newsImages && news.newsImages.length > 0) {
        const deletePromises = news.newsImages.map((newsImage) =>
          cloudinary.uploader.destroy(newsImage.public_id),
        );

        await Promise.all(deletePromises);
      }

      const uploadPromises = req.files.map((file) => {
        return cloudinary.uploader.upload(file.path, {
          folder: "news",
        });
      });

      const uploadResults = await Promise.all(uploadPromises);
      news.newsImages = uploadResults.map((result) => ({
        url: result.secure_url,
        public_id: result.public_id,
      }));
    }

    await news.save();
    res.status(200).json({ message: "Berita berhasil diperbarui.", news });
  } catch (error) {
    console.error("Tidak bisa memperbarui berita:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menghapus Berita
export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: "Berita tidak ditemukan." });
    }

    if (news.newsImages && news.newsImages.length > 0) {
      const deletePromises = news.newsImages.map((newsImage) =>
        cloudinary.uploader.destroy(newsImage.public_id),
      );

      await Promise.all(deletePromises);
    }

    await Comment.deleteMany({ newsId: id });
    await News.findByIdAndDelete(id);
    res.status(200).json({ message: "Berita berhasil dihapus." });
  } catch (error) {
    console.error("Tidak bisa menghapus berita:", error);
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
