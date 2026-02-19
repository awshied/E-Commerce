import mongoose from "mongoose";
import { Notification } from "../models/notification.model.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

// Membuat atau Menambahkan Pesanan Baru
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = req.user;
    const { orderItems, shippingAddress, paymentResult, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ error: "Pesanan tidak ada." });
    }

    for (const item of orderItems) {
      const result = await Product.findOneAndUpdate(
        {
          _id: item.product._id,
          "sizes.size": item.size,
          "sizes.stock": { $gte: item.quantity },
        },
        { $inc: { "sizes.$.stock": -item.quantity } },
        { session, new: true },
      );

      if (!result) {
        await session.abortTransaction();
        return res.status(400).json({
          error: `Stok untuk ukuran ${item.size} tidak mencukupi atau produk tidak ditemukan`,
        });
      }
    }

    const [order] = await Order.create(
      [
        {
          user: user._id,
          orderItems,
          shippingAddress,
          paymentResult,
          totalPrice,
        },
      ],
      { session },
    );

    const shortOrderId = order._id.toString().slice(-8);

    await Notification.create(
      [
        {
          type: "order",
          title: "Pembayaran Baru",
          message: `${user.username} telah melakukan pembayaran pada pesanan #${shortOrderId}.`,
          relatedUser: user._id,
          relatedOrder: order._id,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    res.status(201).json({ message: "Pesanan berhasil dibuat.", order });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error di controller createOrder:", error);
    res.status(500).json({ message: "Server internal error." });
  } finally {
    session.endSession();
  }
};

// Menangkap Semua Pesanan Pengguna Yang Tersedia
export const getUserOrder = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    const orderIds = orders.map((order) => order._id);
    const reviews = await Review.find({ orderId: { $in: orderIds } });
    const reviewedOrderIds = new Set(
      reviews.map((review) => review.orderId.toString()),
    );

    const orderWithReviewStatus = await Promise.all(
      orders.map(async (order) => {
        return {
          ...order.toObject(),
          hasReviewed: reviewedOrderIds.has(order._id.toString()),
        };
      }),
    );

    res.status(200).json({ orders: orderWithReviewStatus });
  } catch (error) {
    console.error("Error di controller getUserOrder:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};
