import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  
  // Database configuration
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/outdoorwomen',
  
  // Supabase configuration
  supabaseUrl: process.env.SUPABASE_URL || 'https://nijnwsqpjcbmzydshzbm.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  
  // JWT settings
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Server settings
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  uploadPath: process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads'),
  isProd: process.env.NODE_ENV === 'production',
  
  // Database type
  useSupabase: process.env.USE_SUPABASE === 'true' || true,
  useMongoDB: process.env.USE_MONGODB === 'true' || false,
};

export default config; 