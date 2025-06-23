import jwt from "jsonwebtoken";

export const verifyToken = {
  required: (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  },

  optional: (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next(); // Proceed as guest

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Now `req.user` is available if valid token
    } catch (error) {
      // Ignore invalid token, treat as guest
    }
    next();
  },
};
