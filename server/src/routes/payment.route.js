import { Router } from "express";
import { createPayment } from "../controllers/payment.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create-intent", protectRoute, createPayment);

export default router;
