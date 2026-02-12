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
import {
  createCategory,
  createType,
  deleteCategory,
  deleteType,
  getAllCategories,
  getAllTypes,
  updateCategory,
  updateType,
} from "../controllers/categoryType.controller.js";

const router = Router();

router.use(protectRoute, adminOnly);

// Kelola Produk
router.post("/products", upload.array("images", 3), createProduct);
router.get("/products", getAllProducts);
router.put("/products/:id", upload.array("images", 3), updateProduct);
router.delete("/products/:id", deleteProduct);

// Kelola Kategori
router.post("/categories", createCategory);
router.get("/categories", getAllCategories);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// Kelola Tipe
router.post("/types", createType);
router.get("/types", getAllTypes);
router.put("/types/:id", updateType);
router.delete("/types/:id", deleteType);

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
