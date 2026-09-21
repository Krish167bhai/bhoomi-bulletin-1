"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_js_1 = require("../controllers/upload.controller.js");
const upload_middleware_js_1 = require("../middleware/upload.middleware.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// Allow authenticated users (and admins) to upload media
router.post('/single', auth_middleware_js_1.authenticate, upload_middleware_js_1.upload.single('file'), upload_controller_js_1.UploadController.uploadFile);
router.post('/multiple', auth_middleware_js_1.authenticate, upload_middleware_js_1.upload.array('files', 10), upload_controller_js_1.UploadController.uploadMultipleFiles);
// Specific fields for property submission
router.post('/property-media', auth_middleware_js_1.authenticate, upload_middleware_js_1.upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'video', maxCount: 1 },
]), (req, res) => {
    const files = req.files;
    const photos = (files?.photos || []).map((f) => `/uploads/images/${f.filename}`);
    const video = files?.video && files.video[0] ? `/uploads/videos/${files.video[0].filename}` : null;
    return res.json({
        success: true,
        photos,
        video,
    });
});
// Logo & favicon upload for branding (Admin only)
router.post('/branding', auth_middleware_js_1.authenticate, upload_middleware_js_1.upload.fields([
    { name: 'logoDesktop', maxCount: 1 },
    { name: 'logoMobile', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
]), (req, res) => {
    const files = req.files;
    const result = {};
    if (files?.logoDesktop?.[0])
        result.logoDesktop = `/uploads/branding/${files.logoDesktop[0].filename}`;
    if (files?.logoMobile?.[0])
        result.logoMobile = `/uploads/branding/${files.logoMobile[0].filename}`;
    if (files?.favicon?.[0])
        result.favicon = `/uploads/branding/${files.favicon[0].filename}`;
    return res.json({
        success: true,
        urls: result,
    });
});
exports.default = router;
