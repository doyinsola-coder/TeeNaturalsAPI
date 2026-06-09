import express from "express";
import { createOrder, paystackWebhook } from "../controllers/orderController.js";
import { adminOnly, protect } from "../middlewares/authMiddlewares.js";
import { initializePayment, verifyPayment, getMyOrders } from "../controllers/orderController.js";


const router = express.Router();

router.post("/webhook", express.raw({ type: "application/json" }), paystackWebhook);
router.post("/", protect, createOrder);
router.post("/pay", protect, initializePayment);
router.get("/verify/:reference", verifyPayment);
router.get("/my", protect, getMyOrders);
export default router;  