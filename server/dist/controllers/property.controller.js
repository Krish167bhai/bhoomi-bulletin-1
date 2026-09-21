"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyController = exports.calculateAdExpiry = void 0;
const zod_1 = require("zod");
const prisma_js_1 = require("../config/prisma.js");
const eventBus_js_1 = require("../events/eventBus.js");
// Duration calculation helper
const calculateAdExpiry = (startDate, duration) => {
    const expiry = new Date(startDate);
    switch (duration) {
        case 'WEEK_1':
            expiry.setDate(expiry.getDate() + 7);
            break;
        case 'MONTH_1':
            expiry.setMonth(expiry.getMonth() + 1);
            break;
        case 'MONTH_2':
            expiry.setMonth(expiry.getMonth() + 2);
            break;
        case 'MONTH_3':
            expiry.setMonth(expiry.getMonth() + 3);
            break;
        case 'MONTH_6':
            expiry.setMonth(expiry.getMonth() + 6);
            break;
        case 'YEAR_1':
            expiry.setFullYear(expiry.getFullYear() + 1);
            break;
        case 'YEAR_2':
            expiry.setFullYear(expiry.getFullYear() + 2);
            break;
        default:
            expiry.setMonth(expiry.getMonth() + 1);
    }
    return expiry;
};
exports.calculateAdExpiry = calculateAdExpiry;
const createPropertySchema = zod_1.z.object({
    title: zod_1.z.string().min(5, 'Title must be at least 5 characters'),
    description: zod_1.z.string().min(10, 'Description must be at least 10 characters'),
    propertyType: zod_1.z.enum(['APARTMENT', 'VILLA', 'HOUSE', 'PLOT_LAND', 'SHOP', 'OFFICE', 'WAREHOUSE', 'COMMERCIAL', 'OTHER']),
    listingType: zod_1.z.enum(['BUY', 'RENT', 'INVEST']).default('BUY'),
    userType: zod_1.z.enum(['OWNER', 'BROKER', 'AGENT']).default('OWNER'),
    price: zod_1.z.coerce.number().positive('Price must be greater than zero'),
    priceNegotiable: zod_1.z.boolean().optional().default(false),
    location: zod_1.z.string().min(3, 'Location is required'),
    city: zod_1.z.string().min(2, 'City is required'),
    state: zod_1.z.string().optional(),
    pincode: zod_1.z.string().optional(),
    sizeSqFt: zod_1.z.coerce.number().positive('Size in Sq Ft is required'),
    bedrooms: zod_1.z.coerce.number().optional().nullable(),
    bathrooms: zod_1.z.coerce.number().optional().nullable(),
    furnishing: zod_1.z.string().optional().nullable(),
    features: zod_1.z.array(zod_1.z.string()).optional().default([]),
    amenities: zod_1.z.array(zod_1.z.string()).optional().default([]),
    additionalInfo: zod_1.z.string().optional().nullable(),
    photos: zod_1.z.array(zod_1.z.string()).optional().default([]),
    videoUrl: zod_1.z.string().optional().nullable(),
    featuredImage: zod_1.z.string().optional().nullable(),
    adDuration: zod_1.z.enum(['WEEK_1', 'MONTH_1', 'MONTH_2', 'MONTH_3', 'MONTH_6', 'YEAR_1', 'YEAR_2']).default('MONTH_1'),
    isAdvertisement: zod_1.z.boolean().optional().default(true),
});
class PropertyController {
    // Public listing with filters & pagination
    static async getPublishedProperties(req, res) {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
        const skip = (page - 1) * limit;
        const { propertyType, listingType, city, location, minPrice, maxPrice, bedrooms, verifiedOnly, featuredOnly, sortBy, q, } = req.query;
        const where = {
            isPublished: true,
            status: 'APPROVED',
        };
        if (propertyType && propertyType !== 'ALL') {
            where.propertyType = propertyType;
        }
        if (listingType && listingType !== 'ALL') {
            where.listingType = listingType;
        }
        if (city) {
            where.city = { contains: String(city) };
        }
        if (location) {
            where.location = { contains: String(location) };
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = parseFloat(minPrice);
            if (maxPrice)
                where.price.lte = parseFloat(maxPrice);
        }
        if (bedrooms && bedrooms !== 'ANY') {
            where.bedrooms = parseInt(bedrooms);
        }
        if (verifiedOnly === 'true') {
            where.verificationStatus = 'VERIFIED';
        }
        if (featuredOnly === 'true') {
            where.isFeatured = true;
        }
        if (q) {
            where.OR = [
                { title: { contains: String(q) } },
                { description: { contains: String(q) } },
                { location: { contains: String(q) } },
                { city: { contains: String(q) } },
            ];
        }
        let orderBy = { createdAt: 'desc' };
        if (sortBy === 'price_asc')
            orderBy = { price: 'asc' };
        else if (sortBy === 'price_desc')
            orderBy = { price: 'desc' };
        else if (sortBy === 'views_desc')
            orderBy = { viewsCount: 'desc' };
        else if (sortBy === 'featured')
            orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
        const [total, properties] = await Promise.all([
            prisma_js_1.prisma.property.count({ where }),
            prisma_js_1.prisma.property.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                            role: true,
                            userType: true,
                            verificationStatus: true,
                            companyName: true,
                        },
                    },
                    _count: {
                        select: { reviews: true, enquiries: true },
                    },
                },
            }),
        ]);
        return res.json({
            success: true,
            properties,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    // Get single property by slug or ID
    static async getPropertyBySlug(req, res) {
        const slug = req.params.slug;
        const property = await prisma_js_1.prisma.property.findFirst({
            where: {
                OR: [{ slug }, { id: slug }],
            },
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
                        companyName: true,
                        avatar: true,
                        bio: true,
                    },
                },
                reviews: {
                    where: { status: 'APPROVED' },
                    include: {
                        user: {
                            select: { id: true, name: true, avatar: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: { favourites: true, enquiries: true, reviews: true },
                },
            },
        });
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        // Check if favorited by current user if authenticated
        let isFavourited = false;
        if (req.user) {
            const fav = await prisma_js_1.prisma.favouriteProperty.findUnique({
                where: {
                    userId_propertyId: {
                        userId: req.user.id,
                        propertyId: property.id,
                    },
                },
            });
            isFavourited = Boolean(fav);
        }
        // Log view event asynchronously
        eventBus_js_1.eventBus.emitEvent(eventBus_js_1.AppEvents.ANALYTICS_EVENT, {
            eventType: 'PROPERTY_VIEW',
            targetId: property.id,
            targetType: 'PROPERTY',
            userId: req.user?.id || null,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return res.json({
            success: true,
            property: {
                ...property,
                isFavourited,
            },
        });
    }
    // User submits property/advertisement (Requires Approval - Requirement 17)
    static async submitProperty(req, res) {
        if (!req.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const validated = createPropertySchema.parse(req.body);
        const slugBase = validated.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 50);
        const slug = `${slugBase}-${Date.now().toString().slice(-6)}`;
        const featuredImg = validated.featuredImage || (validated.photos.length > 0 ? validated.photos[0] : null);
        const newProperty = await prisma_js_1.prisma.property.create({
            data: {
                userId: req.user.id,
                title: validated.title,
                slug,
                description: validated.description,
                propertyType: validated.propertyType,
                listingType: validated.listingType,
                userType: (req.user.role === 'BROKER' ? 'BROKER' : req.user.role === 'AGENT' ? 'AGENT' : validated.userType),
                price: validated.price,
                priceNegotiable: validated.priceNegotiable,
                location: validated.location,
                city: validated.city,
                state: validated.state || null,
                pincode: validated.pincode || null,
                sizeSqFt: validated.sizeSqFt,
                bedrooms: validated.bedrooms || null,
                bathrooms: validated.bathrooms || null,
                furnishing: validated.furnishing || null,
                features: JSON.stringify(validated.features),
                amenities: JSON.stringify(validated.amenities),
                additionalInfo: validated.additionalInfo || null,
                photos: JSON.stringify(validated.photos),
                videoUrl: validated.videoUrl || null,
                featuredImage: featuredImg,
                status: 'PENDING_APPROVAL', // Non-negotiable requirement 17: User NEVER directly publishes
                isPublished: false,
                isAdvertisement: validated.isAdvertisement,
                adDuration: validated.adDuration,
            },
        });
        // Emit event to notify admins and user
        eventBus_js_1.eventBus.emitEvent(eventBus_js_1.AppEvents.PROPERTY_SUBMITTED, newProperty);
        return res.status(201).json({
            success: true,
            message: 'Property submitted successfully! It is now pending Admin review before going live.',
            property: newProperty,
        });
    }
    // User's own properties (Active, Pending, Expired)
    static async getMyProperties(req, res) {
        if (!req.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { status } = req.query;
        const where = { userId: req.user.id };
        if (status)
            where.status = status;
        const properties = await prisma_js_1.prisma.property.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { enquiries: true, favourites: true },
                },
            },
        });
        return res.json({ success: true, properties });
    }
    // Comparison Matrix (2 to 4 properties) - Requirement 13
    static async compareProperties(req, res) {
        const ids = req.query.ids;
        if (!ids) {
            return res.status(400).json({ success: false, message: 'Property IDs required for comparison' });
        }
        const idList = ids.split(',').slice(0, 4); // Max 4 properties
        const properties = await prisma_js_1.prisma.property.findMany({
            where: {
                id: { in: idList },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        verificationStatus: true,
                        companyName: true,
                    },
                },
            },
        });
        // Log comparison event
        eventBus_js_1.eventBus.emitEvent(eventBus_js_1.AppEvents.ANALYTICS_EVENT, {
            eventType: 'COMPARE',
            metadata: { ids: idList },
            userId: req.user?.id || null,
        });
        return res.json({ success: true, properties });
    }
    // Favourites management - Requirement 11
    static async toggleFavourite(req, res) {
        if (!req.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { propertyId } = req.body;
        if (!propertyId)
            return res.status(400).json({ success: false, message: 'propertyId is required' });
        const existing = await prisma_js_1.prisma.favouriteProperty.findUnique({
            where: {
                userId_propertyId: {
                    userId: req.user.id,
                    propertyId,
                },
            },
        });
        if (existing) {
            await prisma_js_1.prisma.favouriteProperty.delete({
                where: { id: existing.id },
            });
            return res.json({ success: true, isFavourited: false, message: 'Removed from favourites' });
        }
        else {
            await prisma_js_1.prisma.favouriteProperty.create({
                data: {
                    userId: req.user.id,
                    propertyId,
                },
            });
            // Track favourite event
            eventBus_js_1.eventBus.emitEvent(eventBus_js_1.AppEvents.ANALYTICS_EVENT, {
                eventType: 'FAVOURITE',
                targetId: propertyId,
                targetType: 'PROPERTY',
                userId: req.user.id,
            });
            return res.json({ success: true, isFavourited: true, message: 'Saved to favourites' });
        }
    }
    static async getMyFavourites(req, res) {
        if (!req.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const favourites = await prisma_js_1.prisma.favouriteProperty.findMany({
            where: { userId: req.user.id },
            include: {
                property: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                role: true,
                                verificationStatus: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({
            success: true,
            favourites: favourites.map((f) => ({
                ...f.property,
                favouriteId: f.id,
                savedAt: f.createdAt,
            })),
        });
    }
    static async deleteProperty(req, res) {
        if (!req.user)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { id } = req.params;
        const property = await prisma_js_1.prisma.property.findUnique({ where: { id: id } });
        if (!property)
            return res.status(404).json({ success: false, message: 'Property not found' });
        if (property.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        await prisma_js_1.prisma.property.delete({ where: { id: id } });
        return res.json({ success: true, message: 'Property deleted successfully' });
    }
}
exports.PropertyController = PropertyController;
