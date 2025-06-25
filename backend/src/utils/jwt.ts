import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { JWT_SECRET as jwtSecret } from '../config/config';

const JWT_SECRET = jwtSecret;
const JWT_LIFETIME = '1d';

if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
}

export const createJWT = (payload: { userId: Types.ObjectId, email: string }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_LIFETIME });
};

export const verifyJWT = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
}; 