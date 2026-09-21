"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const notification_service_js_1 = require("../services/notification.service.js");
class NotificationController {
    static async getMyNotifications(req, res) {
        if (!req.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const notifications = await prisma_js_1.prisma.notification.findMany({
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
    static async markAsRead(req, res) {
        if (!req.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const id = req.params.id;
        await notification_service_js_1.NotificationService.markAsRead(id, req.user.id);
        return res.json({ success: true, message: 'Notification marked as read' });
    }
    static async markAllAsRead(req, res) {
        if (!req.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        await notification_service_js_1.NotificationService.markAllAsRead(req.user.id);
        return res.json({ success: true, message: 'All notifications marked as read' });
    }
    static async deleteNotification(req, res) {
        if (!req.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const id = req.params.id;
        await notification_service_js_1.NotificationService.deleteNotification(id, req.user.id);
        return res.json({ success: true, message: 'Notification deleted' });
    }
}
exports.NotificationController = NotificationController;
