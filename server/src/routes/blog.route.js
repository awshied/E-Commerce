import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware";
import { getAllBlogs } from "../controllers/admin.controller";
import {
  dislikeBlog,
  getBlogBySlug,
  likeBlog,
} from "../controllers/blog.controller";

const router = Router();

router.use(protectRoute);

// Kelola Blog
router.get("/", getAllBlogs);
router.get("/:slug", getBlogBySlug);
router.post("/:id/like", likeBlog);
router.post("/:id/dislike", dislikeBlog);

export default router;
