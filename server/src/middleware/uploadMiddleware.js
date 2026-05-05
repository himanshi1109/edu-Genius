import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Check if cloudinary is actually configured (not a placeholder)
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

let imageStorage;
let videoStorage;

if (isCloudinaryConfigured) {
  imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'edugenius/images',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
  });

  videoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'edugenius/videos',
      resource_type: 'video',
      allowed_formats: ['mp4', 'mov', 'avi', 'mkv'],
    },
  });
} else {
  // Local storage fallback
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  imageStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `image-${Date.now()}${path.extname(file.originalname)}`)
  });

  videoStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `video-${Date.now()}${path.extname(file.originalname)}`)
  });
}

export const uploadImage = multer({ storage: imageStorage }).single('thumbnail');
export const uploadVideo = multer({ storage: videoStorage }).single('video');
