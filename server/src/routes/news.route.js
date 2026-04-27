import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getAllNewsForClient,
  getNewsById,
  getNewsBySlug,
  reactToNews,
} from "../controllers/news.controller.js";

const router = Router();

router.use(protectRoute);

// Lihat - Lihat Berita
router.get("/", getAllNewsForClient);
router.get("/slug/:slug", getNewsBySlug);
router.get("/:id", getNewsById);

// Memberi Reaksi pada Berita
router.post("/:id/react", reactToNews);

export default router;
