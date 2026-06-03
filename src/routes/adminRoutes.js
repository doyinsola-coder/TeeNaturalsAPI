import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddlewares.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const router = express.Router();


// ====================== USERS ======================

// Get all users
router.get("/users", protect, adminOnly, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});


// ====================== PRODUCTS ======================

// Update product
router.put("/products/:id", protect, adminOnly, async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updated);
});

// Delete product
router.delete("/products/:id", protect, adminOnly, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
});


// ====================== ORDERS ======================

// Get all orders
router.get("/orders", protect, adminOnly, async (req, res) => {
  const orders = await Order.find().populate("user", "name email");
  res.json(orders);
});

// Update order status
router.put("/orders/:id", protect, adminOnly, async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = req.body.status || order.status;
  await order.save();

  res.json(order);
});

export default router;