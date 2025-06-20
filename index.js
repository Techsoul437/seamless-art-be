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

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.urlencoded({ extended: false }));
dotenv.config();
const PORT = process.env.PORT || 8000;
const MONGOURL =
  process.env.MONGO_URL ||
  "mongodb+srv://seamless-art:3o7E5DZ3QYUfAizf@seamless-cluster.jttnobm.mongodb.net/seamless-art";

app.use("/upload", imageRoutes);
app.use("/category", categoryRoutes);
app.use("/productType", productTypeRoutes);
app.use("/product", productRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("TechSoul's backend is up and running!");
});

mongoose
  .connect(MONGOURL)
  .then(() => {
    console.log("✅ Database Connected Successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database Connection Error:", err);
    process.exit(1);
  });

export default app;
