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
router.get("/:id", getCommentsByBlog);
router.post("/:id", createComment);
router.post("/:id/react/:commentId", reactComment);
router.post("/:id/reply/:commentId", replyComment);

export default router;
