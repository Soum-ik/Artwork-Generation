import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import Upload from '../models/Upload';
import { uploadFileToS3, uploadBufferToS3 } from '../utils/sendFiletoS3';
import axios from 'axios';
import fs from 'fs';

export const uploadArtwork = async (req: AuthRequest, res: Response): Promise<void> => {
  let tempFilePath: string | null = null;
  
  try {
    if (!req.file || !req.user) {
      res.status(400).json({ message: 'No file uploaded or user not authenticated.' });
      return;
    }

    const { path: uploadedFilePath, originalname } = req.file;
    tempFilePath = uploadedFilePath;

    // 1. Upload original artwork to S3
    let artworkS3Url = '';
    try {
      artworkS3Url = await uploadFileToS3(tempFilePath, `artwork-${Date.now()}-${originalname}`, 'public-read');
    } catch (s3Error) {
      throw new Error('Failed to upload original artwork to cloud storage');
    }

    // 2. Generate base image by calling Python API (with graceful degradation)
    let baseImageS3Url = '';
    try {
      const pythonApiUrl = process.env.PYTHON_API_URL || 'http://192.168.1.50:5007/api/v1/generate-base-image';
      console.log('→ Attempting to generate base image via Python API...');
      
      // Add timeout to prevent hanging
      const generationResponse = await axios.post(pythonApiUrl, {}, {
        timeout: 30000, // 30 seconds timeout
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (generationResponse.status !== 200 || !generationResponse.data?.base64Image) {
        throw new Error('Invalid response from Python API');
      }
      
      const base64Image = generationResponse.data.base64Image;
      const matches = base64Image.match(/^data:(.+);base64,(.+)$/);

      if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 image string format from Python API');
      }

      const contentType = matches[1];
      const imageBuffer = Buffer.from(matches[2], 'base64');
      const fileExtension = contentType.split('/')[1] || 'webp';
      const baseImageFileName = `base-image-${Date.now()}.${fileExtension}`;
      
      // Upload generated image buffer to S3
      baseImageS3Url = await uploadBufferToS3(imageBuffer, baseImageFileName, contentType, 'public-read');
      console.log('✓ Base image generated and uploaded to S3:', baseImageS3Url);

    } catch (genError) {
      const user = await Upload.findOne({ user: req.user.userId });
      baseImageS3Url = user?.baseImagePath || ''; // if generation failed, use the base image from the database from the previous upload
    }

    // 3. Save to database (this should always work even if base image failed)
    let newUpload;
    try {
      newUpload = new Upload({
        user: req.user.userId,
        originalFilePath: artworkS3Url,
        baseImagePath: baseImageS3Url, // Will be empty string if generation failed
      });
      await newUpload.save();
      console.log('✓ Upload record saved to database:', newUpload._id);
    } catch (dbError) {
      console.error('✗ Failed to save upload to database:', dbError);
      throw new Error('Failed to save upload record to database');
    }

    // 4. Send response to frontend
    res.status(201).json({
      message: baseImageS3Url 
        ? 'Artwork and base image uploaded successfully'
        : 'Artwork uploaded successfully (base image generation unavailable)',
      upload: {
        id: newUpload._id,
        artworkUrl: artworkS3Url,
        baseImageUrl: baseImageS3Url,
        hasBaseImage: !!baseImageS3Url,
      },
    });

  } catch (error) {
    let errorMessage = 'Server error during artwork upload';
    let statusCode = 500;

    res.status(statusCode).json({ 
      message: errorMessage,
      timestamp: new Date().toISOString(),
    });
  } finally {
    // Cleanup: Remove temporary file if it exists
    if (tempFilePath) {
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
          console.log('✓ Temporary file cleaned up:', tempFilePath);
        }
      } catch (cleanupError) {
        console.error('✗ Failed to cleanup temporary file:', cleanupError);
        // Don't throw here - this is just cleanup
      }
    }
  }
}; 