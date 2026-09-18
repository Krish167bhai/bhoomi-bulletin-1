import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { eventBus, AppEvents } from '../events/eventBus.js';

const enquirySchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid mobile number is required'),
  message: z.string().min(5, 'Message must be at least 5 characters'),
  preferredContact: z.enum(['PHONE', 'EMAIL', 'WHATSAPP']).default('PHONE'),
});

const requirementSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid mobile number is required'),
  type: z.enum(['BUY', 'RENT', 'INVEST']).default('BUY'),
  propertyType: z.enum(['APARTMENT', 'VILLA', 'HOUSE', 'PLOT_LAND', 'SHOP', 'OFFICE', 'WAREHOUSE', 'COMMERCIAL', 'OTHER']),
  preferredLocation: z.string().min(2, 'Preferred location is required'),
  budgetMin: z.coerce.number().optional().nullable(),
  budgetMax: z.coerce.number().optional().nullable(),
  preferredSize: z.string().optional().nullable(),
  additionalDetails: z.string().optional().nullable(),
});

export class EnquiryController {
  // Requirement 10: Property Enquiry System
  static async submitEnquiry(req: Request, res: Response) {
    const validated = enquirySchema.parse(req.body);

    const property = await prisma.property.findUnique({
      where: { id: validated.propertyId },
      include: { user: true },
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        propertyId: property.id,
        ownerAgentId: property.userId,
        userId: req.user?.id || null,
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        message: validated.message,
        preferredContact: validated.preferredContact,
        status: 'NEW',
        source: 'PROPERTY_DETAIL_PAGE',
      },
      include: {
        property: { select: { title: true, location: true } },
      },
    });

    // Emit event -> notifies owner, admin, and logs analytics
    eventBus.emitEvent(AppEvents.ENQUIRY_CREATED, enquiry);
    eventBus.emitEvent(AppEvents.ANALYTICS_EVENT, {
      eventType: 'ENQUIRY_CLICK',
      targetId: property.id,
      targetType: 'PROPERTY',
      userId: req.user?.id || null,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Your enquiry has been sent directly to the property advertiser!',
      enquiry,
    });
  }

  // Requirement 9: Property Requirement Lead Form
  static async submitRequirement(req: Request, res: Response) {
    const validated = requirementSchema.parse(req.body);

    const requirement = await prisma.propertyRequirement.create({
      data: {
        userId: req.user?.id || null,
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        type: validated.type as any,
        propertyType: validated.propertyType as any,
        preferredLocation: validated.preferredLocation,
        budgetMin: validated.budgetMin || null,
        budgetMax: validated.budgetMax || null,
        preferredSize: validated.preferredSize || null,
        additionalDetails: validated.additionalDetails || null,
        status: 'NEW',
      },
    });

    eventBus.emitEvent(AppEvents.REQUIREMENT_SUBMITTED, requirement);

    return res.status(201).json({
      success: true,
      message: 'Your property requirement has been registered! Our verified partners will match suitable properties.',
      requirement,
    });
  }

  // User's received enquiries (for their own properties) - Requirement 10 & 16
  static async getReceivedEnquiries(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const enquiries = await prisma.enquiry.findMany({
      where: { ownerAgentId: req.user.id },
      include: {
        property: {
          select: { id: true, title: true, slug: true, location: true, price: true, featuredImage: true },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, enquiries });
  }

  // User's own sent enquiries
  static async getSentEnquiries(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const enquiries = await prisma.enquiry.findMany({
      where: { userId: req.user.id },
      include: {
        property: {
          select: { id: true, title: true, slug: true, location: true, price: true, featuredImage: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, enquiries });
  }

  // User's submitted requirements - Requirement 9
  static async getMyRequirements(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const requirements = await prisma.propertyRequirement.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { email: req.user.email },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, requirements });
  }

  // Update enquiry status & add note (Broker CRM action) - Requirement 16
  static async updateMyEnquiryStatus(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const id = req.params.id as string;
    const { status, note, followUpDate } = req.body;

    // Verify ownership
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!enquiry || enquiry.ownerAgentId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this enquiry' });
    }

    await prisma.enquiry.update({
      where: { id },
      data: { status },
    });

    if (note) {
      await prisma.leadNote.create({
        data: {
          authorId: req.user.id,
          enquiryId: id,
          note,
          actionType: 'STATUS_UPDATE',
          nextFollowUp: followUpDate ? new Date(followUpDate) : null,
        },
      });
    }

    return res.json({ success: true, message: 'Lead status updated' });
  }
}
