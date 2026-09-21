"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_service_js_1 = require("../services/analytics.service.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const eventBus_js_1 = require("../events/eventBus.js");
const router = (0, express_1.Router)();
// Public event tracker endpoint (page views, phone clicks, WhatsApp clicks)
router.post('/track', auth_middleware_js_1.optionalAuth, (req, res) => {
    const { eventType, targetId, targetType, metadata } = req.body;
    if (eventType) {
        eventBus_js_1.eventBus.emitEvent(eventBus_js_1.AppEvents.ANALYTICS_EVENT, {
            eventType,
            targetId,
            targetType,
            userId: req.user?.id || null,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            metadata,
        });
    }
    return res.json({ success: true });
});
// User Ad Analytics (Private to the user - Requirement 29)
router.get('/my-ads', auth_middleware_js_1.authenticate, async (req, res) => {
    const analytics = await analytics_service_js_1.AnalyticsService.getUserAdAnalytics(req.user.id);
    return res.json({ success: true, analytics });
});
// Admin Analytics (Requirement 28)
router.get('/admin/overview', auth_middleware_js_1.authenticate, auth_middleware_js_1.requireAdmin, async (_req, res) => {
    const stats = await analytics_service_js_1.AnalyticsService.getWebsiteOverview();
    return res.json({ success: true, stats });
});
router.get('/admin/popular-properties', auth_middleware_js_1.authenticate, auth_middleware_js_1.requireAdmin, async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const properties = await analytics_service_js_1.AnalyticsService.getPopularProperties(limit);
    return res.json({ success: true, properties });
});
router.get('/admin/popular-articles', auth_middleware_js_1.authenticate, auth_middleware_js_1.requireAdmin, async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const articles = await analytics_service_js_1.AnalyticsService.getPopularArticles(limit);
    return res.json({ success: true, articles });
});
router.get('/admin/leads', auth_middleware_js_1.authenticate, auth_middleware_js_1.requireAdmin, async (_req, res) => {
    const leads = await analytics_service_js_1.AnalyticsService.getLeadAnalytics();
    return res.json({ success: true, leads });
});
exports.default = router;
