# API Documentation

## Table of Contents
- [Authentication Endpoints](#authentication-endpoints)
- [Upload Endpoints](#upload-endpoints)
- [User Endpoints](#user-endpoints)
- [Python Backend - AI Services](#python-backend---ai-services)
- [Error Handling](#error-handling)
- [Authentication](#authentication)

---

## Base URLs
- **Node.js Backend**: `http://localhost:3001/api`
- **Python Backend**: `https://test-load-huh2gzdze7dxaxd8.southeastasia-01.azurewebsites.net/api/v1`
- **Health Check**: `http://localhost:3001/health`

---

## Authentication Endpoints

### POST `/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f1b2b4c4f1a123456789ab",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `400`: User already exists
- `500`: Server error

---

### POST `/auth/login`
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f1b2b4c4f1a123456789ab",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `400`: Invalid credentials
- `500`: Server error

---

## Upload Endpoints

### POST `/upload/artwork`
Upload artwork and generate/retrieve base image for mapping.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
artwork: <file> (JPEG, JPG, PNG - Max 10MB)
```

**Response (201):**
```json
{
  "message": "Artwork and base image uploaded successfully",
  "upload": {
    "id": "60f1b2b4c4f1a123456789ab",
    "artworkUrl": "https://bucket.s3.region.amazonaws.com/artwork-123.jpg",
    "baseImageUrl": "https://bucket.s3.region.amazonaws.com/base-image-456.webp",
    "hasBaseImage": true,
    "usingFallback": false
  }
}
```

**Process Flow:**
1. Uploads original artwork to S3
2. Checks for existing base image in database
3. If no base image exists, generates one via Python API
4. Saves upload record to database
5. Returns URLs for both images

**Error Responses:**
- `400`: No file uploaded or user not authenticated
- `401`: Invalid/missing authentication token
- `500`: Upload or processing error

---
  
## User Endpoints

### GET `/user/uploads`
Retrieve all uploads for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
[
  {
    "_id": "60f1b2b4c4f1a123456789ab",
    "user": "60f1b2b4c4f1a123456789aa",
    "originalFilePath": "https://bucket.s3.region.amazonaws.com/artwork-123.jpg",
    "baseImagePath": "https://bucket.s3.region.amazonaws.com/base-image-456.webp",
    "prompt": "optional prompt text",
    "createdAt": "2023-07-15T10:30:00.000Z",
    "updatedAt": "2023-07-15T10:30:00.000Z"
  }
]
```

**Error Responses:**
- `401`: User not authenticated
- `500`: Server error


## Python Backend - AI Services

### GET `/health`
Health check for Python service.

**Response (200):**
```json
{
  "status": "healthy",
  "service": "artwork-mapping-api",
  "version": "1.0.0"
}
```

---

### POST `/generate-base-image`
Generate a base crumpled paper texture image using Hugging Face AI.

**Request Body:**
```json
{}
```

**Response (200):**
```json
{
  "base64Image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "prompt": "crumpled white paper texture, top-down view, soft shadows, folds, wrinkles, high detail, realistic texture, neutral background",
  "timeTaken": "12.34 seconds"
}
```

**AI Configuration:**
- **Model**: Uses Hugging Face Spaces via Gradio Client
- **Prompt**: Pre-defined paper texture prompt
- **Negative Prompt**: Quality control parameters
- **Timeout**: 30 seconds

**Error Responses:**
- `500`: AI service unavailable or configuration error

---

### POST `/map-artwork`
Map artwork onto base image with realistic paper texture effects.

**Request Body:**
```json
{
  "baseImageUrl": "https://bucket.s3.region.amazonaws.com/base-image.webp",
  "artworkUrl": "https://bucket.s3.region.amazonaws.com/artwork.jpg",
  "rotation": 15
}
```

**Response (200):**
```json
{
  "s3Url": "https://bucket.s3.region.amazonaws.com/artwork-testing/mapped-result.png",
  "timeTaken": "8.45 seconds"
}
```

**Processing Steps:**
1. Downloads images from provided URLs
2. Resizes artwork to match base image dimensions
3. Applies rotation transformation
4. Blends artwork with base image using alpha compositing
5. Applies illumination mapping based on paper texture
6. Adds vignette effect for realism
7. Uploads result to S3

**Parameters:**
- `baseImageUrl`: URL of the base paper texture image
- `artworkUrl`: URL of the artwork to be mapped
- `rotation`: Rotation angle in degrees (optional, default: 0)

**Error Responses:**
- `400`: Missing required URLs
- `500`: Image processing or upload error

---

## Error Handling

### Standard Error Response Format
```json
{
  "message": "Error description",
  "timestamp": "2023-07-15T10:30:00.000Z",
  "error": "Detailed error message (development only)"
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created successfully
- **400**: Bad request (validation error)
- **401**: Unauthorized (authentication required)
- **404**: Resource not found
- **500**: Internal server error

### Graceful Degradation
The system implements graceful degradation for AI services:
- If base image generation fails, uses existing user base image
- If no existing base image, uses fallback URL
- Upload process continues even if AI services are unavailable
- All temporary files are cleaned up regardless of success/failure

---

## Authentication

### JWT Token Usage
Include the JWT token in the Authorization header for protected endpoints:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Lifecycle
- **Expiration**: 1 day
- **Storage**: Client-side (localStorage/sessionStorage)
- **Refresh**: Re-login required after expiration

### Protected Endpoints
All endpoints under `/upload/*` and `/user/*` require authentication.

---

## Rate Limiting & File Restrictions

### Upload Limits
- **File Size**: 10MB maximum
- **File Types**: JPEG, JPG, PNG only
- **Request Size**: 50MB (including JSON payload)

### AI Service Timeouts
- **Base Image Generation**: 30 seconds
- **Artwork Mapping**: No specific timeout (depends on image size)

---

## Environment Configuration

### Required Environment Variables
```bash
# Node.js Backend
MONGO_URI=mongodb://localhost:27017/artwork-db
PORT=3001
JWT_SECRET=your-jwt-secret
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=your-aws-region
AWS_BUCKET_NAME=your-s3-bucket

# Python Backend
GRADIO_HF_SPACE_NAME=your-huggingface-space
HF_TOKEN=your-huggingface-token
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=your-aws-region
AWS_BUCKET_NAME=your-s3-bucket
``` 