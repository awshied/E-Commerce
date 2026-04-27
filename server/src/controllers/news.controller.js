import mongoose from "mongoose";

import { Comment } from "../models/comment.model.js";
import { News } from "../models/news.model.js";
import { User } from "../models/user.model.js";

// Helper
const buildNestedComments = async (comments, userId = null) => {
  const commentMap = {};
  const rootComments = [];
  const userIdStr = userId?.toString();

  comments.forEach((comment) => {
    commentMap[comment._id.toString()] = {
      ...comment.toObject(),
      replies: [],
      userLiked: userIdStr
        ? comment.activity.likedBy?.some((id) => id.toString() === userIdStr)
        : false,
      userDisliked: userIdStr
        ? comment.activity.dislikedBy?.some((id) => id.toString() === userIdStr)
        : false,
    };
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

  return rootComments;
};

// Menangkap Semua Berita yang Tersedia Untuk User/Publik
export const getAllNewsForClient = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const { tag } = req.query;
    const skip = (page - 1) * limit;
    const filter = { draft: false };

    if (tag) filter.tags = tag;

    const [news, total] = await Promise.all([
      News.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("title slug caption tags newsImages activity userId createdAt")
        .populate("userId", "username imageUrl"),
      News.countDocuments(filter),
    ]);

    const newsWithUserReaction = news.map((item) => {
      const newsObj = item.toObject();
      if (req.user) {
        const itemIdStr = item._id.toString();
        newsObj.userLiked =
          req.user.newsLikes?.some((id) => id.toString() === itemIdStr) ||
          false;
        newsObj.userDisliked =
          req.user.newsDislikes?.some((id) => id.toString() === itemIdStr) ||
          false;
      }
      return newsObj;
    });

    res.status(200).json({
      message: "Berhasil mengambil daftar berita.",
      news: newsWithUserReaction,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Gagal mengambil berita:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menangkap Berita Berdasarkan Id
export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findOneAndUpdate(
      { _id: id, draft: false },
      { $inc: { "activity.totalViews": 1 } },
      { new: true },
    ).populate("userId", "username imageUrl");
    if (!news)
      return res.status(404).json({ message: "Berita tidak ditemukan." });

    const allComments = await Comment.find({ newsId: id })
      .populate("userId", "username imageUrl")
      .populate("commentedBy", "username")
      .sort({ createdAt: 1 });

    const nestedComments = await buildNestedComments(
      allComments,
      req.user?._id,
    );

    const newsObj = news.toObject();
    if (req.user) {
      newsObj.userLiked = req.user.newsLikes?.includes(news._id) || false;
      newsObj.userDisliked = req.user.newsDislikes?.includes(news._id) || false;
    }

    res.status(200).json({
      message: "Berhasil mengambil berita berdasarkan ID.",
      news: newsObj,
      comments: nestedComments,
    });
  } catch (error) {
    console.error("Berita tidak terbaca:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Mendapatkan berita berdasarkan slug
export const getNewsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const news = await News.findOne({ slug, draft: false }).populate(
      "userId",
      "username imageUrl",
    );

    if (!news) {
      return res.status(404).json({ message: "Berita tidak ditemukan." });
    }

    news.activity.totalViews += 1;
    await news.save();

    const allComments = await Comment.find({ newsId: news._id })
      .populate("userId", "username imageUrl")
      .populate("commentedBy", "username")
      .sort({ createdAt: 1 });

    const nestedComments = await buildNestedComments(
      allComments,
      req.user?._id,
    );

    const newsObj = news.toObject();
    if (req.user) {
      newsObj.userLiked = req.user.newsLikes?.includes(news._id) || false;
      newsObj.userDisliked = req.user.newsDislikes?.includes(news._id) || false;
    }

    res.status(200).json({
      message: "Berhasil mengambil detail berita.",
      news: newsObj,
      comments: nestedComments,
    });
  } catch (error) {
    console.error("Berita tidak terbaca:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menyukai / Tidak Menyukai Berita
export const reactToNews = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { type } = req.body;
    const userId = req.user._id;

    if (!["like", "dislike"].includes(type)) {
      return res
        .status(400)
        .json({ message: "Tipe harus 'like' atau 'dislike'." });
    }

    const news = await News.findById(id).session(session);
    if (!news) {
      return res.status(404).json({ message: "Berita tidak ditemukan." });
    }

    const user = await User.findById(userId);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    const newsIdStr = news._id.toString();

    if (type === "like") {
      if (user.newsDislikes.some((id) => id.toString() === newsIdStr)) {
        user.newsDislikes = user.newsDislikes.filter(
          (id) => id.toString() !== news._id.toString(),
        );
        news.activity.totalDislikes = Math.max(
          0,
          news.activity.totalDislikes - 1,
        );
      }

      if (user.newsLikes.some((id) => id.toString() === newsIdStr)) {
        user.newsLikes = user.newsLikes.filter(
          (id) => id.toString() !== news._id.toString(),
        );
        news.activity.totalLikes = Math.max(0, news.activity.totalLikes - 1);
      } else {
        user.newsLikes.push(news._id);
        news.activity.totalLikes += 1;
      }
    } else if (type === "dislike") {
      if (user.newsLikes.some((id) => id.toString() === newsIdStr)) {
        user.newsLikes = user.newsLikes.filter(
          (id) => id.toString() !== news._id.toString(),
        );
        news.activity.totalLikes = Math.max(0, news.activity.totalLikes - 1);
      }

      if (user.newsDislikes.some((id) => id.toString() === newsIdStr)) {
        user.newsDislikes = user.newsDislikes.filter(
          (id) => id.toString() !== news._id.toString(),
        );
        news.activity.totalDislikes = Math.max(
          0,
          news.activity.totalDislikes - 1,
        );
      } else {
        user.newsDislikes.push(news._id);
        news.activity.totalDislikes += 1;
      }
    }

    await Promise.all([news.save({ session }), user.save({ session })]);
    await session.commitTransaction();
    res.status(200).json({
      message: `Berhasil ${type === "like" ? "menyukai" : "tidak menyukai"} berita.`,
      data: {
        totalLikes: news.activity.totalLikes,
        totalDislikes: news.activity.totalDislikes,
        userLiked: user.newsLikes.some(
          (id) => id.toString() === news._id.toString(),
        ),
        userDisliked: user.newsDislikes.some(
          (id) => id.toString() === news._id.toString(),
        ),
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Gagal mereaksi berita:", error);
    res.status(500).json({ message: "Server internal error." });
  } finally {
    session.endSession();
  }
};
