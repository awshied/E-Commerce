import mongoose from "mongoose";

const newsImageSchema = new mongoose.Schema(
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

const newsSchema = new mongoose.Schema(
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
      maxLength: 300,
    },
    newsImages: [newsImageSchema],
    content: {
      type: [mongoose.Schema.Types.Mixed],
      required: true,
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message: "Setidaknya beri satu tag mengenai berita ini.",
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activity: {
      totalLikes: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalDislikes: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalComments: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalViews: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalParentComments: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    comments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Comment",
    },
    draft: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

newsSchema.index({ tags: 1 });
newsSchema.index({ createdAt: -1 });

export const News = mongoose.model("News", newsSchema);
