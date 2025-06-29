import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;
const HUGGING_FACE_API_URL = process.env.HUGGING_FACE_API_URL;
// Fallback base image URL when all other options fail //because sometime hugging face guiod client api is not working so we are using this fallback url
const FALLBACK_BASE_IMAGE_URL = "https://artwork-testing.s3.ap-south-1.amazonaws.com/base-image-1751145561950.webp";

const REDIS_HOST  = process.env.REDIS_HOST || ''
const REDIS_PORT  = process.env.REDIS_PORT
const REDIS_PASSWORD  = process.env.REDIS_PASSWORD
const REDIS_TLS  = process.env.REDIS_TLS

export {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  REDIS_TLS,
  PORT,
  MONGO_URI,
  JWT_SECRET,
  HUGGING_FACE_API_KEY,
  HUGGING_FACE_API_URL,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET_NAME,
  AWS_REGION,
  FALLBACK_BASE_IMAGE_URL
};
