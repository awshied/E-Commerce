import { Comment } from "../models/comment.model.js";
import { News } from "../models/news.model.js";
import { User } from "../models/user.model.js";

// Helper
const buildNestedComments = async (comments, userId = null) => {
  const commentMap = {};
  const rootComments = [];

  comments.forEach((comment) => {
    const commentObj = comment.toObject ? comment.toObject() : comment;
    commentObj.replies = [];
    const userIdStr = userId?.toString();
    commentObj.userLiked =
      (userIdStr &&
        comment.activity?.likedBy?.some((id) => id.toString() === userIdStr)) ||
      false;
    commentObj.userDisliked =
      (userIdStr &&
        comment.activity?.dislikedBy?.some(
          (id) => id.toString() === userIdStr,
        )) ||
      false;
    commentMap[commentObj._id.toString()] = commentObj;
  });

  comments.forEach((comment) => {
    const commentId = comment._id.toString();
    const parentId = comment.parent?.toString();

    if (parentId && commentMap[parentId]) {
      commentMap[parentId].replies.push(commentMap[commentId]);
    } else if (!parentId) {
      rootComments.push(commentMap[commentId]);
    }
  });

  return rootComments;
};

// Membuat Komentar Baru (Parent Comment atau Reply)
export const createComment = async (req, res) => {
  try {
    const { newsId } = req.params;
    const { comment, parentId } = req.body;
    const userId = req.user._id;

    if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Komentar tidak boleh kosong." });
    }

    const news = await News.findById(newsId);
    if (!news) {
      return res.status(404).json({ message: "Berita tidak ditemukan." });
    }

    let parentComment = null;
    let isReply = false;

    if (parentId) {
      parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return res
          .status(404)
          .json({ message: "Komentar induk tidak ditemukan." });
      }
      if (parentComment.newsId.toString() !== newsId) {
        return res
          .status(400)
          .json({ message: "Komentar induk tidak sesuai dengan berita." });
      }
      isReply = true;
    }

    // Menambahkan Komentar Baru
    const newComment = await Comment.create({
      newsId,
      userId,
      comment: comment.trim(),
      isReply,
      parent: parentId || null,
      children: [],
      isHidden: false,
      activity: {
        totalLikes: 0,
        totalDislikes: 0,
        likedBy: [],
        dislikedBy: [],
      },
    });

    if (parentId) {
      await Comment.findByIdAndUpdate(parentId, {
        $push: { children: newComment._id },
      });
    }

    const incrementFields = isReply
      ? { "activity.totalComments": 1 }
      : { "activity.totalComments": 1, "activity.totalParentComments": 1 };

    await News.findByIdAndUpdate(newsId, { $inc: incrementFields });
    await newComment.populate("userId", "username imageUrl");

    res.status(201).json({
      message: "Komentar berhasil ditambahkan.",
      comment: newComment,
    });
  } catch (error) {
    console.error("Gagal membuat komentar:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Mendapatkan Komentar Berdasarkan newsId (Nested Structure)
export const getCommentsByNewsId = async (req, res) => {
  try {
    const { newsId } = req.query;
    const userId = req.user?._id;

    if (!newsId) {
      return res.status(400).json({ message: "Parameter newsId wajib diisi." });
    }

    const comments = await Comment.find({ newsId, isHidden: false })
      .populate("userId", "username imageUrl")
      .sort({ createdAt: 1 });

    const nestedComments = await buildNestedComments(comments, userId);

    res.status(200).json({
      message: "Berhasil mengambil komentar.",
      comments: nestedComments,
      total: nestedComments.length,
    });
  } catch (error) {
    console.error("Gagal mengambil komentar:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Mendapatkan Detail Komentar Tertentu dan Balasannya
export const getCommentById = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?._id;

    const comment = await Comment.findById(commentId).populate(
      "userId",
      "username imageUrl",
    );

    if (!comment || (comment.isHidden && req.user?.role !== "admin")) {
      return res.status(404).json({ message: "Komentar tidak ditemukan." });
    }

    const getAllReplies = async (id) => {
      const replies = await Comment.find({ parent: id, isHidden: false })
        .populate("userId", "username imageUrl")
        .sort({ createdAt: 1 });

      for (const reply of replies) {
        reply.replies = await getAllReplies(reply._id);
      }
      return replies;
    };

    const replies = await getAllReplies(commentId);

    const commentObj = comment.toObject();
    commentObj.replies = replies;
    commentObj.userLiked =
      (userId && comment.activity?.likedBy?.includes(userId)) || false;
    commentObj.userDisliked =
      (userId && comment.activity?.dislikedBy?.includes(userId)) || false;

    res.status(200).json({
      message: "Berhasil mengambil detail komentar.",
      comment: commentObj,
    });
  } catch (error) {
    console.error("Gagal mengambil detail komentar:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Mendapatkan Semua Balasan dari Suatu Komentar (Tanpa Parent)
export const getRepliesByCommentId = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ message: "Komentar induk tidak ditemukan." });
    }

    const replies = await Comment.find({ parent: commentId, isHidden: false })
      .populate("userId", "username imageUrl")
      .populate("commentedBy", "username")
      .sort({ createdAt: 1 });

    const nestedReplies = await buildNestedComments(replies, userId);

    res.status(200).json({
      message: "Berhasil mengambil balasan komentar.",
      replies: nestedReplies,
      total: nestedReplies.length,
    });
  } catch (error) {
    console.error("Gagal mengambil balasan komentar:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Edit Komentar
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Komentar tidak boleh kosong." });
    }

    const existingComment = await Comment.findById(commentId);
    if (!existingComment) {
      return res.status(404).json({ message: "Komentar tidak ditemukan." });
    }

    if (
      existingComment.userId.toString() !== userId.toString() &&
      userRole !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Tidak memiliki izin untuk mengedit komentar ini." });
    }

    existingComment.comment = comment.trim();
    await existingComment.save();

    res.status(200).json({
      message: "Komentar berhasil diupdate.",
      comment: existingComment,
    });
  } catch (error) {
    console.error("Gagal mengupdate komentar:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menyukai / Tidak Menyukai Komentar
export const reactToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { type } = req.body;
    const userId = req.user._id;

    if (!["like", "dislike"].includes(type)) {
      return res
        .status(400)
        .json({ message: "Tipe harus 'like' atau 'dislike'." });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Komentar tidak ditemukan." });
    }

    if (!comment.activity.likedBy) comment.activity.likedBy = [];
    if (!comment.activity.dislikedBy) comment.activity.dislikedBy = [];

    const userIdStr = userId.toString();
    const isLikedBy = comment.activity.likedBy.some(
      (id) => id.toString() === userIdStr,
    );
    const isDislikedBy = comment.activity.dislikedBy.some(
      (id) => id.toString() === userIdStr,
    );

    if (type === "like") {
      if (isDislikedBy) {
        comment.activity.dislikedBy = comment.activity.dislikedBy.filter(
          (id) => id.toString() !== userIdStr,
        );
        comment.activity.totalDislikes = Math.max(
          0,
          comment.activity.totalDislikes - 1,
        );
      }

      if (isLikedBy) {
        comment.activity.likedBy = comment.activity.likedBy.filter(
          (id) => id.toString() !== userIdStr,
        );
        comment.activity.totalLikes = Math.max(
          0,
          comment.activity.totalLikes - 1,
        );
      } else {
        comment.activity.likedBy.push(userId);
        comment.activity.totalLikes += 1;
      }
    } else if (type === "dislike") {
      if (isLikedBy) {
        comment.activity.likedBy = comment.activity.likedBy.filter(
          (id) => id.toString() !== userIdStr,
        );
        comment.activity.totalLikes = Math.max(
          0,
          comment.activity.totalLikes - 1,
        );
      }

      if (isDislikedBy) {
        comment.activity.dislikedBy = comment.activity.dislikedBy.filter(
          (id) => id.toString() !== userIdStr,
        );
        comment.activity.totalDislikes = Math.max(
          0,
          comment.activity.totalDislikes - 1,
        );
      } else {
        comment.activity.dislikedBy.push(userId);
        comment.activity.totalDislikes += 1;
      }
    }

    await comment.save();

    res.status(200).json({
      message: `Berhasil ${type === "like" ? "menyukai" : "tidak menyukai"} komentar.`,
      data: {
        totalLikes: comment.activity.totalLikes,
        totalDislikes: comment.activity.totalDislikes,
        userLiked: comment.activity.likedBy.includes(userId),
        userDisliked: comment.activity.dislikedBy.includes(userId),
      },
    });
  } catch (error) {
    console.error("Gagal mereaksi komentar:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menghapus Komentar
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Komentar tidak ditemukan." });
    }

    if (
      comment.userId.toString() !== userId.toString() &&
      userRole !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Tidak memiliki izin untuk menghapus komentar ini." });
    }

    const deleteChildComments = async (parentId) => {
      let count = 0;

      const children = await Comment.find({ parent: parentId });
      for (const child of children) {
        count += await deleteChildComments(child._id);
        await Comment.findByIdAndDelete(child._id);
        count += 1;
      }
      return count;
    };

    const childrenDeleted = await deleteChildComments(commentId);

    if (comment.parent) {
      await Comment.findByIdAndUpdate(comment.parent, {
        $pull: { children: commentId },
      });
    }

    await Comment.findByIdAndDelete(commentId);

    const news = await News.findById(comment.newsId);
    if (news) {
      const totalDeleted = 1 + childrenDeleted;
      const decrements = { "activity.totalComments": -totalDeleted };
      if (!comment.parent) {
        decrements["activity.totalParentComments"] = -1;
      }
      await News.findByIdAndUpdate(comment.newsId, { $inc: decrements });
    }

    res.status(200).json({ message: "Komentar berhasil dihapus." });
  } catch (error) {
    console.error("Gagal menghapus komentar:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menyembunyikan Komentar
export const hideComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { isHidden } = req.body;

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Hanya admin yang dapat menyembunyikan komentar." });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Komentar tidak ditemukan." });
    }

    if (isHidden === undefined) {
      comment.isHidden = !comment.isHidden;
    } else {
      comment.isHidden = isHidden;
    }

    await comment.save();

    res.status(200).json({
      message: `Komentar berhasil ${comment.isHidden ? "disembunyikan" : "ditampilkan kembali"}.`,
      isHidden: comment.isHidden,
    });
  } catch (error) {
    console.error("Gagal menyembunyikan komentar:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};
