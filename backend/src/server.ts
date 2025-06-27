import mongoose from 'mongoose';
import { MONGO_URI, PORT } from './config/config';
import app from './index';

// Global error handlers to prevent server crashes
process.on('uncaughtException', (error: Error) => {
  console.error('🚨 UNCAUGHT EXCEPTION! Shutting down gracefully...');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Stack trace:', error.stack);
  
  // Give ongoing requests time to complete
  setTimeout(() => {
    console.error('🔄 Restarting process...');
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('🚨 UNHANDLED PROMISE REJECTION!');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  
  // Log the error but don't exit the process for unhandled rejections
  // This allows the server to continue running
  console.log('⚠️ Server continues running despite unhandled rejection');
});

// Graceful shutdown handler
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

let server: any;

function gracefulShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  if (server) {
    server.close(() => {
      console.log('✓ HTTP server closed');
      
      // Close database connection
      mongoose.connection.close();
      console.log('✓ MongoDB connection closed');
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

// Database Connection with retry logic
if (!MONGO_URI) {
  console.error('🚨 FATAL ERROR: MONGO_URI is not defined.');
  process.exit(1);
}

const connectWithRetry = () => {
  if (!MONGO_URI) {
    console.error('🚨 FATAL ERROR: MONGO_URI is not defined.');
    process.exit(1);
  }
  
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('✅ MongoDB connected successfully.');
    })
    .catch(err => {
      console.error('❌ MongoDB connection error:', err.message);
      console.log('🔄 Retrying connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    });
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully.');
});

// Initialize database connection
connectWithRetry();

// Start the server with error handling
server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🕒 Started at: ${new Date().toISOString()}`);
});

// Handle server startup errors
server.on('error', (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  switch (error.code) {
    case 'EACCES':
      console.error(`🚨 ${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`🚨 ${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

export default server; 