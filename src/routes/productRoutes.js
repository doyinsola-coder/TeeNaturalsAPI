import express from "express";
import { createProduct, getProducts } from "../controllers/productController.js";
import { protect, adminOnly } from "../middlewares/authMiddlewares.js";
import { updateProduct, deleteProduct } from "../controllers/productController.js";

const router = express.Router();



router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);
router.post("/", protect, adminOnly, createProduct);
router.get("/", getProducts);

export default router;