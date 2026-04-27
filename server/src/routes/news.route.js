import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getAllNewsForClient,
  getNewsById,
  getNewsBySlug,
  reactToNews,
} from "../controllers/news.controller.js";
import {
  createComment,
  deleteComment,
  getCommentsByNewsId,
  reactToComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.use(protectRoute);

// Lihat - Lihat Berita
router.get("/", getAllNewsForClient);
router.get("/slug/:slug", getNewsBySlug);
router.get("/:id", getNewsById);

// Memberi Reaksi pada Berita
router.post("/:id/react", reactToNews);

// Kelola Komentar
router.post("/:newsId/comments", createComment);
router.get("/:newsId/comments", getCommentsByNewsId);
router.post("/:newsId/comments/:commentId/react", reactToComment);
router.post("/:newsId/comments/:commentId", deleteComment);

export default router;
