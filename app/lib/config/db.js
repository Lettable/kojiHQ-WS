import mongoose from "mongoose";

const MONGO_URI = 'mongodb+srv://pythoncux:pythoncux@cluster0.tl7krxg.mongodb.net/KojiHQ'

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
