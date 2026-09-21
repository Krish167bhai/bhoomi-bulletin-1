"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_js_1 = require("../controllers/admin.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// All routes here require Admin role
router.use(auth_middleware_js_1.authenticate, auth_middleware_js_1.requireAdmin);
// Dashboard
router.get('/dashboard-stats', admin_controller_js_1.AdminController.getDashboardStats);
// Submissions
router.get('/submissions/pending', admin_controller_js_1.AdminController.getPendingSubmissions);
router.post('/submissions/:id/approve', admin_controller_js_1.AdminController.approveProperty);
router.post('/submissions/:id/reject', admin_controller_js_1.AdminController.rejectProperty);
// Direct Posting
router.post('/posts/create', admin_controller_js_1.AdminController.createPost);
// Properties & Ads
router.get('/properties', admin_controller_js_1.AdminController.getAllProperties);
router.patch('/properties/:id', admin_controller_js_1.AdminController.updatePropertyAdmin);
router.delete('/properties/:id', admin_controller_js_1.AdminController.deleteProperty);
// News & Articles
router.get('/articles', admin_controller_js_1.AdminController.getAllArticles);
router.patch('/articles/:id', admin_controller_js_1.AdminController.updateArticle);
router.delete('/articles/:id', admin_controller_js_1.AdminController.deleteArticle);
// Users & Verification
router.get('/users', admin_controller_js_1.AdminController.getAllUsers);
router.patch('/users/:id/verification', admin_controller_js_1.AdminController.updateUserVerification);
router.get('/info-change-requests', admin_controller_js_1.AdminController.getInfoChangeRequests);
router.post('/info-change-requests/:id/resolve', admin_controller_js_1.AdminController.resolveInfoChangeRequest);
// CRM & Leads
router.get('/leads', admin_controller_js_1.AdminController.getAllLeads);
router.patch('/leads/:id/status', admin_controller_js_1.AdminController.updateLeadStatus);
// Reviews Moderation
router.get('/reviews', admin_controller_js_1.AdminController.getAllReviews);
router.patch('/reviews/:id/moderate', admin_controller_js_1.AdminController.moderateReview);
router.delete('/reviews/:id', admin_controller_js_1.AdminController.deleteReview);
// Media Library
router.get('/media', admin_controller_js_1.AdminController.getMediaItems);
router.delete('/media/:id', admin_controller_js_1.AdminController.deleteMediaItem);
// Settings & Branding
router.get('/settings', admin_controller_js_1.AdminController.getSettings);
router.post('/settings', admin_controller_js_1.AdminController.updateSettings);
exports.default = router;
