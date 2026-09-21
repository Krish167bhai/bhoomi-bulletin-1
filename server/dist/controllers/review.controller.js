"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const zod_1 = require("zod");
const prisma_js_1 = require("../config/prisma.js");
const eventBus_js_1 = require("../events/eventBus.js");
const reviewSchema = zod_1.z.object({
    propertyId: zod_1.z.string().optional().nullable(),
    agentId: zod_1.z.string().optional().nullable(),
    rating: zod_1.z.coerce.number().min(1).max(5),
    title: zod_1.z.string().optional().nullable(),
    content: zod_1.z.string().min(5, 'Review content must be at least 5 characters').max(1000),
});
class ReviewController {
    static async submitReview(req, res) {
        if (!req.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const validated = reviewSchema.parse(req.body);
        if (!validated.propertyId && !validated.agentId) {
            return res.status(400).json({ success: false, message: 'Review must be associated with a property or agent' });
        }
        // Check duplicate review within 24 hours to prevent spam (Requirement 14)
        const recentReview = await prisma_js_1.prisma.review.findFirst({
            where: {
                userId: req.user.id,
                ...(validated.propertyId ? { propertyId: validated.propertyId } : { agentId: validated.agentId }),
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
            },
        });
        if (recentReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted a review for this listing recently. Please wait before submitting another.',
            });
        }
        const review = await prisma_js_1.prisma.review.create({
            data: {
                userId: req.user.id,
                propertyId: validated.propertyId || null,
                agentId: validated.agentId || null,
                rating: Math.round(validated.rating),
                title: validated.title || null,
                content: validated.content,
                status: 'PENDING', // Non-negotiable requirement 14: only approved reviews become publicly visible
            },
        });
        eventBus_js_1.eventBus.emitEvent(eventBus_js_1.AppEvents.REVIEW_SUBMITTED, review);
        return res.status(201).json({
            success: true,
            message: 'Review submitted! It will be published after quick moderation by our team.',
            review,
        });
    }
    static async getPropertyReviews(req, res) {
        const propertyId = req.params.propertyId;
        const reviews = await prisma_js_1.prisma.review.findMany({
            where: {
                propertyId,
                status: 'APPROVED',
            },
            include: {
                user: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        const total = reviews.length;
        const average = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
        const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach((r) => {
            breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
        });
        return res.json({
            success: true,
            reviews,
            stats: {
                total,
                average: parseFloat(average.toFixed(1)),
                breakdown,
            },
        });
    }
    static async getMyReviews(req, res) {
        if (!req.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const reviews = await prisma_js_1.prisma.review.findMany({
            where: { userId: req.user.id },
            include: {
                property: { select: { id: true, title: true, slug: true, featuredImage: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ success: true, reviews });
    }
}
exports.ReviewController = ReviewController;
