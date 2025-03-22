import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import config from './config';
import connectDB, { mockDB } from './config/db';
import { testSupabaseConnection } from './config/supabase'; 
import routes from './routes';
import errorHandler from './middleware/errorHandler';
import initMockData from './utils/mockDbInit';

// Create Express application
const app = express();

// Setup database connection
const setupDatabase = async () => {
  try {
    console.log('Attempting to connect to database...');
    
    if (config.useSupabase) {
      console.log('Using Supabase as the database');
      const connected = await testSupabaseConnection();
      
      if (!connected && config.isProd) {
        console.error('Could not connect to Supabase in production mode. Exiting...');
        process.exit(1);
      }
      
      if (!connected) {
        console.warn('Using mock database as fallback since Supabase connection failed');
        await initMockData();
      }
    } else if (config.useMongoDB) {
      const db = await connectDB();
      
      if (db === mockDB) {
        console.log('Using mock database. Initializing mock data...');
        // Initialize mock data if using in-memory database
        await initMockData();
        console.log('Mock data initialized successfully');
        console.log(`Mock users: ${mockDB.users.length}`);
        console.log(`Mock users: ${mockDB.users.map(u => u.email).join(', ')}`);
      } else {
        console.log('Connected to MongoDB successfully');
      }
    } else {
      console.log('No database configured. Using mock database...');
      await initMockData();
    }
  } catch (error) {
    console.error('Database setup error:', error);
    if (config.isProd) {
      process.exit(1);
    }
    
    // Fallback to mock database
    console.log('Using mock database due to error');
    await initMockData();
  }
};

// Initialize database
setupDatabase().then(() => {
  console.log('Database setup complete');
});

// Create upload directories if they don't exist
const uploadDirs = ['uploads', 'uploads/profiles', 'uploads/events', 'uploads/posts'];
uploadDirs.forEach((dir) => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.isProd ? 'combined' : 'dev'));

// Log request details in development
if (!config.isProd) {
  app.use((req, res, next) => {
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(`Request body for ${req.method} ${req.path}:`, req.body);
    }
    next();
  });
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount routes
app.use(routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    environment: config.nodeEnv,
    database: config.useSupabase 
      ? 'Supabase' 
      : (mockDB.users.length > 0 ? 'mock database' : 'MongoDB'),
    mockUsers: mockDB.users.length
  });
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`Access the API at http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  
  if (config.useSupabase) {
    console.log('Using Supabase as the database');
  } else if (mockDB.users.length > 0) {
    console.log(`Mock database initialized with ${mockDB.users.length} users`);
    console.log('Test user credentials: alice@example.com / password123');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't crash in production
  if (!config.isProd) {
    process.exit(1);
  }
});

export default app; 