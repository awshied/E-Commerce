import { Router } from "express";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";
import {
  createProduct,
  deleteProduct,
  getAllCustomers,
  getAllOrders,
  getAllProducts,
  getCustomersWithStats,
  getDashboardStats,
  getRevenueExpenseChart,
  getUserOnlineStatus,
  updateOrderStatus,
  updateProduct,
} from "../controllers/admin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(protectRoute, adminOnly);

// Kelola Produk
router.post("/products", upload.array("images", 3), createProduct);
router.get("/products", getAllProducts);
router.put("/products/:id", upload.array("images", 3), updateProduct);
router.delete("/products/:id", deleteProduct);

// Kelola Pesanan
router.get("/orders", getAllOrders);
router.patch("/orders/:orderId/status", updateOrderStatus);

// Kelola Customer
router.get("/customers", getAllCustomers);
router.get("/customers/stats", getCustomersWithStats);

// Pantau Dashboard
router.get("/stats", getDashboardStats);
router.get("/revenueExpense", getRevenueExpenseChart);
router.get("/onlineStatus", getUserOnlineStatus);

export default router;
