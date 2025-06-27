import { Schema, model, Document, Types } from 'mongoose';

export interface IUpload extends Document {
  user: Types.ObjectId;
  originalFilePath: string;
  baseImagePath?: string;
  prompt?: string;
}

const UploadSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  originalFilePath: {
    type: String,
    required: true,
  },
  baseImagePath: {
    type: String,
    required: false,
  },
  prompt: {
    type: String,
  },
}, { timestamps: true });

const Upload = model<IUpload>('Upload', UploadSchema);

export default Upload; 