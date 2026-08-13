import dotenv from "dotenv";
import dns from "dns";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

dotenv.config();

// FIX: Render's outbound networking can't route IPv6, but Node's default DNS
// resolution can still hand back an IPv6 address for hosts like Gmail's SMTP
// server — causing ENETUNREACH on every connection attempt (this is exactly
// what was breaking order/payment confirmation emails). Forcing IPv4-first
// resolution app-wide fixes it without touching individual services.
dns.setDefaultResultOrder("ipv4first");

// Connect DB first, then start server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
};
startServer();