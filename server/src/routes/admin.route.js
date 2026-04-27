import { Router } from "express";
import { adminOnly, protectRoute } from "../middlewares/auth.middleware.js";
import {
  createNews,
  createProduct,
  deleteAllNotifications,
  deleteNews,
  deleteNotification,
  deleteProduct,
  getAllCustomers,
  getAllNews,
  getAllOrders,
  getAllProducts,
  getCustomersWithStats,
  getDashboardStats,
  getNotifications,
  getRevenueExpenseChart,
  getUserOnlineStatus,
  markAsRead,
  updateNews,
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

// Kelola Berita
router.post("/news", upload.array("newsImages", 3), createNews);
router.get("/news", getAllNews);
router.put("/news/:id", upload.array("newsImages", 3), updateNews);
router.delete("/news/:id", deleteNews);

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
