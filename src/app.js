import { configDotenv } from "dotenv";
import express from "express";
import cors from "cors";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
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


setupMiddlewares(app);

// Standard Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes); // Handled inside orderRoutes
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;
