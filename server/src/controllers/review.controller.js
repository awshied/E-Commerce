import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

// Menambahkan Review dan Rating pada Produk
export const createReview = async (req, res) => {
  try {
    const { productId, orderId, rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ error: "Rating harus di antara 1 sampai 5." });
    }

    const user = req.user;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Pesanan tidak ditemukan." });
    }

    if (order.user.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Tidak terotorisasi untuk memberi rating." });
    }

    if (order.status !== "diterima") {
      return res.status(400).json({
        error: "Hanya bisa memberi rating pada pesanan yang diterima.",
      });
    }

    const productInOrder = order.orderItems.find(
      (item) => item.product.toString() === productId.toString(),
    );
    if (!productInOrder) {
      return res
        .status(400)
        .json({ error: "Produk tidak ditemukan pada pesanan ini." });
    }

    const review = await Review.findOneAndUpdate(
      { productId, userId: user._id },
      {
        $set: { rating },
        $setOnInsert: { orderId, productId, userId: user._id },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        includeResultMetadata: true,
      },
    );

    const isNewReview = !review.lastErrorObject?.updatedExisting;
    const reviewDoc = review.value;

    const reviews = await Review.find({ productId });
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        averageRating: totalRating / reviews.length,
        totalReviews: reviews.length,
      },
      { new: true, runValidators: true },
    );

    if (!updatedProduct) {
      await Review.findByIdAndDelete(review._id);
      return res.status(404).json({ error: "Produk tidak ditemukan." });
    }

    res.status(isNewReview ? 201 : 200).json({
      message: isNewReview
        ? "Berhasil memberi rating."
        : "Berhasil memperbarui rating.",
      review: reviewDoc,
    });
  } catch (error) {
    console.error("Error di controller createReview:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menghapus Review dan Rating pada Produk
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const user = req.user;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review tidak ditemukan." });
    }

    if (review.userId.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Tidak terotorisasi untuk menghapus review ini." });
    }

    const productId = review.productId;

    await Review.findByIdAndDelete(reviewId);

    const reviews = await Review.find({ productId });
    const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);

    await Product.findByIdAndUpdate(productId, {
      averageRating: reviews.length > 0 ? totalRating / reviews.length : 0,
      totalReviews: reviews.length,
    });

    res.status(200).json({ message: "Berhasil menghapus review." });
  } catch (error) {
    console.error("Error di controller deleteReview:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};
