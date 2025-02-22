import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable inside .env.local");
}

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log("Already connected to the database.");
      return;
    }
    mongoose.set("strictQuery", true);
    await mongoose.connect(MONGO_URI);

    console.log("Database connected");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
};
