"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const eventBus_js_1 = require("../events/eventBus.js");
class SearchController {
    static async globalSearch(req, res) {
        const q = (req.query.q || '').trim();
        const type = req.query.type; // 'all', 'properties', 'articles', 'videos'
        if (!q) {
            return res.json({
                success: true,
                properties: [],
                articles: [],
                videos: [],
                total: 0,
            });
        }
        // Log search event
        eventBus_js_1.eventBus.emitEvent(eventBus_js_1.AppEvents.ANALYTICS_EVENT, {
            eventType: 'SEARCH',
            metadata: { query: q, type },
            userId: req.user?.id || null,
            ipAddress: req.ip,
        });
        const searchPromises = [];
        // Properties search
        if (!type || type === 'all' || type === 'properties') {
            searchPromises.push(prisma_js_1.prisma.property.findMany({
                where: {
                    isPublished: true,
                    status: 'APPROVED',
                    OR: [
                        { title: { contains: q } },
                        { description: { contains: q } },
                        { location: { contains: q } },
                        { city: { contains: q } },
                    ],
                },
                take: 12,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { name: true, verificationStatus: true } },
                },
            }));
        }
        else {
            searchPromises.push(Promise.resolve([]));
        }
        // Articles search (news & real estate)
        if (!type || type === 'all' || type === 'articles') {
            searchPromises.push(prisma_js_1.prisma.article.findMany({
                where: {
                    isPublished: true,
                    category: { in: ['NEWS', 'REAL_ESTATE', 'ANNOUNCEMENT'] },
                    OR: [
                        { title: { contains: q } },
                        { content: { contains: q } },
                        { excerpt: { contains: q } },
                    ],
                },
                take: 8,
                orderBy: { publishedAt: 'desc' },
            }));
        }
        else {
            searchPromises.push(Promise.resolve([]));
        }
        // Video news search
        if (!type || type === 'all' || type === 'videos') {
            searchPromises.push(prisma_js_1.prisma.article.findMany({
                where: {
                    isPublished: true,
                    category: 'VIDEO_NEWS',
                    OR: [
                        { title: { contains: q } },
                        { content: { contains: q } },
                    ],
                },
                take: 8,
                orderBy: { publishedAt: 'desc' },
            }));
        }
        else {
            searchPromises.push(Promise.resolve([]));
        }
        const [properties, articles, videos] = await Promise.all(searchPromises);
        return res.json({
            success: true,
            query: q,
            properties,
            articles,
            videos,
            total: properties.length + articles.length + videos.length,
        });
    }
}
exports.SearchController = SearchController;
