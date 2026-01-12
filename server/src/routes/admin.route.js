import { Router } from "express";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";
import {
  createProduct,
  getAllProduct,
  updateProduct,
} from "../controllers/admin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(protectRoute, adminOnly);

router.post("/products", upload.array("images", 3), createProduct);
router.get("/products", getAllProduct);
router.put("/products/:id", upload.array("images", 3), updateProduct);

export default router;
