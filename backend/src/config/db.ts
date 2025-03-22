import mongoose from 'mongoose';
import config from './index';

// Mock data in memory if unable to connect to MongoDB
let mockDB = {
  users: [],
  events: [],
  posts: [],
  trails: []
};

const connectDB = async (): Promise<any> => {
  try {
    // Try to connect to MongoDB
    const conn = await mongoose.connect(config.mongodbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`MongoDB connection failed: ${error instanceof Error ? error.message : String(error)}`);
    console.log('Using in-memory mock database instead');
    
    // Don't exit on connection failure in development
    if (config.isProd) {
      process.exit(1);
    }
    
    // Return the mock DB for development
    return mockDB;
  }
};

export default connectDB;
export { mockDB }; 