import { Blog } from "../models/blog.model.js";
import { Comment } from "../models/comment.model.js";

// Menambahkan Ulasan pada Blog
export const createComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { blogId } = req.params;
    const { comment } = req.body;

    if (!blogId) {
      return res
        .status(400)
        .json({ message: "Blog yang diulas harus tersedia." });
    }

    const blogExists = await Blog.exists({ _id: blogId });
    if (!blogExists) {
      return res.status(404).json({ message: "Blog tidak ditemukan." });
    }

    if (!comment) {
      return res.status(400).json({ message: "Komentar tidak boleh kosong." });
    }

    const newComment = await Comment.create({
      blogId,
      userId,
      role: req.user.role,
      comment,
    });

    res
      .status(201)
      .json({ message: "Anda baru saja menambahkan komentar.", newComment });
  } catch (error) {
    console.error("Error di controller createComment:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menangkap Semua Ulasan yang Tersedia pada Satu Blog
export const getCommentsByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    const comments = await Comment.find({
      blogId,
      isHidden: false,
    })
      .populate("userId", "username imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error di controller getCommentsByBlog:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Memberi Reaksi pada Ulasan Tertentu
export const reactComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { commentId } = req.params;
    const { type } = req.body;

    const allowedTypes = ["like", "dislike", "love"];
    if (!type || !allowedTypes.includes(type)) {
      return res.status(400).json({ message: "Tipe reaksi tidak valid." });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Ulasan tidak ditemukan." });
    }

    if (req.user.role === "admin" && type !== "love") {
      return res.status(403).json({ message: "Admin hanya boleh love." });
    }

    if (req.user.role === "user" && type === "love") {
      return res.status(403).json({ message: "User tidak boleh love." });
    }

    comment.reactions = comment.reactions.filter(
      (r) => r.userId.toString() !== userId.toString(),
    );

    comment.reactions.push({
      userId,
      type,
    });

    await comment.save();
    res
      .status(200)
      .json({ message: "Anda telah berhasil memberi reaksi.", comment });
  } catch (error) {
    console.error("Error di controller reactComment:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Membalas Ulasan Tertentu
export const replyComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { commentId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Balasan tidak boleh kosong." });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Ulasan tidak ditemukan." });
    }

    comment.replies.push({
      userId,
      message,
    });

    await comment.save();
    res.status(200).json({
      message: "Anda telah berhasil membalas komentar orang.",
      comment,
    });
  } catch (error) {
    console.error("Error di controller replyComment:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menyembunyikan Ulasan
export const hideComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Ulasan tidak ditemukan." });
    }

    if (
      req.user.role !== "admin" &&
      comment.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "Maaf, anda tidak memiliki izin untuk menyembunyikan ulasan ini.",
      });
    }

    comment.isHidden = true;
    await comment.save();
    res.status(200).json({ message: "Ulasan disembunyikan." });
  } catch (error) {
    console.error("Error di controller hideComment:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};
