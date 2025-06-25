import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import Upload from '../models/Upload';

export const getUserUploads = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const uploads = await Upload.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json(uploads);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: 'Server error', error: message });
  }
}; 