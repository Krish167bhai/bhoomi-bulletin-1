"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const enquiry_controller_js_1 = require("../controllers/enquiry.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// Public forms (with optional user context)
router.post('/submit', auth_middleware_js_1.optionalAuth, enquiry_controller_js_1.EnquiryController.submitEnquiry);
router.post('/requirement', auth_middleware_js_1.optionalAuth, enquiry_controller_js_1.EnquiryController.submitRequirement);
// User protected CRM routes
router.get('/received', auth_middleware_js_1.authenticate, enquiry_controller_js_1.EnquiryController.getReceivedEnquiries);
router.get('/sent', auth_middleware_js_1.authenticate, enquiry_controller_js_1.EnquiryController.getSentEnquiries);
router.get('/my-requirements', auth_middleware_js_1.authenticate, enquiry_controller_js_1.EnquiryController.getMyRequirements);
router.patch('/:id/status', auth_middleware_js_1.authenticate, enquiry_controller_js_1.EnquiryController.updateMyEnquiryStatus);
exports.default = router;
