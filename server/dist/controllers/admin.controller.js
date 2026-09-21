"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const prisma_js_1 = require("../config/prisma.js");
const eventBus_js_1 = require("../events/eventBus.js");
const property_controller_js_1 = require("./property.controller.js");
const analytics_service_js_1 = require("../services/analytics.service.js");
const settings_service_js_1 = require("../services/settings.service.js");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class AdminController {
    // 1. Dashboard Overview - Requirement 19
    static async getDashboardStats(_req, res) {
        const stats = await analytics_service_js_1.AnalyticsService.getWebsiteOverview();
        return res.json({ success: true, stats });
    }
    // 2. Pending Submissions Queue - Requirement 17
    static async getPendingSubmissions(_req, res) {
        const properties = await prisma_js_1.prisma.property.findMany({
            where: { status: 'PENDING_APPROVAL' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        userType: true,
                        verificationStatus: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ success: true, properties });
    }
    // 3. Approve Property Submission & Publish - Requirement 7, 17
    static async approveProperty(req, res) {
        const id = req.params.id;
        const { duration, isFeatured, verified } = req.body;
        const property = await prisma_js_1.prisma.property.findUnique({
            where: { id },
        });
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        const adDuration = duration || property.adDuration;
        const startDate = new Date();
        const expiryDate = (0, property_controller_js_1.calculateAdExpiry)(startDate, adDuration);
        const updated = await prisma_js_1.prisma.property.update({
            where: { id },
            data: {
                status: 'APPROVED',
                isPublished: true,
                publishedAt: startDate,
                adStartDate: startDate,
                adExpiryDate: expiryDate,
                adDuration,
                isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : property.isFeatured,
                verificationStatus: verified ? 'VERIFIED' : property.verificationStatus,
                verifiedAt: verified ? new Date() : property.verifiedAt,
            },
            include: { user: true },
        });
        // Emit event to trigger user notification and saved search matching!
        eventBus_js_1.eventBus.emitEvent(eventBus_js_1.AppEvents.PROPERTY_APPROVED, updated);
        return res.json({
            success: true,
            message: 'Property approved, activated, and published successfully!',
            property: updated,
        });
    }
    // 4. Reject Property Submission - Requirement 17
    static async rejectProperty(req, res) {
        const id = req.params.id;
        const { reason } = req.body;
        const property = await prisma_js_1.prisma.property.findUnique({
            where: { id },
        });
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        const updated = await prisma_js_1.prisma.property.update({
            where: { id },
            data: {
                status: 'REJECTED',
                isPublished: false,
                verificationNotes: reason || 'Submission rejected by administrator.',
            },
        });
        eventBus_js_1.eventBus.emitEvent(eventBus_js_1.AppEvents.PROPERTY_REJECTED, { property: updated, reason });
        return res.json({
            success: true,
            message: 'Property submission rejected.',
            property: updated,
        });
    }
    // 5. Admin Direct Post Creation - Requirement 18
    static async createPost(req, res) {
        if (!req.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { postType, // ARTICLE, PROPERTY_AD, VIDEO_NEWS, ANNOUNCEMENT
        title, content, category, excerpt, featuredImage, videoUrl, tags, 
        // Property specific fields if postType is PROPERTY_AD
        propertyType, listingType, price, location, city, sizeSqFt, bedrooms, bathrooms, photos, duration, isFeatured, publishImmediately, } = req.body;
        if (postType === 'PROPERTY_AD') {
            const slugBase = (title || 'ad')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
                .slice(0, 50);
            const slug = `${slugBase}-${Date.now().toString().slice(-6)}`;
            const adDuration = duration || 'MONTH_1';
            const startDate = new Date();
            const expiryDate = (0, property_controller_js_1.calculateAdExpiry)(startDate, adDuration);
            const property = await prisma_js_1.prisma.property.create({
                data: {
                    userId: req.user.id,
                    title,
                    slug,
                    description: content || title,
                    propertyType: (propertyType || 'APARTMENT'),
                    listingType: (listingType || 'BUY'),
                    userType: 'OWNER',
                    price: parseFloat(price) || 0,
                    location: location || 'Delhi',
                    city: city || 'Delhi',
                    sizeSqFt: parseFloat(sizeSqFt) || 1000,
                    bedrooms: bedrooms ? parseInt(bedrooms) : null,
                    bathrooms: bathrooms ? parseInt(bathrooms) : null,
                    featuredImage: featuredImage || (photos && photos.length > 0 ? photos[0] : null),
                    photos: JSON.stringify(photos || []),
                    videoUrl: videoUrl || null,
                    status: publishImmediately ? 'APPROVED' : 'DRAFT',
                    isPublished: Boolean(publishImmediately),
                    publishedAt: publishImmediately ? startDate : null,
                    adStartDate: publishImmediately ? startDate : null,
                    adExpiryDate: publishImmediately ? expiryDate : null,
                    adDuration: adDuration,
                    isFeatured: Boolean(isFeatured),
                    verificationStatus: 'VERIFIED',
                },
            });
            return res.status(201).json({
                success: true,
                message: 'Property advertisement created successfully by Admin.',
                property,
            });
        }
        // Otherwise create Article / News / Video Post
        const slugBase = (title || 'news')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 50);
        const slug = `${slugBase}-${Date.now().toString().slice(-6)}`;
        const article = await prisma_js_1.prisma.article.create({
            data: {
                authorId: req.user.id,
                title,
                slug,
                category: (category || (postType === 'VIDEO_NEWS' ? 'VIDEO_NEWS' : 'NEWS')),
                content: content || '',
                excerpt: excerpt || content?.slice(0, 200) || '',
                featuredImage: featuredImage || null,
                videoUrl: videoUrl || null,
                tags: JSON.stringify(tags || []),
                isPublished: publishImmediately !== undefined ? Boolean(publishImmediately) : true,
            },
        });
        return res.status(201).json({
            success: true,
            message: 'Article/Post created successfully.',
            article,
        });
    }
    // 6. Manage All Properties & Advertisements - Requirement 7, 18
    static async getAllProperties(req, res) {
        const { status, type, city, isAd, page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const where = {};
        if (status)
            where.status = status;
        if (type)
            where.propertyType = type;
        if (city)
            where.city = { contains: String(city) };
        if (isAd !== undefined)
            where.isAdvertisement = isAd === 'true';
        const [total, properties] = await Promise.all([
            prisma_js_1.prisma.property.count({ where }),
            prisma_js_1.prisma.property.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
                include: {
                    user: {
                        select: { id: true, name: true, email: true, phone: true, role: true, verificationStatus: true },
                    },
                },
            }),
        ]);
        return res.json({
            success: true,
            properties,
            pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
        });
    }
    // Update property / ad settings - Requirement 7
    static async updatePropertyAdmin(req, res) {
        const id = req.params.id;
        const { title, description, price, status, isPublished, adDuration, adStartDate, adExpiryDate, renewDuration, isFeatured, isBoosted, verificationStatus, } = req.body;
        const current = await prisma_js_1.prisma.property.findUnique({ where: { id } });
        if (!current)
            return res.status(404).json({ success: false, message: 'Property not found' });
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (price !== undefined)
            updateData.price = parseFloat(price);
        if (status !== undefined)
            updateData.status = status;
        if (isPublished !== undefined)
            updateData.isPublished = Boolean(isPublished);
        if (adDuration !== undefined)
            updateData.adDuration = adDuration;
        if (adStartDate !== undefined)
            updateData.adStartDate = new Date(adStartDate);
        if (adExpiryDate !== undefined)
            updateData.adExpiryDate = new Date(adExpiryDate);
        if (isFeatured !== undefined)
            updateData.isFeatured = Boolean(isFeatured);
        if (isBoosted !== undefined)
            updateData.isBoosted = Boolean(isBoosted);
        if (verificationStatus !== undefined) {
            updateData.verificationStatus = verificationStatus;
            if (verificationStatus === 'VERIFIED')
                updateData.verifiedAt = new Date();
        }
        // If Admin triggers renew:
        if (renewDuration) {
            const start = new Date();
            const expiry = (0, property_controller_js_1.calculateAdExpiry)(start, renewDuration);
            updateData.adStartDate = start;
            updateData.adExpiryDate = expiry;
            updateData.adDuration = renewDuration;
            updateData.status = 'APPROVED';
            updateData.isPublished = true;
        }
        const updated = await prisma_js_1.prisma.property.update({
            where: { id },
            data: updateData,
        });
        return res.json({
            success: true,
            message: 'Property updated successfully',
            property: updated,
        });
    }
    // Delete property
    static async deleteProperty(req, res) {
        const id = req.params.id;
        await prisma_js_1.prisma.property.delete({ where: { id } });
        return res.json({ success: true, message: 'Property deleted successfully' });
    }
    // 7. Manage Articles / News
    static async getAllArticles(_req, res) {
        const articles = await prisma_js_1.prisma.article.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { id: true, name: true, email: true } },
            },
        });
        return res.json({ success: true, articles });
    }
    static async updateArticle(req, res) {
        const id = req.params.id;
        const { title, content, excerpt, category, featuredImage, videoUrl, isPublished } = req.body;
        const updated = await prisma_js_1.prisma.article.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(content !== undefined && { content }),
                ...(excerpt !== undefined && { excerpt }),
                ...(category && { category }),
                ...(featuredImage !== undefined && { featuredImage }),
                ...(videoUrl !== undefined && { videoUrl }),
                ...(isPublished !== undefined && { isPublished: Boolean(isPublished) }),
            },
        });
        return res.json({ success: true, article: updated });
    }
    static async deleteArticle(req, res) {
        const id = req.params.id;
        await prisma_js_1.prisma.article.delete({ where: { id } });
        return res.json({ success: true, message: 'Article deleted successfully' });
    }
    // 8. Manage Users & Verification - Requirement 15, 23
    static async getAllUsers(_req, res) {
        const users = await prisma_js_1.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                userType: true,
                verificationStatus: true,
                companyName: true,
                licenseNumber: true,
                createdAt: true,
                _count: {
                    select: { properties: true, enquiriesSent: true, enquiriesReceived: true },
                },
            },
        });
        return res.json({ success: true, users });
    }
    // Update user verification - Requirement 15
    static async updateUserVerification(req, res) {
        const id = req.params.id;
        const { status, notes } = req.body; // NONE, PENDING, VERIFIED, REJECTED
        const updated = await prisma_js_1.prisma.user.update({
            where: { id },
            data: {
                verificationStatus: status,
            },
        });
        eventBus_js_1.eventBus.emitEvent(eventBus_js_1.AppEvents.VERIFICATION_UPDATED, { userId: id, status, notes });
        return res.json({
            success: true,
            message: `User verification updated to: ${status}`,
            user: updated,
        });
    }
    // Review Information Change Requests - Requirement 23
    static async getInfoChangeRequests(_req, res) {
        const requests = await prisma_js_1.prisma.informationChangeRequest.findMany({
            include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ success: true, requests });
    }
    static async resolveInfoChangeRequest(req, res) {
        const id = req.params.id;
        const { action, adminNotes } = req.body; // 'APPROVE' or 'REJECT'
        const request = await prisma_js_1.prisma.informationChangeRequest.findUnique({
            where: { id },
            include: { user: true },
        });
        if (!request)
            return res.status(404).json({ success: false, message: 'Request not found' });
        if (action === 'APPROVE') {
            const updateData = {};
            if (request.requestedName)
                updateData.name = request.requestedName;
            if (request.requestedEmail)
                updateData.email = request.requestedEmail;
            if (request.requestedPhone)
                updateData.phone = request.requestedPhone;
            await prisma_js_1.prisma.$transaction([
                prisma_js_1.prisma.user.update({
                    where: { id: request.userId },
                    data: updateData,
                }),
                prisma_js_1.prisma.informationChangeRequest.update({
                    where: { id },
                    data: {
                        status: 'APPROVED',
                        adminNotes,
                        resolvedAt: new Date(),
                    },
                }),
            ]);
        }
        else {
            await prisma_js_1.prisma.informationChangeRequest.update({
                where: { id },
                data: {
                    status: 'REJECTED',
                    adminNotes,
                    resolvedAt: new Date(),
                },
            });
        }
        return res.json({ success: true, message: `Information change request ${action.toLowerCase()}d.` });
    }
    // 9. Lead CRM Management - Requirement 10, 16
    static async getAllLeads(_req, res) {
        const [enquiries, requirements] = await Promise.all([
            prisma_js_1.prisma.enquiry.findMany({
                include: {
                    property: { select: { id: true, title: true, location: true, price: true } },
                    receiverUser: { select: { id: true, name: true, phone: true } },
                    notes: { orderBy: { createdAt: 'desc' } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma_js_1.prisma.propertyRequirement.findMany({
                include: {
                    notes: { orderBy: { createdAt: 'desc' } },
                },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return res.json({
            success: true,
            enquiries,
            requirements,
        });
    }
    // Update lead status
    static async updateLeadStatus(req, res) {
        const id = req.params.id;
        const { leadType, status, note, followUpDate } = req.body;
        if (leadType === 'ENQUIRY') {
            await prisma_js_1.prisma.enquiry.update({
                where: { id },
                data: { status },
            });
        }
        else {
            await prisma_js_1.prisma.propertyRequirement.update({
                where: { id },
                data: { status },
            });
        }
        if (note && req.user) {
            await prisma_js_1.prisma.leadNote.create({
                data: {
                    authorId: req.user.id,
                    enquiryId: leadType === 'ENQUIRY' ? id : null,
                    requirementId: leadType === 'REQUIREMENT' ? id : null,
                    note,
                    actionType: 'STATUS_CHANGE',
                    nextFollowUp: followUpDate ? new Date(followUpDate) : null,
                },
            });
        }
        return res.json({ success: true, message: 'Lead status and activity updated.' });
    }
    // 10. Reviews Moderation - Requirement 14
    static async getAllReviews(_req, res) {
        const reviews = await prisma_js_1.prisma.review.findMany({
            include: {
                user: { select: { id: true, name: true, email: true } },
                property: { select: { id: true, title: true, slug: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ success: true, reviews });
    }
    static async moderateReview(req, res) {
        const id = req.params.id;
        const { status } = req.body; // APPROVED, REJECTED
        const review = await prisma_js_1.prisma.review.update({
            where: { id },
            data: { status },
        });
        return res.json({ success: true, message: `Review ${status.toLowerCase()} successfully`, review });
    }
    static async deleteReview(req, res) {
        const id = req.params.id;
        await prisma_js_1.prisma.review.delete({ where: { id } });
        return res.json({ success: true, message: 'Review deleted successfully' });
    }
    // 11. Media Library Management - Requirement 30
    static async getMediaItems(_req, res) {
        const media = await prisma_js_1.prisma.mediaItem.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                uploader: { select: { id: true, name: true } },
            },
        });
        return res.json({ success: true, media });
    }
    static async deleteMediaItem(req, res) {
        const id = req.params.id;
        const item = await prisma_js_1.prisma.mediaItem.findUnique({ where: { id } });
        if (item) {
            try {
                const filePath = path_1.default.join(process.cwd(), item.url);
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
            }
            catch (err) {
                console.warn('Could not unlink media file:', err);
            }
            await prisma_js_1.prisma.mediaItem.delete({ where: { id } });
        }
        return res.json({ success: true, message: 'Media item deleted' });
    }
    // 12. Settings & Branding Management - Requirement 4, 41
    static async getSettings(_req, res) {
        const settings = await settings_service_js_1.SettingsService.getAllSettings();
        return res.json({ success: true, settings });
    }
    static async updateSettings(req, res) {
        const updated = await settings_service_js_1.SettingsService.updateSettings(req.body);
        return res.json({ success: true, message: 'Settings saved successfully', settings: updated });
    }
}
exports.AdminController = AdminController;
