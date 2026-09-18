import { prisma } from '../config/prisma.js';
import { NotificationService } from './notification.service.js';

export class SavedSearchService {
  static async checkMatchingAlerts(property: any) {
    try {
      const activeSearches = await prisma.savedSearch.findMany({
        where: { alertsActive: true },
        include: { user: true },
      });

      for (const search of activeSearches) {
        // Do not notify the poster of the property
        if (search.userId === property.userId) continue;

        let filters: any = {};
        try {
          filters = JSON.parse(search.filters);
        } catch {
          continue;
        }

        let isMatch = true;

        if (filters.propertyType && filters.propertyType !== 'ALL' && filters.propertyType !== property.propertyType) {
          isMatch = false;
        }

        if (filters.listingType && filters.listingType !== 'ALL' && filters.listingType !== property.listingType) {
          isMatch = false;
        }

        if (filters.city && !property.city.toLowerCase().includes(filters.city.toLowerCase())) {
          isMatch = false;
        }

        if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) {
          isMatch = false;
        }

        if (filters.maxPrice && property.price > Number(filters.maxPrice)) {
          isMatch = false;
        }

        if (filters.minPrice && property.price < Number(filters.minPrice)) {
          isMatch = false;
        }

        if (filters.bedrooms && property.bedrooms && property.bedrooms < Number(filters.bedrooms)) {
          isMatch = false;
        }

        if (isMatch) {
          await NotificationService.createNotification({
            userId: search.userId,
            title: `New Property Match: ${search.name}`,
            message: `A new property "${property.title}" in ${property.location} matching your saved search criteria has been published.`,
            type: 'INFO',
            link: `/property/${property.slug}`,
          });

          await prisma.savedSearch.update({
            where: { id: search.id },
            data: { lastAlertSentAt: new Date() },
          });
        }
      }
    } catch (err) {
      console.error('Error matching saved searches:', err);
    }
  }
}
