import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  createReview,
  deleteReview,
} from "../controllers/review.controller.js";

const router = Router();

router.use(protectRoute);

// Kelola Review dan Rating
router.post("/", createReview);
router.delete("/:reviewId", deleteReview);

export default router;
