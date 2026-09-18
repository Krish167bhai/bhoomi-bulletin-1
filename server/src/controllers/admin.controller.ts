import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { eventBus, AppEvents } from '../events/eventBus.js';
import { calculateAdExpiry } from './property.controller.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { SettingsService } from '../services/settings.service.js';
import fs from 'fs';
import path from 'path';

export class AdminController {
  // 1. Dashboard Overview - Requirement 19
  static async getDashboardStats(_req: Request, res: Response) {
    const stats = await AnalyticsService.getWebsiteOverview();
    return res.json({ success: true, stats });
  }

  // 2. Pending Submissions Queue - Requirement 17
  static async getPendingSubmissions(_req: Request, res: Response) {
    const properties = await prisma.property.findMany({
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
  static async approveProperty(req: Request, res: Response) {
    const id = req.params.id as string;
    const { duration, isFeatured, verified } = req.body;

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const adDuration = duration || property.adDuration;
    const startDate = new Date();
    const expiryDate = calculateAdExpiry(startDate, adDuration);

    const updated = await prisma.property.update({
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
    eventBus.emitEvent(AppEvents.PROPERTY_APPROVED, updated);

    return res.json({
      success: true,
      message: 'Property approved, activated, and published successfully!',
      property: updated,
    });
  }

  // 4. Reject Property Submission - Requirement 17
  static async rejectProperty(req: Request, res: Response) {
    const id = req.params.id as string;
    const { reason } = req.body;

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const updated = await prisma.property.update({
      where: { id },
      data: {
        status: 'REJECTED',
        isPublished: false,
        verificationNotes: reason || 'Submission rejected by administrator.',
      },
    });

    eventBus.emitEvent(AppEvents.PROPERTY_REJECTED, { property: updated, reason });

    return res.json({
      success: true,
      message: 'Property submission rejected.',
      property: updated,
    });
  }

  // 5. Admin Direct Post Creation - Requirement 18
  static async createPost(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const {
      postType, // ARTICLE, PROPERTY_AD, VIDEO_NEWS, ANNOUNCEMENT
      title,
      content,
      category,
      excerpt,
      featuredImage,
      videoUrl,
      tags,
      // Property specific fields if postType is PROPERTY_AD
      propertyType,
      listingType,
      price,
      location,
      city,
      sizeSqFt,
      bedrooms,
      bathrooms,
      photos,
      duration,
      isFeatured,
      publishImmediately,
    } = req.body;

    if (postType === 'PROPERTY_AD') {
      const slugBase = (title || 'ad')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50);
      const slug = `${slugBase}-${Date.now().toString().slice(-6)}`;

      const adDuration = duration || 'MONTH_1';
      const startDate = new Date();
      const expiryDate = calculateAdExpiry(startDate, adDuration);

      const property = await prisma.property.create({
        data: {
          userId: req.user.id,
          title,
          slug,
          description: content || title,
          propertyType: (propertyType || 'APARTMENT') as any,
          listingType: (listingType || 'BUY') as any,
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
          adDuration: adDuration as any,
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

    const article = await prisma.article.create({
      data: {
        authorId: req.user.id,
        title,
        slug,
        category: (category || (postType === 'VIDEO_NEWS' ? 'VIDEO_NEWS' : 'NEWS')) as any,
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
  static async getAllProperties(req: Request, res: Response) {
    const { status, type, city, isAd, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const where: any = {};
    if (status) where.status = status;
    if (type) where.propertyType = type;
    if (city) where.city = { contains: String(city) };
    if (isAd !== undefined) where.isAdvertisement = isAd === 'true';

    const [total, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
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
  static async updatePropertyAdmin(req: Request, res: Response) {
    const id = req.params.id as string;
    const {
      title,
      description,
      price,
      status,
      isPublished,
      adDuration,
      adStartDate,
      adExpiryDate,
      renewDuration,
      isFeatured,
      isBoosted,
      verificationStatus,
    } = req.body;

    const current = await prisma.property.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ success: false, message: 'Property not found' });

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (status !== undefined) updateData.status = status;
    if (isPublished !== undefined) updateData.isPublished = Boolean(isPublished);
    if (adDuration !== undefined) updateData.adDuration = adDuration;
    if (adStartDate !== undefined) updateData.adStartDate = new Date(adStartDate);
    if (adExpiryDate !== undefined) updateData.adExpiryDate = new Date(adExpiryDate);
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (isBoosted !== undefined) updateData.isBoosted = Boolean(isBoosted);
    if (verificationStatus !== undefined) {
      updateData.verificationStatus = verificationStatus;
      if (verificationStatus === 'VERIFIED') updateData.verifiedAt = new Date();
    }

    // If Admin triggers renew:
    if (renewDuration) {
      const start = new Date();
      const expiry = calculateAdExpiry(start, renewDuration);
      updateData.adStartDate = start;
      updateData.adExpiryDate = expiry;
      updateData.adDuration = renewDuration;
      updateData.status = 'APPROVED';
      updateData.isPublished = true;
    }

    const updated = await prisma.property.update({
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
  static async deleteProperty(req: Request, res: Response) {
    const id = req.params.id as string;
    await prisma.property.delete({ where: { id } });
    return res.json({ success: true, message: 'Property deleted successfully' });
  }

  // 7. Manage Articles / News
  static async getAllArticles(_req: Request, res: Response) {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
    return res.json({ success: true, articles });
  }

  static async updateArticle(req: Request, res: Response) {
    const id = req.params.id as string;
    const { title, content, excerpt, category, featuredImage, videoUrl, isPublished } = req.body;

    const updated = await prisma.article.update({
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

  static async deleteArticle(req: Request, res: Response) {
    const id = req.params.id as string;
    await prisma.article.delete({ where: { id } });
    return res.json({ success: true, message: 'Article deleted successfully' });
  }

  // 8. Manage Users & Verification - Requirement 15, 23
  static async getAllUsers(_req: Request, res: Response) {
    const users = await prisma.user.findMany({
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
  static async updateUserVerification(req: Request, res: Response) {
    const id = req.params.id as string;
    const { status, notes } = req.body; // NONE, PENDING, VERIFIED, REJECTED

    const updated = await prisma.user.update({
      where: { id },
      data: {
        verificationStatus: status,
      },
    });

    eventBus.emitEvent(AppEvents.VERIFICATION_UPDATED, { userId: id, status, notes });

    return res.json({
      success: true,
      message: `User verification updated to: ${status}`,
      user: updated,
    });
  }

  // Review Information Change Requests - Requirement 23
  static async getInfoChangeRequests(_req: Request, res: Response) {
    const requests = await prisma.informationChangeRequest.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, requests });
  }

  static async resolveInfoChangeRequest(req: Request, res: Response) {
    const id = req.params.id as string;
    const { action, adminNotes } = req.body; // 'APPROVE' or 'REJECT'

    const request = await prisma.informationChangeRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    if (action === 'APPROVE') {
      const updateData: any = {};
      if (request.requestedName) updateData.name = request.requestedName;
      if (request.requestedEmail) updateData.email = request.requestedEmail;
      if (request.requestedPhone) updateData.phone = request.requestedPhone;

      await prisma.$transaction([
        prisma.user.update({
          where: { id: request.userId },
          data: updateData,
        }),
        prisma.informationChangeRequest.update({
          where: { id },
          data: {
            status: 'APPROVED',
            adminNotes,
            resolvedAt: new Date(),
          },
        }),
      ]);
    } else {
      await prisma.informationChangeRequest.update({
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
  static async getAllLeads(_req: Request, res: Response) {
    const [enquiries, requirements] = await Promise.all([
      prisma.enquiry.findMany({
        include: {
          property: { select: { id: true, title: true, location: true, price: true } },
          receiverUser: { select: { id: true, name: true, phone: true } },
          notes: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.propertyRequirement.findMany({
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
  static async updateLeadStatus(req: Request, res: Response) {
    const id = req.params.id as string;
    const { leadType, status, note, followUpDate } = req.body;

    if (leadType === 'ENQUIRY') {
      await prisma.enquiry.update({
        where: { id },
        data: { status },
      });
    } else {
      await prisma.propertyRequirement.update({
        where: { id },
        data: { status },
      });
    }

    if (note && req.user) {
      await prisma.leadNote.create({
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
  static async getAllReviews(_req: Request, res: Response) {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, reviews });
  }

  static async moderateReview(req: Request, res: Response) {
    const id = req.params.id as string;
    const { status } = req.body; // APPROVED, REJECTED

    const review = await prisma.review.update({
      where: { id },
      data: { status },
    });

    return res.json({ success: true, message: `Review ${status.toLowerCase()} successfully`, review });
  }

  static async deleteReview(req: Request, res: Response) {
    const id = req.params.id as string;
    await prisma.review.delete({ where: { id } });
    return res.json({ success: true, message: 'Review deleted successfully' });
  }

  // 11. Media Library Management - Requirement 30
  static async getMediaItems(_req: Request, res: Response) {
    const media = await prisma.mediaItem.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: { select: { id: true, name: true } },
      },
    });
    return res.json({ success: true, media });
  }

  static async deleteMediaItem(req: Request, res: Response) {
    const id = req.params.id as string;
    const item = await prisma.mediaItem.findUnique({ where: { id } });

    if (item) {
      try {
        const filePath = path.join(process.cwd(), item.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn('Could not unlink media file:', err);
      }
      await prisma.mediaItem.delete({ where: { id } });
    }

    return res.json({ success: true, message: 'Media item deleted' });
  }

  // 12. Settings & Branding Management - Requirement 4, 41
  static async getSettings(_req: Request, res: Response) {
    const settings = await SettingsService.getAllSettings();
    return res.json({ success: true, settings });
  }

  static async updateSettings(req: Request, res: Response) {
    const updated = await SettingsService.updateSettings(req.body);
    return res.json({ success: true, message: 'Settings saved successfully', settings: updated });
  }
}
