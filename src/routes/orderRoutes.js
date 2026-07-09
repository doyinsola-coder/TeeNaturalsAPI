import express from "express";
import { protect } from "../middlewares/authMiddlewares.js";
import { 
  createOrder, 
  paystackWebhook, 
  deleteOrder, 
  initializePayment, 
  verifyPayment, 
  getMyOrders 
} from "../controllers/orderController.js";

const router = express.Router();

// CRITICAL: The webhook endpoint MUST receive raw data to verify the cryptographic signature
router.post("/webhook", express.raw({ type: "application/json" }), paystackWebhook);

// Protected shopping paths
router.post("/", protect, createOrder);
router.post("/pay", protect, initializePayment);
router.get("/verify/:reference", verifyPayment);
router.get("/my", protect, getMyOrders);
router.delete("/:id", protect, deleteOrder);

export default router;
