"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const prisma_js_1 = require("../config/prisma.js");
class UploadController {
    static async uploadFile(req, res) {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        // Determine subfolder and URL
        let subfolder = 'images';
        let mediaType = 'IMAGE';
        if (req.file.fieldname === 'video' || req.file.mimetype.startsWith('video/')) {
            subfolder = 'videos';
            mediaType = 'VIDEO';
        }
        else if (req.file.fieldname.startsWith('logo') || req.file.fieldname === 'favicon') {
            subfolder = 'branding';
            mediaType = 'IMAGE';
        }
        else if (req.file.mimetype === 'application/pdf') {
            mediaType = 'DOCUMENT';
        }
        const fileUrl = `/uploads/${subfolder}/${req.file.filename}`;
        const mediaItem = await prisma_js_1.prisma.mediaItem.create({
            data: {
                uploaderId: req.user?.id || null,
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                url: fileUrl,
                mediaType,
            },
        });
        return res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            url: fileUrl,
            mediaItem,
        });
    }
    static async uploadMultipleFiles(req, res) {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }
        const uploadedItems = [];
        for (const file of files) {
            const isVideo = file.mimetype.startsWith('video/');
            const subfolder = isVideo ? 'videos' : 'images';
            const fileUrl = `/uploads/${subfolder}/${file.filename}`;
            const item = await prisma_js_1.prisma.mediaItem.create({
                data: {
                    uploaderId: req.user?.id || null,
                    filename: file.filename,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    url: fileUrl,
                    mediaType: isVideo ? 'VIDEO' : 'IMAGE',
                },
            });
            uploadedItems.push({ url: fileUrl, item });
        }
        return res.status(201).json({
            success: true,
            files: uploadedItems,
        });
    }
}
exports.UploadController = UploadController;
