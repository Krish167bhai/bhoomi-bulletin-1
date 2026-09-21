"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAdExpiryCron = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_js_1 = require("../config/prisma.js");
const eventBus_js_1 = require("../events/eventBus.js");
const initAdExpiryCron = () => {
    // Run every hour to check for expired advertisements
    // In development, also runs once immediately upon startup
    const checkAndExpireAds = async () => {
        try {
            const now = new Date();
            const expiredAds = await prisma_js_1.prisma.property.findMany({
                where: {
                    isAdvertisement: true,
                    status: 'APPROVED',
                    adExpiryDate: {
                        lt: now,
                    },
                },
            });
            if (expiredAds.length > 0) {
                console.log(`[Ad Expiry Cron] Found ${expiredAds.length} expired advertisements.`);
                for (const ad of expiredAds) {
                    const updated = await prisma_js_1.prisma.property.update({
                        where: { id: ad.id },
                        data: {
                            status: 'EXPIRED',
                            isPublished: false,
                        },
                    });
                    // Emit event to notify user
                    eventBus_js_1.eventBus.emitEvent(eventBus_js_1.AppEvents.PROPERTY_EXPIRED, updated);
                }
            }
        }
        catch (err) {
            console.error('[Ad Expiry Cron] Error checking ad expiries:', err);
        }
    };
    // Run on startup
    checkAndExpireAds();
    // Schedule to run every hour at minute 0
    node_cron_1.default.schedule('0 * * * *', () => {
        console.log('[Ad Expiry Cron] Running hourly expiry check...');
        checkAndExpireAds();
    });
    console.log('[Ad Expiry Cron] Scheduled job initialized.');
};
exports.initAdExpiryCron = initAdExpiryCron;
