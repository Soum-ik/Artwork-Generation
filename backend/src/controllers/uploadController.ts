import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import Upload from '../models/Upload';

export const uploadArtwork = async (req: AuthRequest, res: Response) => {
  if (!req.file || !req.user) {
    res.status(400).json({ message: 'No file uploaded or user not authenticated.' });
    return;
  }

  try {
    const newUpload = new Upload({
      user: req.user.userId,
      originalFilePath: req.file.path,
    });

    await newUpload.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      upload: {
        id: newUpload._id,
        filePath: newUpload.originalFilePath,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: 'Server error', error: message });
  }
}; 