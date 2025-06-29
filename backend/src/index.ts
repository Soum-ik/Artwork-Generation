import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import apiRoutes from './routes';
import { redisClient } from './redis/redisConnection';

const app: Express = express();

// Middleware
app.use(cors({
  origin: '*', // Allow frontend to connect
  credentials: true,
}));
app.use(helmet());
app.use(express.json({ limit: '50mb' })); // Increased limit for large files
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Backend server is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    status: 'healthy'
  });
});

(async () => {
  try {
    const pong = await redisClient.ping();
    console.log('Redis connected successfully:', pong);
  } catch (err) {
    console.error('Redis connection failed:', err);
  } finally {
    redisClient.disconnect();
  }
})();

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    platform: process.platform,
  };
  
  res.status(200).json(healthStatus);
});

// Enhanced Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  
  // Log the error details
  console.error(`[${timestamp}] 🚨 Server Error:`, {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    timestamp,
    ...(isDevelopment && { stack: err.stack }), // Only show stack in development
  });
});

// 404 handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

export default app; 