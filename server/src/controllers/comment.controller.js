import { Comment } from "../models/comment.model.js";
import { News } from "../models/news.model.js";
import { User } from "../models/user.model.js";

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
      isReply = true;
    }

    // Menambahkan Komentar Baru
    const newComment = await Comment.create({
      newsId,
      userId,
      comment: comment.trim(),
      commentedBy: userId,
      isReply,
      parent: parentId || null,
      activity: {
        totalLikes: 0,
        totalDislikes: 0,
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
    await newComment.populate("commentedBy", "username");

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
    const { newsId } = req.params;
    const userId = req.user?._id;

    const comments = await Comment.find({ newsId })
      .populate("userId", "username imageUrl")
      .populate("commentedBy", "username")
      .sort({ createdAt: 1 });

    // Build nested comments
    const commentMap = {};
    const rootComments = [];

    comments.forEach((comment) => {
      const userIdStr = userId?.toString();
      const commentObj = comment.toObject();
      commentObj.replies = [];
      commentObj.userLiked =
        (userIdStr &&
          comment.activity.likedBy?.some(
            (id) => id.toString() === userIdStr,
          )) ||
        false;
      commentObj.userDisliked =
        (userIdStr &&
          comment.activity.dislikedBy?.some(
            (id) => id.toString() === userIdStr,
          )) ||
        false;
      commentMap[comment._id.toString()] = commentObj;
    });

    comments.forEach((comment) => {
      if (comment.parent && commentMap[comment.parent.toString()]) {
        commentMap[comment.parent.toString()].replies.push(
          commentMap[comment._id.toString()],
        );
      } else if (!comment.parent) {
        rootComments.push(commentMap[comment._id.toString()]);
      }
    });

    res.status(200).json({
      message: "Berhasil mengambil komentar.",
      comments: rootComments,
    });
  } catch (error) {
    console.error("Gagal mengambil komentar:", error);
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
