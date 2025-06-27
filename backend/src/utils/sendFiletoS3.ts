import {
  ObjectCannedACL,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET_NAME,
} from "../config/config";

// Initialize S3 client
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID as string,
    secretAccessKey: AWS_SECRET_ACCESS_KEY as string,
  },
});

const getFullS3Url = (bucket: string, region: string, key: string) => {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

export const uploadFileToS3 = (
  filePath: string,
  fileName: string,
  acl: ObjectCannedACL = "private"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath);
    const contentType = getContentType(fileName);

    const params: PutObjectCommandInput = { 
      Bucket: AWS_BUCKET_NAME,
      Key: fileName,
      Body: fileContent,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(params);

    s3Client
      .send(command)
      .then(() => {
        const url = getFullS3Url(AWS_BUCKET_NAME as string, AWS_REGION as string, fileName);
        resolve(url);
      })
      .catch((error: any) => {
        console.error("Error uploading file:", error);
        reject(error);
      });
  });
};

export const uploadBufferToS3 = (
  buffer: Buffer,
  fileName: string,
  contentType: string,
  acl: ObjectCannedACL = "private"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const params: PutObjectCommandInput = {
      Bucket: AWS_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(params);

    s3Client
      .send(command)
      .then(() => {
        const url = getFullS3Url(AWS_BUCKET_NAME as string, AWS_REGION as string, fileName);
        resolve(url);
      })
      .catch((error: any) => {
        console.error("Error uploading file:", error);
        reject(error);
      });
  });
}

export const getContentType = (fileName: string): string => {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case ".jpeg":
    case ".jpg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    default:
      return "application/octet-stream";
  }
};
