"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_service_js_1 = require("../services/settings.service.js");
const router = (0, express_1.Router)();
// Public branding endpoint (for Header, Footer, Favicon)
router.get('/branding', async (_req, res) => {
    const branding = await settings_service_js_1.SettingsService.getBranding();
    return res.json({ success: true, branding });
});
exports.default = router;
