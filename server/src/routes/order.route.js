import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { createOrder, getUserOrder } from "../controllers/order.controller.js";

const router = Router();

router.use(protectRoute);

// Kelola Pesanan
router.post("/", createOrder);
router.get("/", getUserOrder);

export default router;
