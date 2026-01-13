import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

// Membuat atau Menambahkan Pesanan Baru
export const createOrder = async (req, res) => {
  try {
    const user = req.user;
    const { orderItems, shippingAddress, paymentResult, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ error: "Pesanan tidak ada." });
    }

    for (const item of orderItems) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res
          .status(404)
          .json({ error: `Produk ${item.name} tidak ditemukan.` });
      }
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ error: `Stok pada ${item.name} sudah habis.` });
      }
    }

    const order = await Order.create({
      user: user._id,
      orderItems,
      shippingAddress,
      paymentResult,
      totalPrice,
    });

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({ message: "Pesanan berhasil dibuat.", order });
  } catch (error) {
    console.error("Error di controller createOrder:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menangkap Semua Pesanan Pengguna Yang Tersedia
export const getUserOrder = async (req, res) => {
  try {
    const orders = await Order.findById(req.user._id)
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    const orderIds = orders.map((order) => order._id);
    const reviews = await Review.find({ orderId: { $in: orderIds } });
    const reviewedOrderIds = new Set(
      reviews.map((review) => review.orderId.toString())
    );

    const orderWithReviewStatus = await Promise.all(
      orders.map(async (order) => {
        return {
          ...order.toObject(),
          hasReviewed: reviewedOrderIds.has(order._id.toString()),
        };
      })
    );

    res.status(200).json({ orders: orderWithReviewStatus });
  } catch (error) {
    console.error("Error di controller getUserOrder:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};
