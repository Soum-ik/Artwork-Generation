# Artwork Mapping API

A Flask-based REST API service that provides AI-powered image generation and artwork mapping capabilities. This service integrates with Hugging Face Spaces for AI image generation and AWS S3 for storage, with support for Docker deployment and Azure App Runner.

## 🚀 Features

- **AI Image Generation**: Generate base images using Hugging Face Spaces integration
- **Artwork Mapping**: Map artwork onto generated base images with advanced computer vision
- **Image Processing**: Advanced image manipulation using OpenCV and PIL
- **Cloud Storage**: Automatic upload to AWS S3 with public URL generation
- **Docker Support**: Containerized deployment ready
- **Azure Integration**: Pre-configured for Azure App Runner deployment
- **Health Monitoring**: Built-in health check endpoints
- **CORS Enabled**: Cross-origin resource sharing for web applications

## 📋 Prerequisites

- Python 3.10 or higher
- Docker (optional, for containerized deployment)
- AWS account with S3 bucket
- Hugging Face account with API access
- Azure account (for cloud deployment)

## 🛠️ Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd python-backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env  # Create from template
   # Edit .env with your configuration
   ```

### Docker Deployment

1. **Build the image**
   ```bash
   docker build -t artwork-mapping-api .
   ```

2. **Run the container**
   ```bash
   docker run -p 5000:5000 --env-file .env artwork-mapping-api
   ```

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Hugging Face Configuration
GRADIO_HF_SPACE_NAME=your-huggingface-space-name
HF_TOKEN=your-huggingface-api-token

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-s3-bucket-name

# Application Configuration
PORT=5000
FLASK_ENV=production
```

### Environment Variable Details

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GRADIO_HF_SPACE_NAME` | Hugging Face Space name for image generation | Yes | - |
| `HF_TOKEN` | Hugging Face API token | Yes | - |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 | Yes | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for S3 | Yes | - |
| `AWS_REGION` | AWS region for S3 bucket | Yes | - |
| `AWS_BUCKET_NAME` | S3 bucket name for file storage | Yes | - |
| `PORT` | Application port | No | 5000 |

## 📡 API Endpoints

### Health Check

**GET** `/health`

Returns the health status of the API service.

**Response:**
```json
{
  "status": "healthy",
  "service": "artwork-mapping-api",
  "version": "1.0.0"
}
```

### Generate Base Image

**POST** `/api/v1/generate-base-image`

Generates a base image using AI with a predefined prompt for crumpled paper texture.

**Response:**
```json
{
  "base64Image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "prompt": "crumpled white paper texture, top-down view, soft shadows, folds, wrinkles, high detail, realistic texture, neutral background",
  "timeTaken": "3.45 seconds"
}
```

### Map Artwork

**POST** `/api/v1/map-artwork`

Maps artwork onto a base image with advanced image processing and uploads the result to S3.

**Request Body:**
```json
{
  "baseImageUrl": "https://example.com/base-image.png",
  "artworkUrl": "https://example.com/artwork.png",
  "rotation": 15
}
```

**Parameters:**
- `baseImageUrl` (string, required): URL of the base image
- `artworkUrl` (string, required): URL of the artwork to map
- `rotation` (number, optional): Rotation angle in degrees (default: 0)

**Response:**
```json
{
  "s3Url": "https://your-bucket.s3.amazonaws.com/artwork-testing/filename.png",
  "timeTaken": "2.87 seconds"
}
```

## 🎨 Image Processing Features

### Base Image Generation
- Uses Hugging Face Spaces for AI-powered image generation
- Predefined prompts optimized for paper textures
- High-quality output with realistic lighting and shadows

### Artwork Mapping
- **Intelligent Resizing**: Automatically scales artwork to fit base image
- **Rotation Support**: Apply custom rotation angles to artwork
- **Illumination Mapping**: Applies base image lighting to artwork for realistic integration
- **Vignette Effect**: Adds subtle edge darkening for professional appearance
- **Alpha Blending**: Smooth integration of artwork with base image

### Advanced Processing Pipeline
1. Image download and validation
2. Artwork resizing and positioning
3. Rotation transformation
4. Illumination mask application
5. Vignette effect application
6. S3 upload with public URL generation

## 🚀 Deployment

### Azure App Runner

The application includes pre-configured Azure deployment:

1. **GitHub Actions**: Automated CI/CD pipeline (`.github/workflows/azure-deploy.yml`)
2. **App Runner Config**: Azure-specific configuration (`apprunner.yaml`)
3. **Container Registry**: Builds and pushes to Azure Container Registry

**Deploy using Azure CLI:**
```bash
./deploy.sh  # Linux/Mac
./deploy.ps1  # Windows PowerShell
```

### Docker Deployment

**Production deployment:**
```bash
docker build -t artwork-mapping-api .
docker run -d \
  --name artwork-api \
  -p 5000:5000 \
  --env-file .env \
  artwork-mapping-api
```

### Local Development

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## 🧪 Testing

### Manual API Testing

**Test health endpoint:**
```bash
curl http://localhost:5000/health
```

**Test base image generation:**
```bash
curl -X POST http://localhost:5000/api/v1/generate-base-image \
  -H "Content-Type: application/json"
```

**Test artwork mapping:**
```bash
curl -X POST http://localhost:5000/api/v1/map-artwork \
  -H "Content-Type: application/json" \
  -d '{
    "baseImageUrl": "https://example.com/base.png",
    "artworkUrl": "https://example.com/art.png",
    "rotation": 10
  }'
```

## 📁 Project Structure

```
python-backend/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── Dockerfile            # Container configuration
├── .dockerignore         # Docker ignore patterns
├── .gitignore           # Git ignore patterns
├── apprunner.yaml       # Azure App Runner config
├── deploy.sh            # Linux deployment script
├── deploy.ps1           # Windows deployment script
├── static/              # Static file serving
│   └── generated_images/ # Generated image storage
└── templates/           # HTML templates
    └── index.html       # Basic web interface
```

## 🔧 Dependencies

### Core Dependencies
- **Flask 2.0.3**: Web framework
- **Flask-CORS 5.0.0**: Cross-origin resource sharing
- **gradio-client 1.10.3**: Hugging Face Spaces integration
- **Pillow 11.2.1**: Image processing library
- **opencv-python**: Computer vision and image manipulation
- **boto3 1.34.84**: AWS SDK for S3 integration
- **python-dotenv 1.1.1**: Environment variable management

### System Dependencies (Docker)
- **gcc**: C compiler for native extensions
- **libgl1**: OpenGL library for OpenCV
- **libglib2.0-0**: GLib library
- **libsm6, libxext6, libxrender-dev**: X11 libraries for GUI support

## 🛡️ Security Considerations

- **Environment Variables**: Store sensitive data in `.env` file (never commit to repository)
- **CORS Configuration**: Configure appropriately for production domains
- **File Upload Validation**: API validates image formats and sizes
- **S3 Permissions**: Use IAM roles with minimal required permissions
- **Error Handling**: Sensitive information is not exposed in error messages

## 📊 Performance

### Optimization Features
- **Temporary File Cleanup**: Automatic cleanup of processed images
- **Image Format Optimization**: PNG output for quality, WebP support available
- **Memory Management**: Efficient handling of large images
- **Async Processing**: Non-blocking image operations where possible

### Expected Performance
- **Base Image Generation**: 2-5 seconds (depends on Hugging Face Space)
- **Artwork Mapping**: 1-3 seconds for typical image sizes
- **S3 Upload**: 1-2 seconds depending on image size and network
 