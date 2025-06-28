# Technical Overview - Artwork Mapping System

## System Architecture

The Artwork Mapping Application is a full-stack solution that combines traditional web development with cutting-edge AI technology to create realistic paper texture effects on digital artwork.

### Architecture Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Node.js        │    │   Python AI     │
│   (React/Next)  │◄──►│   Backend        │◄──►│   Backend       │
│                 │    │   (Express)      │    │   (Flask)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌──────────────────┐    ┌─────────────────┐
         │              │   MongoDB        │    │  Hugging Face   │
         │              │   Database       │    │  AI Services    │
         │              └──────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│   AWS S3        │    │   File Storage   │
│   Cloud Storage │    │   (Temporary)    │
└─────────────────┘    └──────────────────┘
```

---

## Core Technologies

### Backend Stack (Node.js)
- **Framework**: Express.js 5.x with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **File Handling**: Multer for multipart uploads
- **Cloud Storage**: AWS S3 SDK
- **Security**: Helmet, CORS, Rate Limiting

### AI Processing Stack (Python)
- **Framework**: Flask for REST API
- **AI Integration**: Gradio Client for Hugging Face Spaces
- **Image Processing**: OpenCV, PIL, NumPy
- **Cloud Integration**: Boto3 for AWS S3

### Infrastructure
- **Deployment**: Azure Web Apps, Docker containers
- **Storage**: AWS S3 for persistent file storage
- **CI/CD**: GitHub Actions with Azure integration

---

## Data Flow

### 1. User Authentication Flow
```
User Registration/Login → JWT Token Generation → Token Validation → Authorized Access
```

### 2. Artwork Upload Flow
```
File Upload → Validation → S3 Storage → Database Record → Base Image Check
     ↓
Base Image Exists? 
     ├─ Yes → Use Existing
     └─ No → Generate via AI → Store Result
```

### 3. AI Processing Flow
```
Python API Call → Hugging Face Integration → Image Generation → S3 Upload → URL Return
```

### 4. Artwork Mapping Flow
```
Download Images → Resize & Prepare → Apply Transformations → Blend Effects → Upload Result
```

---

## Key Features

### Robust Error Handling
- **Graceful Degradation**: System continues operation even if AI services fail
- **Fallback Mechanisms**: Pre-generated images used when AI unavailable
- **Automatic Cleanup**: Temporary files always removed
- **Process Recovery**: Database connections auto-retry with exponential backoff


---

## API Integration Details

### Hugging Face Integration
- **Service Type**: Gradio Spaces via Client API
- **Authentication**: HF_TOKEN environment variable
- **Model Access**: Custom space for paper texture generation
- **Timeout Handling**: 30-second request limits
- **Error Recovery**: Automatic fallback to cached images

### AWS S3 Integration
- **SDK Version**: AWS SDK v3 for JavaScript/Python
- **Bucket Structure**: Organized by user and file type
- **Access Control**: Public read for generated images


---

## Development Workflow

### Local Development
```bash
# Backend Development
cd backend
npm install
npm run dev

# Python AI Service
cd python-backend
pip install -r requirements.txt
python app.py

# Frontend Development
cd frontend
npm install
npm run dev
```

### Deployment Pipeline
```
Code Push → GitHub Actions → Docker Build → Azure Deployment → Health Check
```

---


## Technical Specifications

### System Requirements
**Development Environment:**
- Node.js 18+ with TypeScript 5+
- Python 3.8+ with pip package manager
- MongoDB 5.0+ (local or cloud)
- AWS CLI configured with credentials

**Production Environment:**
- Azure Web Apps or similar PaaS
- MongoDB Atlas or managed database
- AWS S3 bucket with appropriate permissions
- Environment variables properly configured

### Configuration Management
**Environment Variables:**
```bash
# Essential Configuration
MONGO_URI=mongodb://connection-string
JWT_SECRET=secure-random-string
AWS_ACCESS_KEY_ID=aws-key
AWS_SECRET_ACCESS_KEY=aws-secret
AWS_BUCKET_NAME=storage-bucket
HF_TOKEN=huggingface-token
GRADIO_HF_SPACE_NAME=username/space-name
```
