# User Guide - Artwork Mapping Application

## Table of Contents
- [Getting Started](#getting-started)
- [Account Setup](#account-setup)
- [Uploading Artwork](#uploading-artwork)
- [Understanding the Mapping Process](#understanding-the-mapping-process)
- [Adjusting Mapping Parameters](#adjusting-mapping-parameters)
- [3D Visualization Module](#3d-visualization-module)
- [Managing Your Uploads](#managing-your-uploads)
- [Troubleshooting](#troubleshooting)
- [Tips for Best Results](#tips-for-best-results)

---

## Getting Started

The Artwork Mapping Application allows you to transform your digital artwork into realistic paper textures, making them appear as if they're printed on crumpled paper. The application uses advanced AI technology to create stunning visual effects.

### What You'll Need
- A web browser (Chrome, Firefox, Safari, Edge)
- Digital artwork files (JPEG, JPG, or PNG format)
- An internet connection
- An email address for account creation

---

## Account Setup

### Creating Your Account

1. **Navigate to the Signup Page**
   - Open your web browser and go to the application
   - Click on "Sign Up" or "Create Account"

2. **Enter Your Information**
   ```
   Email: your-email@example.com
   Password: Choose a secure password (minimum 6 characters)
   ```

3. **Confirm Your Account**
   - Click "Create Account"
   - You'll receive a JWT token for authentication
   - Keep this token secure - you'll need it for all uploads

### Logging In

1. **Access the Login Page**
   - Click "Login" on the homepage
   - Enter your registered email and password

2. **Authentication Success**
   - Upon successful login, you'll receive an authentication token
   - This token expires after 24 hours
   - You'll be redirected to the upload dashboard

---

## Uploading Artwork

### Supported File Types
- **JPEG/JPG**: Best for photographs and complex artwork
- **PNG**: Best for artwork with transparency or sharp edges
- **File Size Limit**: 10MB maximum per file

### Step-by-Step Upload Process

1. **Access the Upload Section**
   - Navigate to the "Upload"
   - Ensure you're logged in (you should see your email in the header)

2. **Select Your Artwork**
   - Click "Choose File" or drag and drop your image
   - Select a JPEG, JPG, or PNG file from your device
   - Preview will show your selected image

3. **Upload Process**
   - Click "Upload Artwork"
   - The system will automatically:
     - Upload your original artwork to cloud storage
     - Check if you have an existing base paper texture
     - Generate a new paper texture if needed (first upload)
     - Save the upload record to your account

4. **Upload Completion**
   - You'll see a success message with:
     - Your artwork URL
     - Base image URL
     - Upload timestamp
     - Unique upload ID

### What Happens During Upload

The application performs several steps automatically:


- **File Validation**: Checks file type and size
- **Cloud Upload**: Securely stores your artwork
- **Base Image Management**: Uses existing or generates new paper texture
- **AI Processing**: Creates realistic paper texture using Hugging Face AI
- **Record Keeping**: Saves upload history to your account

---

## Understanding the Mapping Process

### The Two-Stage Process

#### Stage 1: Base Image Generation (First Upload Only)
- **Purpose**: Creates a realistic crumpled paper texture
- **AI Model**: Uses Hugging Face Spaces via Gradio Client
- **Generation Time**: 8.9 - 12.3 seconds
- **Reuse**: Same base image used for future uploads
- **Fallback**: If AI fails, uses a pre-generated fallback image

#### Stage 2: Artwork Mapping (Every Upload)
The mapping process transforms your artwork onto the paper texture:

1. **Image Preparation**
   - Downloads your artwork and base image
   - Resizes artwork to match base dimensions
   - Prepares images for blending

2. **Transformation Effects**
   - **Rotation**: Applies realistic angle variations
   - **Alpha Blending**: Seamlessly combines artwork with paper
   - **Illumination Mapping**: Adds realistic lighting based on paper folds
   - **Vignette Effect**: Creates natural edge darkening

3. **Final Processing**
   - Saves the mapped result to cloud storage
   - Returns the final image URL
   - Processes typically take 5-15 seconds

---

## Adjusting Mapping Parameters

### Current Parameters

#### Rotation Angle
- **Range**: -180° to +180°
- **Default**: 0° (no rotation)
- **Effect**: Rotates your artwork on the paper surface
- **Recommendation**: Use subtle angles (5-15°) for natural appearance

```json
{
  "rotation": 15
}
```



## 3D Visualization Module

Bring your mapped artwork to life with an interactive 3D view powered by Three.js. This feature adds realistic depth, lighting, and shadow effects to simulate crumpled paper in a virtual scene.

### Access:
1. Complete your mapping
2. Click "View in 3D"
3. Interact with your textured artwork

### Tech:

1. Engine: Three.js (WebGL)
2. Formats: GLTF, OBJ, STL, MP4
3. Compatible: Chrome, Firefox, Safari, Edge

### Viewing Upload History

1. **Access Your Uploads**
   - Navigate to "My Uploads" or "Dashboard"
   - View chronological list of your artwork


### Managing Storage

- **Automatic Storage**: All uploads saved to AWS S3
- **Persistent Links**: URLs remain accessible indefinitely
- **No Manual Deletion**: Contact support to remove uploads
- **Privacy**: Only you can access your upload URLs

---

## Troubleshooting

### Common Upload Issues

#### "Server error during upload" 
- **Cause**: Temporary service issue
- **Solution**: Wait 1-2 minutes and retry
- **If persistent**: Check file size and format

### AI Service Issues

#### Base Image Generation Fails
- **System Response**: Uses fallback base image
- **User Impact**: Upload still succeeds
- **Quality**: Fallback provides good results
- **Retry**: Generate new base on next upload

#### Slow Processing
- **Normal Range**: 10-30 seconds for base generation
- **Network Factors**: Internet speed affects download/upload
- **Server Load**: Peak times may slow processing
- **Patience**: Allow up to 60 seconds for completion


---

 
### Best Practices Summary
1. **Prepare artwork** in supported formats (JPEG, JPG, PNG)
2. **Keep files under 10MB** for optimal performance
3. **Log in regularly** to maintain authentication
4. **Be patient** during first upload (base image generation)
5. **Use high-quality images** for best texture mapping results
6. **Experiment with different artwork styles** to explore possibilities

---

*This user guide covers the core functionality of the Artwork Mapping Application. For technical details, refer to the API Documentation. For additional features or support, contact the development team.* 