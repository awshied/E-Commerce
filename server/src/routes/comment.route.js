import { Router } from "express";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";
import {
  createComment,
  deleteComment,
  getCommentById,
  getCommentsByNewsId,
  getRepliesByCommentId,
  hideComment,
  reactToComment,
  updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.use(protectRoute);

// Membaca Komentar yang Telah Diambil
router.get("/", getCommentsByNewsId);
router.get("/:commentId", getCommentById);
router.get("/:commentId/replies", getRepliesByCommentId);

// Kelola Komentar
router.post("/", createComment);
router.put("/:commentId", updateComment);
router.post("/:commentId/react", reactToComment);
router.delete("/:commentId", deleteComment);

// Sembunyikan Komentar
router.put("/:commentId/hide", adminOnly, hideComment);

export default router;
