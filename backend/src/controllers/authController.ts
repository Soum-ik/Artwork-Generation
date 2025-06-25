import type { Request, Response } from 'express';
import User from '../models/User';
import { createJWT } from '../utils/jwt';
import { Types } from 'mongoose';

export const signupUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = new User({ email, password });
    await user.save();

    if (!user._id) {
      res.status(500).json({ message: 'Server error after user creation' });
      return;
    }
    
    const token = createJWT({ userId: user._id as Types.ObjectId, email: user.email });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: 'Server error', error: message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user._id) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = createJWT({ userId: user._id as Types.ObjectId, email: user.email });

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: 'Server error', error: message });
  }
}; 