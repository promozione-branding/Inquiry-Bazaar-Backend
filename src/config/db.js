import mongoose from "mongoose";
import dotenv from "dotenv";

const connectDB = async () => {
  dotenv.config();
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Name:", conn.connection.name);
    console.log("Host:", conn.connection.host);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;