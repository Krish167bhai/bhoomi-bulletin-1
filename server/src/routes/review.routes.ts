import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/property/:propertyId', ReviewController.getPropertyReviews);
router.post('/submit', authenticate, ReviewController.submitReview);
router.get('/my', authenticate, ReviewController.getMyReviews);

export default router;
