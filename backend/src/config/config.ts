import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI
const JWT_SECRET = process.env.JWT_SECRET
const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY
const HUGGING_FACE_API_URL = process.env.HUGGING_FACE_API_URL

export { PORT, MONGO_URI, JWT_SECRET, HUGGING_FACE_API_KEY, HUGGING_FACE_API_URL };