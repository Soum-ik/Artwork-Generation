# Artwork Mapping Application

A sophisticated full-stack application that transforms digital artwork into realistic paper textures using advanced AI technology. The system combines traditional web development with cutting-edge artificial intelligence to create stunning visual effects that make digital art appear as if it's printed on crumpled paper.

- **AI-Generated Paper Textures**: Uses Hugging Face AI models to create realistic crumpled paper backgrounds
- **Intelligent Image Mapping**: Advanced computer vision algorithms blend artwork with paper textures
- **Realistic Effects**: Illumination mapping, and rotation for authentic appearance
- **Cloud Processing**: Scalable architecture with AWS S3 and Azure deployment

## 📚 Documentation

This project includes comprehensive documentation designed for different audiences:

### 📖 For Users
- **[User Guide](USER_GUIDE.md)** - Complete instructions for using the application
  - Account setup and authentication
  - Step-by-step artwork upload process
  - Understanding mapping parameters

### 🔧 For Developers
- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
  - Authentication endpoints
  - Upload and processing endpoints
  - Python AI service integration
  - Error handling and responses
  - Environment configuration

- **[Technical Overview](TECHNICAL_OVERVIEW.md)** - System architecture and design
  - Architecture components and data flow
  - Technology stack details
  - Performance characteristics
  - Security considerations
  - Deployment and monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ with npm/yarn
- Python 3.8+ with pip
- MongoDB (local or cloud)
- AWS S3 bucket access
- Hugging Face account with API token

### Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd artwork-mapping-app
   ```

2. **Setup Backend (Node.js)**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run dev
   ```

3. **Setup AI Service (Python)**
   ```bash
   cd python-backend
   pip install -r requirements.txt
   cp .env.example .env  # Configure your environment variables
   python app.py
   ```

4. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Environment Configuration

Create `.env` files in both `backend/` and `python-backend/` directories:

```bash
# Essential Variables
MONGO_URI=mongodb://localhost:27017/artwork-db
JWT_SECRET=your-secure-jwt-secret
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_BUCKET_NAME=your-s3-bucket-name
AWS_REGION=your-aws-region
HF_TOKEN=your-huggingface-token
GRADIO_HF_SPACE_NAME=your-huggingface-space
```

## 🏗️ System Architecture

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

## 🛠️ Technology Stack

### Backend Technologies
- **Node.js + TypeScript**: Modern server-side JavaScript with type safety
- **Express.js 5.x**: Web application framework
- **MongoDB + Mongoose**: NoSQL database with ODM
- **JWT + bcrypt**: Secure authentication system
- **AWS S3 SDK**: Cloud file storage
- **Multer**: File upload handling

### AI Processing
- **Python + Flask**: Lightweight web framework for AI services
- **Hugging Face Integration**: Access to state-of-the-art AI models
- **OpenCV + PIL**: Advanced image processing
- **NumPy**: Numerical computing for image manipulation

### Infrastructure
- **Azure Web Apps**: Cloud application hosting
- **GitHub Actions**: CI/CD pipeline
- **Docker**: Containerized deployment
- **AWS S3**: Scalable object storage

## ✨ Key Features

 

### 🎯 Intelligent Processing
- **Graceful Degradation**: System continues working even if AI services fail
- **Automatic Fallbacks**: Uses pre-generated images when needed
- **Error Recovery**: Database auto-retry with exponential backoff
- **Resource Cleanup**: Temporary files always cleaned up


## 📊 Performance Metrics

- **Authentication**: < 100ms response time
- **File Upload**: 1-5 seconds (depends on file size)
- **Base Image Generation**: 10-30 seconds (first time only)
- **Artwork Mapping**: 5-15 seconds typical processing
- **Database Queries**: < 50ms average response

## 🔄 Deployment
- Containerize the application using Docker.
- Push the Docker image to the Azure Container Registry (ACR).
- Create an App Service in Azure.
- Deploy the container by connecting the App Service to the image stored in ACR.

## 📋 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User authentication

### Artwork Processing
- `POST /api/upload/artwork` - Upload and process artwork
- `GET /api/user/uploads` - Retrieve user's upload history

### AI Services (Python Backend)
- `POST /api/v1/generate-base-image` - Generate paper texture
- `POST /api/v1/map-artwork` - Map artwork to paper texture

### System Monitoring
- `GET /health` - Comprehensive system health check


## 🙏 Acknowledgments

- **Hugging Face** for providing access to state-of-the-art AI models
- **OpenCV Community** for powerful image processing tools
- **MongoDB** for flexible document database
- **AWS** for reliable cloud infrastructure
- **Azure** for deployment platform

---

## 📞 Support

For technical support or questions:
- Check the [User Guide](USER_GUIDE.md) for usage instructions
- Review [API Documentation](API_DOCUMENTATION.md) for integration details
- Read [Technical Overview](TECHNICAL_OVERVIEW.md) for architecture insights
