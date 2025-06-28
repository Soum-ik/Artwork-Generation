import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import Upload from "../models/Upload";
import { uploadFileToS3, uploadBufferToS3 } from "../utils/sendFiletoS3";
import axios from "axios";
import fs from "fs";

// Fallback base image URL when all other options fail //because sometime hugging face guiod client api is not working so we are using this fallback url
const FALLBACK_BASE_IMAGE_URL = "https://artwork-testing.s3.ap-south-1.amazonaws.com/base-image-1751145561950.webp";

export const uploadArtwork = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  let tempFilePath: string | null = null;

  try {
    if (!req.file || !req.user) {
      res
        .status(400)
        .json({ message: "No file uploaded or user not authenticated." });
      return;
    }

    const { path: uploadedFilePath, originalname } = req.file;
    tempFilePath = uploadedFilePath;

    // Verify the uploaded file exists
    if (!fs.existsSync(tempFilePath)) {
      throw new Error(`Uploaded file not found at path: ${tempFilePath}`);
    }

    // 1. Upload original artwork to S3
    let artworkS3Url = "";
    try {
      artworkS3Url = await uploadFileToS3(
        tempFilePath,
        `artwork-${Date.now()}-${originalname}`,
        "public-read"
      );
    } catch (s3Error) {
      console.error("S3 Upload Error:", s3Error);
      throw new Error("Failed to upload original artwork to cloud storage");
    }

    // 2. Generate base image by calling Python API (with graceful degradation)
    let baseImageS3Url = "";

    // First, check if user already has a base image from previous uploads
    try {
      const existingUpload = await Upload.findOne({ user: req.user.userId });
      if (existingUpload && existingUpload.baseImagePath) {
        baseImageS3Url = existingUpload.baseImagePath;
        console.log(
          "✓ Using existing base image from database:",
          baseImageS3Url
        );
      } else {
        // User doesn't have a base image, generate one via Python API
        console.log(
          "→ No existing base image found, generating new one via Python API..."
        );

        const pythonApiUrl =
          "https://test-load-huh2gzdze7dxaxd8.southeastasia-01.azurewebsites.net/api/v1/generate-base-image";

        // Add timeout to prevent hanging
        const generationResponse = await axios.post(
          pythonApiUrl,
          {},
          {
            timeout: 30000, // 30 seconds timeout
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (
          generationResponse.status !== 200 ||
          !generationResponse.data?.base64Image
        ) {
          throw new Error("Invalid response from Python API");
        }

        const base64Image = generationResponse.data.base64Image;
        const matches = base64Image.match(/^data:(.+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
          throw new Error("Invalid base64 image string format from Python API");
        }

        const contentType = matches[1];
        const imageBuffer = Buffer.from(matches[2], "base64");
        const fileExtension = contentType.split("/")[1] || "webp";
        const baseImageFileName = `base-image-${Date.now()}.${fileExtension}`;

        // Upload generated image buffer to S3
        baseImageS3Url = await uploadBufferToS3(
          imageBuffer,
          baseImageFileName,
          contentType,
          "public-read"
        );
        console.log(
          "✓ New base image generated and uploaded to S3:",
          baseImageS3Url
        );
      }
    } catch (genError) {
      console.warn("Base image handling failed:", genError);
      // If everything fails, try to get any existing base image as fallback
      try {
        const fallbackUpload = await Upload.findOne({ user: req.user.userId });
        baseImageS3Url = fallbackUpload?.baseImagePath || "";
      } catch (fallbackError) {
        console.error("Fallback base image retrieval failed:", fallbackError);
        baseImageS3Url = "";
      }
      
      // If still no base image found, use the default fallback URL
      if (!baseImageS3Url) {
        baseImageS3Url = FALLBACK_BASE_IMAGE_URL;
        console.log("→ Using fallback base image URL:", baseImageS3Url);
      }
    }

    // 3. Save to database (this should always work even if base image failed)
    let newUpload;
    try {
      newUpload = new Upload({
        user: req.user.userId,
        originalFilePath: artworkS3Url,
        baseImagePath: baseImageS3Url, // Will be fallback URL if everything else failed
      });
      await newUpload.save();
      console.log("✓ Upload record saved to database:", newUpload._id);
    } catch (dbError) {
      console.error("✗ Failed to save upload to database:", dbError);
      throw new Error("Failed to save upload record to database");
    }

    // 4. Send response to frontend
    res.status(201).json({
      message: baseImageS3Url === FALLBACK_BASE_IMAGE_URL
        ? "Artwork uploaded successfully (using fallback base image)"
        : baseImageS3Url.includes('base-image-')
        ? "Artwork and base image uploaded successfully"
        : "Artwork uploaded successfully (using existing base image)",
      upload: {
        id: newUpload._id,
        artworkUrl: artworkS3Url,
        baseImageUrl: baseImageS3Url,
        hasBaseImage: !!baseImageS3Url,
        usingFallback: baseImageS3Url === FALLBACK_BASE_IMAGE_URL,
      },
    });
  } catch (error) {
    let errorMessage = "Server error during artwork upload";
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
          console.log("✓ Temporary file cleaned up:", tempFilePath);
        }
      } catch (cleanupError) {
        console.error("✗ Failed to cleanup temporary file:", cleanupError);
        // Don't throw here - this is just cleanup
      }
    }
  }
};

export const getUserUploads = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const uploads = await Upload.find({ user: userId });
    res.status(200).json(uploads);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch uploads" });
  }
};
