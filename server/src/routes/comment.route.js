import { Router } from "express";
import {
  createComment,
  getProductComments,
  reactToComment,
  replyToComment,
} from "../controllers/comment.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protectRoute);

// Ulasan Suatu Produk
router.get("/products/:productId", getProductComments);
router.post("/", createComment);
router.post("/:commentId/react", reactToComment);
router.post("/:commentId/reply", replyToComment);

export default router;
