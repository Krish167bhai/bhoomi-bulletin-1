import { Router } from 'express';
import { PaymentService } from '../services/payment.service.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public plans info
router.get('/plans', (_req, res) => {
  return res.json({
    success: true,
    isConfigured: PaymentService.isConfigured(),
    provider: PaymentService.getProviderName(),
    plans: PaymentService.getPlans(),
  });
});

// Create order (remains disabled if not configured)
router.post('/create-order', authenticate, async (req, res) => {
  const { planId, propertyId } = req.body;
  const result = await PaymentService.createOrder(planId, propertyId, req.user!.id);
  return res.json({ success: true, ...result });
});

export default router;
