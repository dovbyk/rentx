import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  if (!MONGO_URI) {
    console.error('FATAL: MONGO_URI is not defined in the environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`[MONGO] MongoDB Connected: ${conn.connection.host}`);
    
  } catch (error) {
    console.error('[ERROR] Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
