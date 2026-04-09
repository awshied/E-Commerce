import mongoose from "mongoose";

const blogImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    caption: {
      type: String,
      required: true,
    },
    blogImages: [blogImageSchema],
    tags: {
      type: [String],
      validate: [
        {
          validator: (v) => Array.isArray(v) && v.length > 0,
          message: "Setidaknya masih membutuhkan satu tag untuk Blog ini.",
        },
        {
          validator: (v) => v.every((tag) => tag && tag.trim().length > 0),
          message: "Tag tidak boleh kosong.",
        },
      ],
      set: (tags) => {
        if (!Array.isArray(tags)) return tags;
        return tags.map((tag) =>
          typeof tag === "string" ? tag.trim().toLowerCase() : tag,
        );
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    dislikes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dislikesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

blogSchema.index({ slug: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ createdAt: -1 });

blogSchema.pre("validate", function (next) {
  if (this.title && !this.slug) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const uniqueSuffix = Date.now().toString(36);
    this.slug = baseSlug ? `${baseSlug}-${uniqueSuffix}` : uniqueSuffix;
  }
  next();
});

export const Blog = mongoose.model("Blog", blogSchema);
