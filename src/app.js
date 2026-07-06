import { configDotenv } from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet"; // If using, ensure it doesn't conflict
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import setupMiddlewares from "./middlewares/main.js";

const app = express();
configDotenv();


app.use(
  cors({
    origin: ["http://localhost:5173", "https://tee-naturals-three.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use("/api/orders/webhook", express.raw({ type: "*/*" }));


setupMiddlewares(app);

// 4. Standard Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;