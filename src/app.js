import { configDotenv } from "dotenv";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import helmet from "helmet";
import cors from "cors";
import setupMiddlewares from "./middlewares/main.js";
const app = express();
configDotenv();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://tee-naturals.vercel.app"],
    credentials: true,
  }),
);
setupMiddlewares(app);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders/webhook", express.raw({ type: "*/*" }));

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;