import { Comment } from "../models/comment.model.js";

// Menambahkan Ulasan pada Produk
export const createComment = async (req, res) => {
  try {
    const { productId, comment } = req.body;

    if (!comment) {
      return res.status(400).json({ message: "Komentar tidak boleh kosong." });
    }

    const opinion = await Comment.create({
      productId,
      userId: req.user._id,
      comment,
    });

    res
      .status(201)
      .json({ message: "Anda baru saja menambahkan komentar.", opinion });
  } catch (error) {
    console.error("Error di controller createComment:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menangkap Semua Ulasan yang Tersedia pada Satu Produk
export const getProductComments = async (req, res) => {
  try {
    const { productId } = req.params;

    const comments = await Comment.find({
      productId,
      isHidden: false,
    })
      .populate("user", "username imageUrl role")
      .populate("replies.user", "username role")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error di controller getProductComments:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Memberi Reaksi pada Ulasan Tertentu
export const reactToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { type } = req.body;

    const opinion = await Comment.findById(commentId);
    if (!opinion) {
      return res.status(404).json({ message: "Ulasan tidak ditemukan." });
    }

    if (req.user.role === "admin" && type !== "love") {
      return res.status(403).json({ message: "Admin hanya boleh love." });
    }

    if (req.user.role === "user" && type === "love") {
      return res.status(403).json({ message: "User tidak boleh love." });
    }

    opinion.reactions = opinion.reactions.filter(
      (c) => c.user.toString() !== req.user._id.toString(),
    );

    opinion.reactions.push({
      userId: req.user._id,
      type,
    });

    await opinion.save();
    res
      .status(200)
      .json({ message: "Anda telah berhasil memberi reaksi.", opinion });
  } catch (error) {
    console.error("Error di controller reactToComment:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Membalas Ulasan Tertentu
export const replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Balasan tidak boleh kosong." });
    }

    const opinion = await Comment.findById(commentId);
    if (!opinion) {
      return res.status(404).json({ message: "Ulasan tidak ditemukan." });
    }

    opinion.replies.push({
      userId: req.user._id,
      message,
    });

    await opinion.save();
    res
      .status(200)
      .json({ message: "Anda telah berhasil memberi reaksi.", opinion });
  } catch (error) {
    console.error("Error di controller replyToComment:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menyembunyikan Ulasan
export const hideComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    await Comment.findByIdAndUpdate(commentId, { isHidden: true });

    res.status(200).json({ message: "Ulasan disembunyikan." });
  } catch (error) {
    console.error("Error di controller hideComment:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};
