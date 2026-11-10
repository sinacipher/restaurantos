import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { AppError } from '../shared/errors.js';

if (env.ENABLE_CLOUDINARY) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME!,
    api_key: env.CLOUDINARY_API_KEY!,
    api_secret: env.CLOUDINARY_API_SECRET!,
    secure: true,
  });
}

export function generateUploadSignature(folder: string) {
  if (!env.ENABLE_CLOUDINARY) {
    throw new AppError('CLOUDINARY_DISABLED', 'Cloudinary is not configured.', 400);
  }
  
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    folder,
  };
}