"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const prisma_js_1 = require("../config/prisma.js");
class NotificationService {
    static async createNotification(params) {
        return prisma_js_1.prisma.notification.create({
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
    static async notifyAdmins(title, message, link) {
        // Notify with userId = null (admin notifications), and also create for all admin users
        const admins = await prisma_js_1.prisma.user.findMany({
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
            await prisma_js_1.prisma.notification.createMany({
                data: notificationsData,
            });
        }
    }
    static async getUserNotifications(userId, limit = 50) {
        return prisma_js_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    static async markAsRead(id, userId) {
        return prisma_js_1.prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });
    }
    static async markAllAsRead(userId) {
        return prisma_js_1.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
    static async deleteNotification(id, userId) {
        return prisma_js_1.prisma.notification.deleteMany({
            where: { id, userId },
        });
    }
}
exports.NotificationService = NotificationService;
