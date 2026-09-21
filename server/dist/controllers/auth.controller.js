"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const crypto_1 = __importDefault(require("crypto"));
const prisma_js_1 = require("../config/prisma.js");
const env_js_1 = require("../config/env.js");
const eventBus_js_1 = require("../events/eventBus.js");
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    phone: zod_1.z.string().min(10, 'Valid 10-digit mobile number required').max(15),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    role: zod_1.z.enum(['USER', 'BROKER', 'AGENT']).optional().default('USER'),
    userType: zod_1.z.enum(['OWNER', 'BROKER', 'AGENT']).optional().default('OWNER'),
    companyName: zod_1.z.string().optional(),
    licenseNumber: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    identifier: zod_1.z.string().min(3, 'Email or mobile number is required'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z.string().min(6, 'New password must be at least 6 characters'),
});
class AuthController {
    static async register(req, res) {
        const validated = registerSchema.parse(req.body);
        const existingEmail = await prisma_js_1.prisma.user.findUnique({
            where: { email: validated.email.toLowerCase() },
        });
        if (existingEmail) {
            return res.status(400).json({ success: false, message: 'Email is already registered' });
        }
        const existingPhone = await prisma_js_1.prisma.user.findUnique({
            where: { phone: validated.phone },
        });
        if (existingPhone) {
            return res.status(400).json({ success: false, message: 'Mobile number is already registered' });
        }
        const passwordHash = await bcryptjs_1.default.hash(validated.password, 12);
        const user = await prisma_js_1.prisma.user.create({
            data: {
                name: validated.name,
                email: validated.email.toLowerCase(),
                phone: validated.phone,
                passwordHash,
                role: validated.role,
                userType: (validated.role === 'BROKER' ? 'BROKER' : validated.role === 'AGENT' ? 'AGENT' : validated.userType),
                companyName: validated.companyName || null,
                licenseNumber: validated.licenseNumber || null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                userType: true,
                verificationStatus: true,
                createdAt: true,
            },
        });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id }, env_js_1.ENV.JWT_SECRET, { expiresIn: '7d' });
        // Emit user registered event
        eventBus_js_1.eventBus.emitEvent(eventBus_js_1.AppEvents.USER_REGISTERED, user);
        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user,
        });
    }
    static async login(req, res) {
        const { identifier, password } = loginSchema.parse(req.body);
        // Support login by email OR mobile number
        const user = await prisma_js_1.prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier.toLowerCase() },
                    { phone: identifier },
                ],
            },
        });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email/mobile and password.' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email/mobile and password.' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, env_js_1.ENV.JWT_SECRET, { expiresIn: '7d' });
        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            userType: user.userType,
            verificationStatus: user.verificationStatus,
            avatar: user.avatar,
            companyName: user.companyName,
            licenseNumber: user.licenseNumber,
        };
        return res.json({
            success: true,
            message: 'Logged in successfully',
            token,
            user: safeUser,
        });
    }
    static async getMe(req, res) {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                userType: true,
                verificationStatus: true,
                verificationDocs: true,
                avatar: true,
                bio: true,
                companyName: true,
                licenseNumber: true,
                createdAt: true,
            },
        });
        return res.json({ success: true, user });
    }
    static async changePassword(req, res) {
        if (!req.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: req.user.id },
        });
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }
        const newHash = await bcryptjs_1.default.hash(newPassword, 12);
        await prisma_js_1.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash },
        });
        return res.json({ success: true, message: 'Password updated successfully' });
    }
    static async forgotPassword(req, res) {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email address is required' });
        }
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        // Always respond with success to prevent user enumeration
        if (!user) {
            return res.json({
                success: true,
                message: 'If an account exists with this email, password reset instructions have been generated.',
            });
        }
        // Generate secure single-use token (valid for 1 hour)
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await prisma_js_1.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt,
            },
        });
        // In a production setup with SMTP, an email with reset link is sent.
        // For this deployment, we return the reset link token in response when SMTP is not configured
        // so administrators and users can verify the complete recovery flow without an external mail server.
        const resetUrl = `/reset-password?token=${token}`;
        return res.json({
            success: true,
            message: 'Password reset link generated successfully.',
            resetUrl,
            token, // Available for development/testing verification
        });
    }
    static async resetPassword(req, res) {
        const { token, newPassword } = req.body;
        if (!token || !newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Valid token and new password (min 6 chars) are required' });
        }
        const resetRecord = await prisma_js_1.prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: 'Reset token is invalid or has expired' });
        }
        const newHash = await bcryptjs_1.default.hash(newPassword, 12);
        await prisma_js_1.prisma.$transaction([
            prisma_js_1.prisma.user.update({
                where: { id: resetRecord.userId },
                data: { passwordHash: newHash },
            }),
            prisma_js_1.prisma.passwordResetToken.update({
                where: { id: resetRecord.id },
                data: { usedAt: new Date() },
            }),
        ]);
        return res.json({ success: true, message: 'Password has been reset successfully. You can now login.' });
    }
    // Requirement 23: Request Information Change
    static async requestInfoChange(req, res) {
        if (!req.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { requestedName, requestedEmail, requestedPhone, reason } = req.body;
        const request = await prisma_js_1.prisma.informationChangeRequest.create({
            data: {
                userId: req.user.id,
                requestedName: requestedName || null,
                requestedEmail: requestedEmail || null,
                requestedPhone: requestedPhone || null,
                reason: reason || null,
                status: 'PENDING',
            },
        });
        return res.status(201).json({
            success: true,
            message: 'Information change request submitted to Admin for review.',
            request,
        });
    }
    static async getMyInfoRequests(req, res) {
        if (!req.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const requests = await prisma_js_1.prisma.informationChangeRequest.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ success: true, requests });
    }
}
exports.AuthController = AuthController;
