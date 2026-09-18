import cron from 'node-cron';
import { prisma } from '../config/prisma.js';
import { eventBus, AppEvents } from '../events/eventBus.js';

export const initAdExpiryCron = () => {
  // Run every hour to check for expired advertisements
  // In development, also runs once immediately upon startup
  const checkAndExpireAds = async () => {
    try {
      const now = new Date();
      
      const expiredAds = await prisma.property.findMany({
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
          const updated = await prisma.property.update({
            where: { id: ad.id },
            data: {
              status: 'EXPIRED',
              isPublished: false,
            },
          });

          // Emit event to notify user
          eventBus.emitEvent(AppEvents.PROPERTY_EXPIRED, updated);
        }
      }
    } catch (err) {
      console.error('[Ad Expiry Cron] Error checking ad expiries:', err);
    }
  };

  // Run on startup
  checkAndExpireAds();

  // Schedule to run every hour at minute 0
  cron.schedule('0 * * * *', () => {
    console.log('[Ad Expiry Cron] Running hourly expiry check...');
    checkAndExpireAds();
  });

  console.log('[Ad Expiry Cron] Scheduled job initialized.');
};
