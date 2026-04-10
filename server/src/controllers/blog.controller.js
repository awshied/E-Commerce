import { Blog } from "../models/blog.model.js";

// User Menyukai Blog
export const likeBlog = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog)
      return res.status(404).json({ message: "Blog tidak ditemukan." });

    const alreadyLiked = blog.likes.some((al) => al.equals(userId));

    if (alreadyLiked) {
      blog.likes.pull(userId);
      blog.likesCount--;
    } else {
      blog.likes.addToSet(userId);
      blog.likesCount++;

      if (blog.dislikes.includes(userId)) {
        blog.dislikes.pull(userId);
        blog.dislikesCount--;
      }
    }

    await blog.save();

    res.status(200).json({
      likesCount: blog.likesCount,
      dislikesCount: blog.dislikesCount,
    });
  } catch (error) {
    console.error("Error di controller likeBlog:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// User Tidak Menyukai Blog
export const dislikeBlog = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    let updatedBlog = await Blog.findOneAndUpdate(
      { _id: id, dislikes: userId },
      {
        $pull: { dislikes: userId },
        $inc: { dislikesCount: -1 },
      },
      { new: true },
    );

    if (!updatedBlog) {
      updatedBlog = await Blog.findByIdAndUpdate(
        id,
        [
          {
            $set: {
              dislikes: { $setUnion: ["$dislikes", [userId]] },
              likes: {
                $filter: { input: "$likes", cond: { $ne: ["$$this", userId] } },
              },
              dislikesCount: {
                $cond: {
                  if: { $in: [userId, "$dislikes"] },
                  then: "$dislikesCount",
                  else: { $add: ["$dislikesCount", 1] },
                },
              },
              likesCount: {
                $cond: {
                  if: { $in: [userId, "$likes"] },
                  then: { $subtract: ["$likesCount", 1] },
                  else: "$likesCount",
                },
              },
            },
          },
        ],
        { new: true },
      );
    }

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog tidak ditemukan." });
    }

    res.status(200).json({
      likesCount: updatedBlog.likesCount,
      dislikesCount: updatedBlog.dislikesCount,
    });
  } catch (error) {
    console.error("Error di controller dislikeBlog:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};

// Menangkap Blog Berdasarkan Slug
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true },
    ).populate("author", "username imageUrl");

    if (!blog)
      return res.status(404).json({ message: "Blog tidak ditemukan." });

    res.status(200).json(blog);
  } catch (error) {
    console.error("Blog tidak terbaca:", error);
    res.status(500).json({ message: "Server internal error." });
  }
};
