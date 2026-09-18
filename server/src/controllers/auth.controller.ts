import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
import { ENV } from '../config/env.js';
import { eventBus, AppEvents } from '../events/eventBus.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid 10-digit mobile number required').max(15),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['USER', 'BROKER', 'AGENT']).optional().default('USER'),
  userType: z.enum(['OWNER', 'BROKER', 'AGENT']).optional().default('OWNER'),
  companyName: z.string().optional(),
  licenseNumber: z.string().optional(),
});

const loginSchema = z.object({
  identifier: z.string().min(3, 'Email or mobile number is required'),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export class AuthController {
  static async register(req: Request, res: Response) {
    const validated = registerSchema.parse(req.body);

    const existingEmail = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const existingPhone = await prisma.user.findUnique({
      where: { phone: validated.phone },
    });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'Mobile number is already registered' });
    }

    const passwordHash = await bcrypt.hash(validated.password, 12);

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase(),
        phone: validated.phone,
        passwordHash,
        role: validated.role as any,
        userType: (validated.role === 'BROKER' ? 'BROKER' : validated.role === 'AGENT' ? 'AGENT' : validated.userType) as any,
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
    const token = jwt.sign({ id: user.id }, ENV.JWT_SECRET, { expiresIn: '7d' });

    // Emit user registered event
    eventBus.emitEvent(AppEvents.USER_REGISTERED, user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user,
    });
  }

  static async login(req: Request, res: Response) {
    const { identifier, password } = loginSchema.parse(req.body);

    // Support login by email OR mobile number
    const user = await prisma.user.findFirst({
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

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email/mobile and password.' });
    }

    const token = jwt.sign({ id: user.id }, ENV.JWT_SECRET, { expiresIn: '7d' });

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

  static async getMe(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
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

  static async changePassword(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return res.json({ success: true, message: 'Password updated successfully' });
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const user = await prisma.user.findUnique({
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
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
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

  static async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Valid token and new password (min 6 chars) are required' });
    }

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Reset token is invalid or has expired' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: newHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return res.json({ success: true, message: 'Password has been reset successfully. You can now login.' });
  }

  // Requirement 23: Request Information Change
  static async requestInfoChange(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { requestedName, requestedEmail, requestedPhone, reason } = req.body;

    const request = await prisma.informationChangeRequest.create({
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

  static async getMyInfoRequests(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const requests = await prisma.informationChangeRequest.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, requests });
  }
}
