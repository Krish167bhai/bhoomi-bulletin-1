import { prisma } from '../config/prisma.js';

export interface CreateNotificationParams {
  userId?: string | null; // null for admin broadcast
  title: string;
  message: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  link?: string;
}

export class NotificationService {
  static async createNotification(params: CreateNotificationParams) {
    return prisma.notification.create({
      data: {
        userId: params.userId || null,
        title: params.title,
        message: params.message,
        type: params.type || 'INFO',
        link: params.link || null,
        isRead: false,
      },
    });
  }

  static async notifyAdmins(title: string, message: string, link?: string) {
    // Notify with userId = null (admin notifications), and also create for all admin users
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    const notificationsData = admins.map((admin) => ({
      userId: admin.id,
      title,
      message,
      type: 'ALERT',
      link: link || null,
      isRead: false,
    }));

    if (notificationsData.length > 0) {
      await prisma.notification.createMany({
        data: notificationsData,
      });
    }
  }

  static async getUserNotifications(userId: string, limit = 50) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  static async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  static async deleteNotification(id: string, userId: string) {
    return prisma.notification.deleteMany({
      where: { id, userId },
    });
  }
}
