import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  const MONGOURL =
    process.env.MONGO_URL ||
    "mongodb+srv://seamless-art:3o7E5DZ3QYUfAizf@seamless-cluster.jttnobm.mongodb.net/seamless-art";

  try {
    await mongoose.connect(MONGOURL);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
