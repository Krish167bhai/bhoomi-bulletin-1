import { prisma } from '../config/prisma.js';

export const DEFAULT_SETTINGS: Record<string, string> = {
  site_name: 'BHOOMI BULLETIN',
  site_tagline: 'Real Estate News, Listings & Advertising Platform',
  site_logo_desktop: '/logo.svg',
  site_logo_mobile: '/logo.svg',
  site_favicon: '/favicon.ico',
  contact_email: 'support@bhoomibulletin.com',
  contact_phone: '+91 98765 43210',
  contact_address: 'Barakhamba Road, Connaught Place, New Delhi, India',
  social_facebook: 'https://facebook.com/bhoomibulletin',
  social_twitter: 'https://twitter.com/bhoomibulletin',
  social_instagram: 'https://instagram.com/bhoomibulletin',
  social_youtube: 'https://youtube.com/@bhoomibulletin',
  social_whatsapp: 'https://wa.me/919876543210',
  seo_default_title: 'BHOOMI BULLETIN — Premier Real Estate News & Property Advertising',
  seo_default_description: 'Discover verified residential and commercial properties, real-estate trends, breaking industry news, and trusted broker listings across India.',
  seo_default_keywords: 'real estate news, property advertising, buy flat delhi, commercial shop, plots in india, bhoomi bulletin',
  enable_auto_approval: 'false',
  require_phone_verification: 'false',
};

export class SettingsService {
  static async getAllSettings(): Promise<Record<string, string>> {
    const settings = await prisma.siteSetting.findMany();
    const result: Record<string, string> = { ...DEFAULT_SETTINGS };

    for (const s of settings) {
      result[s.key] = s.value;
    }

    return result;
  }

  static async getSetting(key: string): Promise<string> {
    const setting = await prisma.siteSetting.findUnique({
      where: { key },
    });
    return setting ? setting.value : DEFAULT_SETTINGS[key] || '';
  }

  static async updateSettings(updates: Record<string, string>) {
    for (const [key, value] of Object.entries(updates)) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }
    return this.getAllSettings();
  }

  static async getBranding() {
    const settings = await this.getAllSettings();
    return {
      siteName: settings.site_name,
      siteTagline: settings.site_tagline,
      logoDesktop: settings.site_logo_desktop,
      logoMobile: settings.site_logo_mobile,
      favicon: settings.site_favicon,
      contactEmail: settings.contact_email,
      contactPhone: settings.contact_phone,
      contactAddress: settings.contact_address,
      social: {
        facebook: settings.social_facebook,
        twitter: settings.social_twitter,
        instagram: settings.social_instagram,
        youtube: settings.social_youtube,
        whatsapp: settings.social_whatsapp,
      },
      seo: {
        title: settings.seo_default_title,
        description: settings.seo_default_description,
        keywords: settings.seo_default_keywords,
      }
    };
  }
}
