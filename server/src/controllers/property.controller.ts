import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { eventBus, AppEvents } from '../events/eventBus.js';

// Duration calculation helper
export const calculateAdExpiry = (startDate: Date, duration: string): Date => {
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

const createPropertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  propertyType: z.enum(['APARTMENT', 'VILLA', 'HOUSE', 'PLOT_LAND', 'SHOP', 'OFFICE', 'WAREHOUSE', 'COMMERCIAL', 'OTHER']),
  listingType: z.enum(['BUY', 'RENT', 'INVEST']).default('BUY'),
  userType: z.enum(['OWNER', 'BROKER', 'AGENT']).default('OWNER'),
  price: z.coerce.number().positive('Price must be greater than zero'),
  priceNegotiable: z.boolean().optional().default(false),
  location: z.string().min(3, 'Location is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional(),
  pincode: z.string().optional(),
  sizeSqFt: z.coerce.number().positive('Size in Sq Ft is required'),
  bedrooms: z.coerce.number().optional().nullable(),
  bathrooms: z.coerce.number().optional().nullable(),
  furnishing: z.string().optional().nullable(),
  features: z.array(z.string()).optional().default([]),
  amenities: z.array(z.string()).optional().default([]),
  additionalInfo: z.string().optional().nullable(),
  photos: z.array(z.string()).optional().default([]),
  videoUrl: z.string().optional().nullable(),
  featuredImage: z.string().optional().nullable(),
  adDuration: z.enum(['WEEK_1', 'MONTH_1', 'MONTH_2', 'MONTH_3', 'MONTH_6', 'YEAR_1', 'YEAR_2']).default('MONTH_1'),
  isAdvertisement: z.boolean().optional().default(true),
});

export class PropertyController {
  // Public listing with filters & pagination
  static async getPublishedProperties(req: Request, res: Response) {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const skip = (page - 1) * limit;

    const {
      propertyType,
      listingType,
      city,
      location,
      minPrice,
      maxPrice,
      bedrooms,
      verifiedOnly,
      featuredOnly,
      sortBy,
      q,
    } = req.query;

    const where: any = {
      isPublished: true,
      status: 'APPROVED',
    };

    if (propertyType && propertyType !== 'ALL') {
      where.propertyType = propertyType as any;
    }
    if (listingType && listingType !== 'ALL') {
      where.listingType = listingType as any;
    }
    if (city) {
      where.city = { contains: String(city) };
    }
    if (location) {
      where.location = { contains: String(location) };
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }
    if (bedrooms && bedrooms !== 'ANY') {
      where.bedrooms = parseInt(bedrooms as string);
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

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    else if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    else if (sortBy === 'views_desc') orderBy = { viewsCount: 'desc' };
    else if (sortBy === 'featured') orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];

    const [total, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
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
  static async getPropertyBySlug(req: Request, res: Response) {
    const slug = req.params.slug as string;

    const property = await prisma.property.findFirst({
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
      const fav = await prisma.favouriteProperty.findUnique({
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
    eventBus.emitEvent(AppEvents.ANALYTICS_EVENT, {
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
  static async submitProperty(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const validated = createPropertySchema.parse(req.body);

    const slugBase = validated.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);
    const slug = `${slugBase}-${Date.now().toString().slice(-6)}`;

    const featuredImg = validated.featuredImage || (validated.photos.length > 0 ? validated.photos[0] : null);

    const newProperty = await prisma.property.create({
      data: {
        userId: req.user.id,
        title: validated.title,
        slug,
        description: validated.description,
        propertyType: validated.propertyType as any,
        listingType: validated.listingType as any,
        userType: (req.user.role === 'BROKER' ? 'BROKER' : req.user.role === 'AGENT' ? 'AGENT' : validated.userType) as any,
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
        adDuration: validated.adDuration as any,
      },
    });

    // Emit event to notify admins and user
    eventBus.emitEvent(AppEvents.PROPERTY_SUBMITTED, newProperty);

    return res.status(201).json({
      success: true,
      message: 'Property submitted successfully! It is now pending Admin review before going live.',
      property: newProperty,
    });
  }

  // User's own properties (Active, Pending, Expired)
  static async getMyProperties(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { status } = req.query;
    const where: any = { userId: req.user.id };
    if (status) where.status = status;

    const properties = await prisma.property.findMany({
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
  static async compareProperties(req: Request, res: Response) {
    const ids = req.query.ids as string;
    if (!ids) {
      return res.status(400).json({ success: false, message: 'Property IDs required for comparison' });
    }

    const idList = ids.split(',').slice(0, 4); // Max 4 properties
    const properties = await prisma.property.findMany({
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
    eventBus.emitEvent(AppEvents.ANALYTICS_EVENT, {
      eventType: 'COMPARE',
      metadata: { ids: idList },
      userId: req.user?.id || null,
    });

    return res.json({ success: true, properties });
  }

  // Favourites management - Requirement 11
  static async toggleFavourite(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { propertyId } = req.body;
    if (!propertyId) return res.status(400).json({ success: false, message: 'propertyId is required' });

    const existing = await prisma.favouriteProperty.findUnique({
      where: {
        userId_propertyId: {
          userId: req.user.id,
          propertyId,
        },
      },
    });

    if (existing) {
      await prisma.favouriteProperty.delete({
        where: { id: existing.id },
      });
      return res.json({ success: true, isFavourited: false, message: 'Removed from favourites' });
    } else {
      await prisma.favouriteProperty.create({
        data: {
          userId: req.user.id,
          propertyId,
        },
      });

      // Track favourite event
      eventBus.emitEvent(AppEvents.ANALYTICS_EVENT, {
        eventType: 'FAVOURITE',
        targetId: propertyId,
        targetType: 'PROPERTY',
        userId: req.user.id,
      });

      return res.json({ success: true, isFavourited: true, message: 'Saved to favourites' });
    }
  }

  static async getMyFavourites(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const favourites = await prisma.favouriteProperty.findMany({
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

  static async deleteProperty(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const { id } = req.params;

    const property = await prisma.property.findUnique({ where: { id: id as string } });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    if (property.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await prisma.property.delete({ where: { id: id as string } });
    return res.json({ success: true, message: 'Property deleted successfully' });
  }
}
