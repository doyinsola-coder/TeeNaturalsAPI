import { configDotenv } from "dotenv";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import setupMiddlewares from "./middlewares/main.js";
import { paystackWebhook } from "./controllers/orderController.js"; // Import directly here

const app = express();
configDotenv();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://tee-naturals-three.vercel.app", "https://tee-naturals.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// =========================================================================
// CRITICAL FIX: Intercept the webhook BEFORE setupMiddlewares parses JSON
// =========================================================================
app.post(
  "/api/orders/webhook", 
  express.raw({ type: "application/json" }), 
  paystackWebhook
);

// Now load your global JSON body parsing safely for all other routes
setupMiddlewares(app);

// Standard Operational Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes); // Make sure router.post("/webhook") is removed inside orderRoutes.js!
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;
