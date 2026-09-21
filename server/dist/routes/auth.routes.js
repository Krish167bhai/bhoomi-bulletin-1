"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_js_1 = require("../controllers/auth.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const rateLimiter_js_1 = require("../middleware/rateLimiter.js");
const router = (0, express_1.Router)();
router.post('/register', rateLimiter_js_1.authLimiter, auth_controller_js_1.AuthController.register);
router.post('/login', rateLimiter_js_1.authLimiter, auth_controller_js_1.AuthController.login);
router.get('/me', auth_middleware_js_1.authenticate, auth_controller_js_1.AuthController.getMe);
router.post('/change-password', auth_middleware_js_1.authenticate, auth_controller_js_1.AuthController.changePassword);
router.post('/forgot-password', rateLimiter_js_1.authLimiter, auth_controller_js_1.AuthController.forgotPassword);
router.post('/reset-password', rateLimiter_js_1.authLimiter, auth_controller_js_1.AuthController.resetPassword);
// Information change request
router.post('/request-info-change', auth_middleware_js_1.authenticate, auth_controller_js_1.AuthController.requestInfoChange);
router.get('/my-info-requests', auth_middleware_js_1.authenticate, auth_controller_js_1.AuthController.getMyInfoRequests);
exports.default = router;
