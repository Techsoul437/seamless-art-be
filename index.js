import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import imageRoutes from "./routes/imageRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productTypeRoutes from "./routes/productTypeRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 8000;
const MONGOURL =
  process.env.MONGO_URL ||
  "mongodb+srv://seamless-art:3o7E5DZ3QYUfAizf@seamless-cluster.jttnobm.mongodb.net/seamless-art";

app.use("/upload", imageRoutes);
app.use("/category", categoryRoutes);
app.use("/productType", productTypeRoutes);
app.use("/product", productRoutes);
app.use("/auth", authRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/payment", paymentRoutes);
app.use("/user", userRoutes);
app.use("/admin/users", adminUserRoutes);
app.use("/checkout", checkoutRoutes);

app.get("/", (req, res) => {
  res.send("Seamless's backend is up and running!");
});

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    try {
      await mongoose.connect(MONGOURL);
      isConnected = true;
      console.log("✅ Database Connected");
    } catch (err) {
      console.error("❌ MongoDB connection error:", err);
      return res.status(500).send("Database connection failed");
    }
  }

  return app(req, res); 
}

// mongoose
//   .connect(MONGOURL)
//   .then(() => {
//     console.log("✅ Database Connected Successfully");
//     app.listen(PORT, () => {
//       console.log(`🚀 Server is running on port ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("❌ Database Connection Error:", err);
//     process.exit(1);
//   });

// export default app;
