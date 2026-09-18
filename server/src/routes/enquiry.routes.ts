import { Router } from 'express';
import { EnquiryController } from '../controllers/enquiry.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Public forms (with optional user context)
router.post('/submit', optionalAuth, EnquiryController.submitEnquiry);
router.post('/requirement', optionalAuth, EnquiryController.submitRequirement);

// User protected CRM routes
router.get('/received', authenticate, EnquiryController.getReceivedEnquiries);
router.get('/sent', authenticate, EnquiryController.getSentEnquiries);
router.get('/my-requirements', authenticate, EnquiryController.getMyRequirements);
router.patch('/:id/status', authenticate, EnquiryController.updateMyEnquiryStatus);

export default router;
