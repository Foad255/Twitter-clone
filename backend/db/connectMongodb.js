import mongoose from "mongoose";

const connectMongodb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.log('Error with Database connection:', err);
    process.exit(1);
  }
};

export default connectMongodb;
