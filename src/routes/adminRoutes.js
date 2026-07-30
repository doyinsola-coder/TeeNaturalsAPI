import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddlewares.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const router = express.Router();


// ====================== USERS ======================

// Get all users
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ====================== PRODUCTS ======================

// Update product
router.put("/products/:id", protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product
router.delete("/products/:id", protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ====================== ORDERS ======================

// Get all orders
router.get("/orders", protect, adminOnly, async (req, res) => {
  try {
    
    const orders = await Order.find().populate("user", "name email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.put("/orders/:id", protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // The schema's status enum is lowercase; the admin UI sends
    // "Processing" / "Shipped" / "Delivered" / "Cancelled", so normalize
    // before validating/saving to avoid a ValidationError crash.
    if (req.body.status) {
      const normalized = String(req.body.status).toLowerCase();
      const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
      if (!allowed.includes(normalized)) {
        return res.status(400).json({ message: `Invalid status: ${req.body.status}` });
      }
      order.status = normalized;
    }

    if (typeof req.body.isDelivered === "boolean") {
      order.isDelivered = req.body.isDelivered;
      order.deliveredAt = req.body.isDelivered
        ? (req.body.deliveredAt ? new Date(req.body.deliveredAt) : new Date())
        : undefined;
    }

    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;