import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller.js';
import { upload } from '../middleware/upload.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Allow authenticated users (and admins) to upload media
router.post('/single', authenticate, upload.single('file'), UploadController.uploadFile);
router.post('/multiple', authenticate, upload.array('files', 10), UploadController.uploadMultipleFiles);

// Specific fields for property submission
router.post(
  '/property-media',
  authenticate,
  upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'video', maxCount: 1 },
  ]),
  (req, res) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const photos = (files?.photos || []).map((f) => `/uploads/images/${f.filename}`);
    const video = files?.video && files.video[0] ? `/uploads/videos/${files.video[0].filename}` : null;

    return res.json({
      success: true,
      photos,
      video,
    });
  }
);

// Logo & favicon upload for branding (Admin only)
router.post(
  '/branding',
  authenticate,
  upload.fields([
    { name: 'logoDesktop', maxCount: 1 },
    { name: 'logoMobile', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
  ]),
  (req, res) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const result: Record<string, string> = {};

    if (files?.logoDesktop?.[0]) result.logoDesktop = `/uploads/branding/${files.logoDesktop[0].filename}`;
    if (files?.logoMobile?.[0]) result.logoMobile = `/uploads/branding/${files.logoMobile[0].filename}`;
    if (files?.favicon?.[0]) result.favicon = `/uploads/branding/${files.favicon[0].filename}`;

    return res.json({
      success: true,
      urls: result,
    });
  }
);

export default router;
