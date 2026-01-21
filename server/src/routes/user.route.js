import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  addAddress,
  addToWishlist,
  deleteAddress,
  getAddress,
  getWishlist,
  pingUser,
  removeFromWishlist,
  updateAddress,
} from "../controllers/user.controller.js";

const router = Router();

router.use(protectRoute);
router.post("/ping", pingUser);

// Kelola Alamat
router.post("/addresses", addAddress);
router.get("/addresses", getAddress);
router.post("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);

// Kelola Wishlist
router.post("/wishlist", addToWishlist);
router.get("/wishlist", getWishlist);
router.delete("/wishlist/:productId", removeFromWishlist);

export default router;
