import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    newsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "News",
      required: true,
    },
    commentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    children: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Comment",
      default: [],
    },
    isReply: {
      type: Boolean,
      default: false,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    isHidden: {
      type: Boolean,
      default: false,
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
      likedBy: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: [],
      },
      dislikedBy: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: [],
      },
    },
  },
  {
    timestamps: true,
  },
);

commentSchema.index({ newsId: 1 });
commentSchema.index({ parent: 1 });

export const Comment = mongoose.model("Comment", commentSchema);
