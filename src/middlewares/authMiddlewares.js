import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect routes (logged-in users only)
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
      
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      next();
    } else {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Admin only
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Admin access only" });
  }
};