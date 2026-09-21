"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const prisma_js_1 = require("../config/prisma.js");
class AnalyticsService {
    static async logEvent(data) {
        return prisma_js_1.prisma.analyticsEvent.create({
            data: {
                eventType: data.eventType,
                targetId: data.targetId || null,
                targetType: data.targetType || null,
                userId: data.userId || null,
                ipAddress: data.ipAddress || null,
                userAgent: data.userAgent || null,
                metadata: data.metadata ? JSON.stringify(data.metadata) : null,
            },
        });
    }
    static async getWebsiteOverview() {
        const totalUsers = await prisma_js_1.prisma.user.count();
        const newUsersLast30Days = await prisma_js_1.prisma.user.count({
            where: {
                createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
        });
        const pendingSubmissions = await prisma_js_1.prisma.property.count({
            where: { status: 'PENDING_APPROVAL' },
        });
        const activeAds = await prisma_js_1.prisma.property.count({
            where: { isAdvertisement: true, status: 'APPROVED' },
        });
        const expiredAds = await prisma_js_1.prisma.property.count({
            where: { isAdvertisement: true, status: 'EXPIRED' },
        });
        const totalProperties = await prisma_js_1.prisma.property.count();
        const totalArticles = await prisma_js_1.prisma.article.count();
        const totalVideos = await prisma_js_1.prisma.article.count({
            where: { category: 'VIDEO_NEWS' },
        });
        const totalRequirements = await prisma_js_1.prisma.propertyRequirement.count();
        const totalEnquiries = await prisma_js_1.prisma.enquiry.count();
        const verifiedProperties = await prisma_js_1.prisma.property.count({
            where: { verificationStatus: 'VERIFIED' },
        });
        const verifiedAgents = await prisma_js_1.prisma.user.count({
            where: {
                role: { in: ['BROKER', 'AGENT'] },
                verificationStatus: 'VERIFIED',
            },
        });
        const totalPageViews = await prisma_js_1.prisma.analyticsEvent.count({
            where: { eventType: 'PAGE_VIEW' },
        });
        const totalPropertyViews = await prisma_js_1.prisma.analyticsEvent.count({
            where: { eventType: 'PROPERTY_VIEW' },
        });
        const totalArticleViews = await prisma_js_1.prisma.analyticsEvent.count({
            where: { eventType: 'ARTICLE_VIEW' },
        });
        // Daily views trend for the last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentEvents = await prisma_js_1.prisma.analyticsEvent.findMany({
            where: {
                createdAt: { gte: sevenDaysAgo },
                eventType: { in: ['PAGE_VIEW', 'PROPERTY_VIEW', 'ARTICLE_VIEW', 'ENQUIRY_CLICK'] },
            },
            select: {
                eventType: true,
                createdAt: true,
            },
        });
        // Group by date
        const dailyMap = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().split('T')[0];
            dailyMap[key] = { date: key, pageViews: 0, propertyViews: 0, enquiries: 0 };
        }
        recentEvents.forEach((ev) => {
            const dayKey = ev.createdAt.toISOString().split('T')[0];
            if (dailyMap[dayKey]) {
                if (ev.eventType === 'PAGE_VIEW')
                    dailyMap[dayKey].pageViews++;
                else if (ev.eventType === 'PROPERTY_VIEW')
                    dailyMap[dayKey].propertyViews++;
                else if (ev.eventType === 'ENQUIRY_CLICK')
                    dailyMap[dayKey].enquiries++;
            }
        });
        return {
            totalUsers,
            newUsersLast30Days,
            pendingSubmissions,
            activeAds,
            expiredAds,
            totalProperties,
            totalArticles,
            totalVideos,
            totalRequirements,
            totalEnquiries,
            verifiedProperties,
            verifiedAgents,
            totalPageViews,
            totalPropertyViews,
            totalArticleViews,
            trafficTrends: Object.values(dailyMap),
        };
    }
    static async getPopularProperties(limit = 10) {
        return prisma_js_1.prisma.property.findMany({
            where: { isPublished: true },
            orderBy: { viewsCount: 'desc' },
            take: limit,
            select: {
                id: true,
                title: true,
                slug: true,
                city: true,
                price: true,
                viewsCount: true,
                phoneClicks: true,
                whatsappClicks: true,
                propertyType: true,
                verificationStatus: true,
                _count: {
                    select: { enquiries: true, favourites: true },
                },
            },
        });
    }
    static async getPopularArticles(limit = 10) {
        return prisma_js_1.prisma.article.findMany({
            where: { isPublished: true },
            orderBy: { viewsCount: 'desc' },
            take: limit,
            select: {
                id: true,
                title: true,
                slug: true,
                category: true,
                viewsCount: true,
                publishedAt: true,
            },
        });
    }
    static async getLeadAnalytics() {
        const totalLeads = (await prisma_js_1.prisma.enquiry.count()) + (await prisma_js_1.prisma.propertyRequirement.count());
        // Group enquiries by status
        const enquiriesByStatus = await prisma_js_1.prisma.enquiry.groupBy({
            by: ['status'],
            _count: { id: true },
        });
        const requirementsByStatus = await prisma_js_1.prisma.propertyRequirement.groupBy({
            by: ['status'],
            _count: { id: true },
        });
        return {
            totalLeads,
            enquiriesByStatus,
            requirementsByStatus,
        };
    }
    static async getUserAdAnalytics(userId) {
        const userProperties = await prisma_js_1.prisma.property.findMany({
            where: { userId },
            select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                viewsCount: true,
                phoneClicks: true,
                whatsappClicks: true,
                adStartDate: true,
                adExpiryDate: true,
                isAdvertisement: true,
                adDuration: true,
                createdAt: true,
                _count: {
                    select: {
                        enquiries: true,
                        favourites: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const totalViews = userProperties.reduce((sum, p) => sum + p.viewsCount, 0);
        const totalPhoneClicks = userProperties.reduce((sum, p) => sum + p.phoneClicks, 0);
        const totalWhatsappClicks = userProperties.reduce((sum, p) => sum + p.whatsappClicks, 0);
        const totalEnquiries = userProperties.reduce((sum, p) => sum + p._count.enquiries, 0);
        const totalFavourites = userProperties.reduce((sum, p) => sum + p._count.favourites, 0);
        return {
            overview: {
                totalAds: userProperties.length,
                totalViews,
                totalPhoneClicks,
                totalWhatsappClicks,
                totalEnquiries,
                totalFavourites,
            },
            properties: userProperties,
        };
    }
}
exports.AnalyticsService = AnalyticsService;
