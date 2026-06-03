import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

dotenv.config();

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