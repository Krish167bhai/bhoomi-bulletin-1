import { Router } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth.middleware.js';
import { eventBus, AppEvents } from '../events/eventBus.js';

const router = Router();

// Public event tracker endpoint (page views, phone clicks, WhatsApp clicks)
router.post('/track', optionalAuth, (req, res) => {
  const { eventType, targetId, targetType, metadata } = req.body;

  if (eventType) {
    eventBus.emitEvent(AppEvents.ANALYTICS_EVENT, {
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
router.get('/my-ads', authenticate, async (req, res) => {
  const analytics = await AnalyticsService.getUserAdAnalytics(req.user!.id);
  return res.json({ success: true, analytics });
});

// Admin Analytics (Requirement 28)
router.get('/admin/overview', authenticate, requireAdmin, async (_req, res) => {
  const stats = await AnalyticsService.getWebsiteOverview();
  return res.json({ success: true, stats });
});

router.get('/admin/popular-properties', authenticate, requireAdmin, async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const properties = await AnalyticsService.getPopularProperties(limit);
  return res.json({ success: true, properties });
});

router.get('/admin/popular-articles', authenticate, requireAdmin, async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const articles = await AnalyticsService.getPopularArticles(limit);
  return res.json({ success: true, articles });
});

router.get('/admin/leads', authenticate, requireAdmin, async (_req, res) => {
  const leads = await AnalyticsService.getLeadAnalytics();
  return res.json({ success: true, leads });
});

export default router;
