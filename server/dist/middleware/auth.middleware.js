"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireBrokerOrAgent = exports.requireAdmin = exports.optionalAuth = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../config/env.js");
const prisma_js_1 = require("../config/prisma.js");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_js_1.ENV.JWT_SECRET);
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                userType: true,
                verificationStatus: true,
            },
        });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({ success: false, message: 'Authentication failed' });
    }
};
exports.authenticate = authenticate;
const optionalAuth = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, env_js_1.ENV.JWT_SECRET);
            const user = await prisma_js_1.prisma.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    userType: true,
                    verificationStatus: true,
                },
            });
            if (user) {
                req.user = user;
            }
        }
    }
    catch {
        // Ignore invalid optional tokens
    }
    next();
};
exports.optionalAuth = optionalAuth;
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireBrokerOrAgent = (req, res, next) => {
    if (!req.user || (req.user.role !== 'BROKER' && req.user.role !== 'AGENT' && req.user.role !== 'ADMIN')) {
        return res.status(403).json({ success: false, message: 'Access denied. Broker or Agent privileges required.' });
    }
    next();
};
exports.requireBrokerOrAgent = requireBrokerOrAgent;
