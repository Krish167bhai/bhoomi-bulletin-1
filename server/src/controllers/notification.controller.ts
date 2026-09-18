import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { NotificationService } from '../services/notification.service.js';

export class NotificationController {
  static async getMyNotifications(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          ...(req.user.role === 'ADMIN' ? [{ userId: null }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.json({
      success: true,
      notifications,
      unreadCount,
    });
  }

  static async markAsRead(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const id = req.params.id as string;

    await NotificationService.markAsRead(id, req.user.id);
    return res.json({ success: true, message: 'Notification marked as read' });
  }

  static async markAllAsRead(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    await NotificationService.markAllAsRead(req.user.id);
    return res.json({ success: true, message: 'All notifications marked as read' });
  }

  static async deleteNotification(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const id = req.params.id as string;

    await NotificationService.deleteNotification(id, req.user.id);
    return res.json({ success: true, message: 'Notification deleted' });
  }
}
