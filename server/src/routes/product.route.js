import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getAllProductsPublic,
  getProductById,
} from "../controllers/product.controller.js";

const router = Router();

router.use(protectRoute);

// Lihat - Lihat Produk
router.get("/", getAllProductsPublic);
router.get("/:id", getProductById);

export default router;
