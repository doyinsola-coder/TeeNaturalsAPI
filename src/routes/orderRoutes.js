import express from "express";
import { createOrder, paystackWebhook, deleteOrder } from "../controllers/orderController.js";
import { adminOnly, protect } from "../middlewares/authMiddlewares.js";
import { initializePayment, verifyPayment, getMyOrders } from "../controllers/orderController.js";


const router = express.Router();

router.post("/webhook", express.raw({ type: "application/json" }), paystackWebhook);
router.post("/", protect, createOrder);
router.post("/pay", protect, initializePayment);
router.get("/verify/:reference", verifyPayment);
router.get("/my", protect, getMyOrders);
router.delete("/:id", protect, deleteOrder);
export default router;  