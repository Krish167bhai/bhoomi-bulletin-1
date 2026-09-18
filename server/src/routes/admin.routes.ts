import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// All routes here require Admin role
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard-stats', AdminController.getDashboardStats);

// Submissions
router.get('/submissions/pending', AdminController.getPendingSubmissions);
router.post('/submissions/:id/approve', AdminController.approveProperty);
router.post('/submissions/:id/reject', AdminController.rejectProperty);

// Direct Posting
router.post('/posts/create', AdminController.createPost);

// Properties & Ads
router.get('/properties', AdminController.getAllProperties);
router.patch('/properties/:id', AdminController.updatePropertyAdmin);
router.delete('/properties/:id', AdminController.deleteProperty);

// News & Articles
router.get('/articles', AdminController.getAllArticles);
router.patch('/articles/:id', AdminController.updateArticle);
router.delete('/articles/:id', AdminController.deleteArticle);

// Users & Verification
router.get('/users', AdminController.getAllUsers);
router.patch('/users/:id/verification', AdminController.updateUserVerification);
router.get('/info-change-requests', AdminController.getInfoChangeRequests);
router.post('/info-change-requests/:id/resolve', AdminController.resolveInfoChangeRequest);

// CRM & Leads
router.get('/leads', AdminController.getAllLeads);
router.patch('/leads/:id/status', AdminController.updateLeadStatus);

// Reviews Moderation
router.get('/reviews', AdminController.getAllReviews);
router.patch('/reviews/:id/moderate', AdminController.moderateReview);
router.delete('/reviews/:id', AdminController.deleteReview);

// Media Library
router.get('/media', AdminController.getMediaItems);
router.delete('/media/:id', AdminController.deleteMediaItem);

// Settings & Branding
router.get('/settings', AdminController.getSettings);
router.post('/settings', AdminController.updateSettings);

export default router;
