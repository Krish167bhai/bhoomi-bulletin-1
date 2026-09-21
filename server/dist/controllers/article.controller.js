"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const eventBus_js_1 = require("../events/eventBus.js");
class ArticleController {
    static async getPublishedArticles(req, res) {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
        const skip = (page - 1) * limit;
        const { category, tag } = req.query;
        const where = { isPublished: true };
        if (category && category !== 'ALL') {
            where.category = category;
        }
        if (tag) {
            where.tags = { contains: String(tag) };
        }
        const [total, articles] = await Promise.all([
            prisma_js_1.prisma.article.count({ where }),
            prisma_js_1.prisma.article.findMany({
                where,
                orderBy: { publishedAt: 'desc' },
                skip,
                take: limit,
                include: {
                    author: { select: { id: true, name: true, avatar: true } },
                },
            }),
        ]);
        return res.json({
            success: true,
            articles,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    static async getArticleBySlug(req, res) {
        const slug = req.params.slug;
        const article = await prisma_js_1.prisma.article.findFirst({
            where: {
                OR: [{ slug }, { id: slug }],
            },
            include: {
                author: { select: { id: true, name: true, avatar: true, bio: true } },
            },
        });
        if (!article) {
            return res.status(404).json({ success: false, message: 'Article not found' });
        }
        // Log article view event asynchronously
        eventBus_js_1.eventBus.emitEvent(eventBus_js_1.AppEvents.ANALYTICS_EVENT, {
            eventType: 'ARTICLE_VIEW',
            targetId: article.id,
            targetType: 'ARTICLE',
            userId: req.user?.id || null,
            ipAddress: req.ip,
        });
        // Related articles
        const related = await prisma_js_1.prisma.article.findMany({
            where: {
                isPublished: true,
                category: article.category,
                id: { not: article.id },
            },
            take: 4,
            orderBy: { publishedAt: 'desc' },
            include: { author: { select: { name: true } } },
        });
        return res.json({ success: true, article, related });
    }
    // Videos page: Real estate video content (Requirement 2 & 5)
    static async getVideoNews(req, res) {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(30, Math.max(1, parseInt(req.query.limit) || 12));
        const skip = (page - 1) * limit;
        const where = {
            isPublished: true,
            category: 'VIDEO_NEWS',
        };
        const [total, videos] = await Promise.all([
            prisma_js_1.prisma.article.count({ where }),
            prisma_js_1.prisma.article.findMany({
                where,
                orderBy: { publishedAt: 'desc' },
                skip,
                take: limit,
                include: {
                    author: { select: { name: true } },
                },
            }),
        ]);
        return res.json({
            success: true,
            videos,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    }
}
exports.ArticleController = ArticleController;
