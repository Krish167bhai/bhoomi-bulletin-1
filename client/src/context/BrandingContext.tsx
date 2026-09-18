import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client.js';

export interface BrandingData {
  siteName: string;
  siteTagline: string;
  logoDesktop: string;
  logoMobile: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  social: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
    whatsapp: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
}

const defaultBranding: BrandingData = {
  siteName: 'BHOOMI BULLETIN',
  siteTagline: 'Real Estate News, Listings & Advertising Platform',
  logoDesktop: '/logo.svg',
  logoMobile: '/logo.svg',
  favicon: '/favicon.ico',
  contactEmail: 'contact@bhoomibulletin.com',
  contactPhone: '+91 98110 00001',
  contactAddress: '14, Barakhamba Road, Connaught Place, New Delhi 110001',
  social: {
    facebook: 'https://facebook.com/bhoomibulletin',
    twitter: 'https://twitter.com/bhoomibulletin',
    instagram: 'https://instagram.com/bhoomibulletin',
    youtube: 'https://youtube.com/@bhoomibulletin',
    whatsapp: 'https://wa.me/919811000001',
  },
  seo: {
    title: 'BHOOMI BULLETIN — Premier Real Estate News & Property Advertising',
    description: 'India’s trusted portal for verified real-estate news, high-visibility property advertisements, broker CRM and direct buyer inquiries.',
    keywords: 'real estate news, property advertising, buy flat delhi, commercial shop, plots in india, bhoomi bulletin',
  },
};

interface BrandingContextType {
  branding: BrandingData;
  refreshBranding: () => Promise<void>;
  loading: boolean;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<BrandingData>(defaultBranding);
  const [loading, setLoading] = useState(true);

  const refreshBranding = async () => {
    try {
      const res = await api.get('/settings/branding');
      if (res.data.success && res.data.branding) {
        setBranding(res.data.branding);

        // Dynamically update site favicon in browser tab
        if (res.data.branding.favicon) {
          const faviconEl = document.getElementById('site-favicon') as HTMLLinkElement;
          if (faviconEl) {
            faviconEl.href = res.data.branding.favicon;
          }
        }
      }
    } catch (err) {
      console.warn('Could not load site branding settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, refreshBranding, loading }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) throw new Error('useBranding must be used within a BrandingProvider');
  return context;
};
