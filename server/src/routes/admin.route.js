import { Router } from "express";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";
import {
  createProduct,
  deleteAllNotifications,
  deleteNotification,
  deleteProduct,
  getAllCustomers,
  getAllOrders,
  getAllProducts,
  getCustomersWithStats,
  getDashboardStats,
  getNotifications,
  getRevenueExpenseChart,
  getUserOnlineStatus,
  markAsRead,
  updateOrderStatus,
  updateProduct,
} from "../controllers/admin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(protectRoute, adminOnly);

// Kelola Notifikasi
router.get("/notification", getNotifications);
router.put("/notification/:notificationId/read", markAsRead);
router.delete("/notification/:notificationId", deleteNotification);
router.delete("/notification", deleteAllNotifications);

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
