"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerEventHandlers = void 0;
const eventBus_js_1 = require("./eventBus.js");
const notification_service_js_1 = require("../services/notification.service.js");
const savedSearch_service_js_1 = require("../services/savedSearch.service.js");
const prisma_js_1 = require("../config/prisma.js");
const registerEventHandlers = () => {
    // 1. User registered
    eventBus_js_1.eventBus.on(eventBus_js_1.AppEvents.USER_REGISTERED, async (user) => {
        await notification_service_js_1.NotificationService.notifyAdmins('New User Registration', `User ${user.name} (${user.email}, ${user.phone}) registered as ${user.role}.`, `/admin/users`);
        await notification_service_js_1.NotificationService.createNotification({
            userId: user.id,
            title: 'Welcome to Bhoomi Bulletin!',
            message: 'Your account has been created successfully. Browse real-estate news or advertise your property today.',
            type: 'SUCCESS',
            link: '/account',
        });
    });
    // 2. Property submitted
    eventBus_js_1.eventBus.on(eventBus_js_1.AppEvents.PROPERTY_SUBMITTED, async (property) => {
        await notification_service_js_1.NotificationService.notifyAdmins('New Property Submission Pending Approval', `A new property submission "${property.title}" in ${property.location} is awaiting your review.`, `/admin/properties?status=PENDING_APPROVAL`);
        await notification_service_js_1.NotificationService.createNotification({
            userId: property.userId,
            title: 'Property Submission Received',
            message: `Your property "${property.title}" has been submitted and is currently under review by our team.`,
            type: 'INFO',
            link: '/account/advertisements',
        });
    });
    // 3. Property approved & published
    eventBus_js_1.eventBus.on(eventBus_js_1.AppEvents.PROPERTY_APPROVED, async (property) => {
        await notification_service_js_1.NotificationService.createNotification({
            userId: property.userId,
            title: 'Property Approved & Published!',
            message: `Congratulations! Your property "${property.title}" is now live on Bhoomi Bulletin.`,
            type: 'SUCCESS',
            link: `/property/${property.slug}`,
        });
        // Trigger saved search matcher!
        await savedSearch_service_js_1.SavedSearchService.checkMatchingAlerts(property);
    });
    // 4. Property rejected
    eventBus_js_1.eventBus.on(eventBus_js_1.AppEvents.PROPERTY_REJECTED, async ({ property, reason }) => {
        await notification_service_js_1.NotificationService.createNotification({
            userId: property.userId,
            title: 'Property Submission Update',
            message: `Your property "${property.title}" requires revisions. Note: ${reason || 'Details could not be verified.'}`,
            type: 'WARNING',
            link: '/account/advertisements',
        });
    });
    // 5. Property expired
    eventBus_js_1.eventBus.on(eventBus_js_1.AppEvents.PROPERTY_EXPIRED, async (property) => {
        await notification_service_js_1.NotificationService.createNotification({
            userId: property.userId,
            title: 'Advertisement Expired',
            message: `Your property advertisement "${property.title}" has reached its duration and is now expired. You can renew it from your dashboard.`,
            type: 'WARNING',
            link: '/account/advertisements',
        });
    });
    // 6. Enquiry created
    eventBus_js_1.eventBus.on(eventBus_js_1.AppEvents.ENQUIRY_CREATED, async (enquiry) => {
        // Notify property owner / agent
        await notification_service_js_1.NotificationService.createNotification({
            userId: enquiry.ownerAgentId,
            title: 'New Enquiry Received!',
            message: `${enquiry.name} (${enquiry.phone}) sent an enquiry for your property. Message: "${enquiry.message.slice(0, 80)}..."`,
            type: 'SUCCESS',
            link: '/account/enquiries',
        });
        // Notify Admin
        await notification_service_js_1.NotificationService.notifyAdmins('New Lead / Enquiry Generated', `Enquiry received from ${enquiry.name} (${enquiry.phone}) for property ID ${enquiry.propertyId}`, `/admin/enquiries`);
    });
    // 7. Requirement submitted
    eventBus_js_1.eventBus.on(eventBus_js_1.AppEvents.REQUIREMENT_SUBMITTED, async (reqItem) => {
        await notification_service_js_1.NotificationService.notifyAdmins('New Property Requirement / Lead', `A new property requirement was submitted by ${reqItem.name} (${reqItem.phone}) looking for ${reqItem.propertyType} in ${reqItem.preferredLocation}.`, `/admin/requirements`);
        if (reqItem.userId) {
            await notification_service_js_1.NotificationService.createNotification({
                userId: reqItem.userId,
                title: 'Property Requirement Received',
                message: 'Your property requirement has been logged. Our verified brokers and team will connect with suitable options.',
                type: 'SUCCESS',
                link: '/account/requirements',
            });
        }
    });
    // 8. Review submitted
    eventBus_js_1.eventBus.on(eventBus_js_1.AppEvents.REVIEW_SUBMITTED, async (review) => {
        await notification_service_js_1.NotificationService.notifyAdmins('New Review Submitted for Moderation', `A new ${review.rating}-star review is pending review.`, `/admin/reviews`);
    });
    // 9. Verification status updated
    eventBus_js_1.eventBus.on(eventBus_js_1.AppEvents.VERIFICATION_UPDATED, async ({ userId, status, notes }) => {
        await notification_service_js_1.NotificationService.createNotification({
            userId,
            title: `Verification Status: ${status}`,
            message: status === 'VERIFIED'
                ? 'Your account / business verification has been approved! The 🔵 Verified badge is now active on your profile and listings.'
                : `Your verification request was updated to: ${status}. ${notes ? `Note: ${notes}` : ''}`,
            type: status === 'VERIFIED' ? 'SUCCESS' : 'WARNING',
            link: '/account',
        });
    });
    // 10. Analytics event tracking
    eventBus_js_1.eventBus.on(eventBus_js_1.AppEvents.ANALYTICS_EVENT, async (eventData) => {
        try {
            await prisma_js_1.prisma.analyticsEvent.create({
                data: {
                    eventType: eventData.eventType,
                    targetId: eventData.targetId || null,
                    targetType: eventData.targetType || null,
                    userId: eventData.userId || null,
                    ipAddress: eventData.ipAddress || null,
                    userAgent: eventData.userAgent || null,
                    metadata: eventData.metadata ? JSON.stringify(eventData.metadata) : null,
                },
            });
            // If it's a property view, increment views count
            if (eventData.eventType === 'PROPERTY_VIEW' && eventData.targetId) {
                await prisma_js_1.prisma.property.update({
                    where: { id: eventData.targetId },
                    data: { viewsCount: { increment: 1 } },
                });
            }
            else if (eventData.eventType === 'PHONE_CLICK' && eventData.targetId) {
                await prisma_js_1.prisma.property.update({
                    where: { id: eventData.targetId },
                    data: { phoneClicks: { increment: 1 } },
                });
            }
            else if (eventData.eventType === 'WHATSAPP_CLICK' && eventData.targetId) {
                await prisma_js_1.prisma.property.update({
                    where: { id: eventData.targetId },
                    data: { whatsappClicks: { increment: 1 } },
                });
            }
            else if (eventData.eventType === 'ARTICLE_VIEW' && eventData.targetId) {
                await prisma_js_1.prisma.article.update({
                    where: { id: eventData.targetId },
                    data: { viewsCount: { increment: 1 } },
                });
            }
        }
        catch (err) {
            console.error('Failed to log analytics event:', err);
        }
    });
    console.log('Event handlers successfully registered with EventBus.');
};
exports.registerEventHandlers = registerEventHandlers;
