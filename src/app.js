import express from "express";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
const app = express();

app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders/webhook", express.raw({ type: "*/*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;