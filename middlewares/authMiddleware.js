// import jwt from "jsonwebtoken";
// import User from "../models/userModel.js"; 

// export const verifyToken = {
//   required: async (req, res, next) => {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ message: "Unauthorized" });

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(decoded.userId);

//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }

//       if (user.status === "suspended") {
//         return res.status(403).json({
//           message: "Your account has been suspended. Contact support.",
//         });
//       }

//       req.user = user; 
//       next();
//     } catch (error) {
//       return res.status(401).json({ message: "Invalid or expired token" });
//     }
//   },

//   optional: async (req, res, next) => {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return next();

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(decoded.userId);
//       if (user && user.status !== "suspended") {
//         req.user = user;
//       }
//     } catch (error) {
//     }
//     next();
//   },
// };


import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const verifyToken = {
  required: async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No authorization header" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // We ONLY use decoded.id
      const userId = decoded.id;

      if (!userId) {
        return res.status(401).json({ message: "Invalid token structure" });
      }

      const user = await User.findById(userId);

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
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }

      return res.status(401).json({ message: "Invalid or expired token" });
    }
  },

  optional: async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next();

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const userId = decoded.id;
      if (userId) {
        const user = await User.findById(userId);
        if (user && user.status !== "suspended") {
          req.user = user;
        }
      }
    } catch {}
    next();
  },
};
