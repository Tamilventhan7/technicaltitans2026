import multer from 'multer';
import cloudinary from '../config/cloudinary';
import { Request } from 'express';

// Setup multer in-memory storage
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export async function uploadToCloudinary(file: Express.Multer.File, folder: string): Promise<string> {
  const isMock = !process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your_api_key' || process.env.CLOUDINARY_API_KEY === 'mock_key';

  if (isMock) {
    console.log(`[Upload Service Fallback] Mock uploading file: ${file.originalname} to folder: ${folder}`);
    // Simulate unique cloud URL
    const rand = Math.floor(Math.random() * 100000);
    return `https://res.cloudinary.com/mock_cloud/image/upload/${folder}/v1234567/${rand}_${file.originalname}`;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload failure:', error);
          return reject(error);
        }
        resolve(result?.secure_url || '');
      }
    );

    uploadStream.end(file.buffer);
  });
}
