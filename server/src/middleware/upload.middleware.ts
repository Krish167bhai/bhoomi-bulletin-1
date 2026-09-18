import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const baseUploadDir = path.join(process.cwd(), 'uploads');
const imagesDir = path.join(baseUploadDir, 'images');
const videosDir = path.join(baseUploadDir, 'videos');
const brandingDir = path.join(baseUploadDir, 'branding');

[baseUploadDir, imagesDir, videosDir, brandingDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    if (file.fieldname === 'video' || file.mimetype.startsWith('video/')) {
      cb(null, videosDir);
    } else if (file.fieldname.startsWith('logo') || file.fieldname === 'favicon') {
      cb(null, brandingDir);
    } else {
      cb(null, imagesDir);
    }
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'image/x-icon',
    'image/vnd.microsoft.icon',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});
