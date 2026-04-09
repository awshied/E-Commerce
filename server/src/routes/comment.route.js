import { Router } from "express";
import {
  createComment,
  getCommentsByBlog,
  reactComment,
  replyComment,
} from "../controllers/comment.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protectRoute);

// Ulasan Suatu Blog
router.get("/:blogId", getCommentsByBlog);
router.post("/:blogId", createComment);
router.post("/:blogId/react/:commentId", reactComment);
router.post("/:blogId/reply/:commentId", replyComment);

export default router;
