"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const baseUploadDir = path_1.default.join(process.cwd(), 'uploads');
const imagesDir = path_1.default.join(baseUploadDir, 'images');
const videosDir = path_1.default.join(baseUploadDir, 'videos');
const brandingDir = path_1.default.join(baseUploadDir, 'branding');
[baseUploadDir, imagesDir, videosDir, brandingDir].forEach((dir) => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
});
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'video' || file.mimetype.startsWith('video/')) {
            cb(null, videosDir);
        }
        else if (file.fieldname.startsWith('logo') || file.fieldname === 'favicon') {
            cb(null, brandingDir);
        }
        else {
            cb(null, imagesDir);
        }
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const cleanName = path_1.default.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30);
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
    },
});
const fileFilter = (_req, file, cb) => {
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
    }
    else {
        cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB
    },
});
