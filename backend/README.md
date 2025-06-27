# Backend Server

A robust Node.js/TypeScript backend server with comprehensive error handling and graceful degradation.

## Architecture

### File Structure
- **`server.ts`** - Server setup, database connection, global error handling, and process management
- **`index.ts`** - Application logic, middleware, routes, and request handling
- **`controllers/`** - Business logic and request handlers
- **`routes/`** - API route definitions
- **`models/`** - Database models and schemas
- **`middleware/`** - Custom middleware functions
- **`utils/`** - Utility functions and helpers
- **`config/`** - Configuration files

### Error Handling Strategy

The server implements multiple layers of error handling:

1. **Global Process Handlers** (in `server.ts`)
   - Uncaught exceptions
   - Unhandled promise rejections
   - Graceful shutdown on SIGTERM/SIGINT

2. **Application-Level Handlers** (in `index.ts`)
   - Express error middleware
   - 404 handlers
   - Request logging

3. **Controller-Level Handlers**
   - Try-catch blocks with graceful degradation
   - External service failure handling
   - Resource cleanup in finally blocks

## Features

### 🛡️ Error Resilience
- **Graceful Degradation**: Server continues running even if external services (like Python API) fail
- **Automatic Retry**: Database connections automatically retry with exponential backoff
- **Resource Cleanup**: Temporary files are always cleaned up, even on errors
- **Process Monitoring**: PM2 configuration with automatic restarts and logging

### 🔍 Monitoring & Logging
- **Health Check Endpoint**: `/health` provides server status and metrics
- **Request Logging**: All requests are logged with timestamps
- **Error Tracking**: Detailed error logs with context information
- **PM2 Logs**: Separate log files for errors, output, and combined logs

### 🚀 Performance
- **Connection Pooling**: MongoDB connection with automatic reconnection
- **Memory Limits**: PM2 configured with memory restart limits
- **File Size Limits**: Increased limits for artwork uploads (50MB)
- **Timeout Handling**: API calls have proper timeout configurations

## Running the Server

### Development
```bash
# Start with bun (recommended)
bun run dev

# Start with PM2 for production-like environment
pm2 start ecosystem.config.js

# Health check
curl http://localhost:3001/health
```

### Production
```bash
# Build the application
bun run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Monitor processes
pm2 monit

# View logs
pm2 logs backend
```

## Environment Variables

Required environment variables in `.env`:
```
MONGO_URI=mongodb://localhost:27017/artwork-db
PORT=3001
JWT_SECRET=your-jwt-secret
PYTHON_API_URL=http://192.168.1.50:5007/api/v1/generate-base-image
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=your-aws-region
AWS_BUCKET_NAME=your-s3-bucket
```

## API Endpoints

### Core Routes
- `GET /` - Server status
- `GET /health` - Detailed health check
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/upload/artwork` - Upload artwork with base image generation

### Error Handling
All endpoints return standardized error responses:
```json
{
  "message": "Error description",
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

## Troubleshooting

### Common Issues

1. **Server won't start**
   - Check if MongoDB is running
   - Verify environment variables are set
   - Check if port 3001 is available

2. **Database connection fails**
   - Server will automatically retry every 5 seconds
   - Check MongoDB URI and credentials
   - Ensure MongoDB service is running

3. **Python API failures**
   - Server continues running with graceful degradation
   - Base image generation will be skipped
   - Check Python backend logs in `/logs/python-backend-*.log`

4. **File upload issues**
   - Check disk space
   - Verify S3 credentials and bucket permissions
   - Review upload size limits

### Log Files
- `logs/backend-error.log` - Error messages only
- `logs/backend-out.log` - Standard output
- `logs/backend-combined.log` - All messages
- `logs/python-backend-*.log` - Python service logs

## Development Guidelines

### Adding New Routes
1. Create controller in `controllers/`
2. Add route definition in `routes/`
3. Include proper error handling with try-catch
4. Add request validation
5. Update this README with new endpoints

### Error Handling Best Practices
1. Always use try-catch in async functions
2. Log errors with context information
3. Clean up resources in finally blocks
4. Return user-friendly error messages
5. Don't expose internal error details in production

### Testing
```bash
# Health check
curl -f http://localhost:3001/health

# Upload test
curl -X POST -F "file=@test.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/upload/artwork
```