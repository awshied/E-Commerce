import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getProductById } from "../controllers/product.controller.js";
import { getAllProducts } from "../controllers/admin.controller.js";

const router = Router();

router.use(protectRoute);

// Lihat - Lihat Produk
router.get("/", getAllProducts);
router.get("/:id", getProductById);

export default router;
