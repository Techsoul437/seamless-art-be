import jwt from "jsonwebtoken";
import User from "../models/userModel.js"; 

export const verifyToken = {
  required: async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.status === "suspended") {
        return res.status(403).json({
          message: "Your account has been suspended. Contact support.",
        });
      }

      req.user = user; 
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  },

  optional: async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next();

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user && user.status !== "suspended") {
        req.user = user;
      }
    } catch (error) {
    }
    next();
  },
};
