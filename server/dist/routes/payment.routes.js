"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_service_js_1 = require("../services/payment.service.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// Public plans info
router.get('/plans', (_req, res) => {
    return res.json({
        success: true,
        isConfigured: payment_service_js_1.PaymentService.isConfigured(),
        provider: payment_service_js_1.PaymentService.getProviderName(),
        plans: payment_service_js_1.PaymentService.getPlans(),
    });
});
// Create order (remains disabled if not configured)
router.post('/create-order', auth_middleware_js_1.authenticate, async (req, res) => {
    const { planId, propertyId } = req.body;
    const result = await payment_service_js_1.PaymentService.createOrder(planId, propertyId, req.user.id);
    return res.json({ success: true, ...result });
});
exports.default = router;
