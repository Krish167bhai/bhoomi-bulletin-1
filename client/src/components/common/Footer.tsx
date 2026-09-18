import React from 'react';
import { Link } from 'react-router-dom';
import { useBranding } from '../../context/BrandingContext.js';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { branding } = useBranding();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              {branding.logoDesktop ? (
                <img
                  src={branding.logoDesktop}
                  alt={branding.siteName}
                  className="h-12 w-auto brightness-200 invert object-contain"
                />
              ) : (
                <span className="text-2xl font-extrabold text-white font-['Outfit']">
                  BHOOMI <span className="text-red-500">BULLETIN</span>
                </span>
              )}
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              India’s premier real-estate news and advertising portal. Connecting genuine buyers, verified property owners, reputed builders, and certified brokers with verified listings and daily market intelligence.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              {branding.social.facebook && (
                <a
                  href={branding.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600 transition-colors"
                >
                  <span className="text-xs font-bold">FB</span>
                </a>
              )}
              {branding.social.twitter && (
                <a
                  href={branding.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600 transition-colors"
                >
                  <span className="text-xs font-bold">X</span>
                </a>
              )}
              {branding.social.youtube && (
                <a
                  href={branding.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600 transition-colors"
                >
                  <span className="text-xs font-bold">YT</span>
                </a>
              )}
              {branding.social.whatsapp && (
                <a
                  href={branding.social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white hover:bg-green-600 transition-colors"
                >
                  <span className="text-xs font-bold">WA</span>
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase font-['Outfit']">
              Explore Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-red-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/latest-news" className="hover:text-red-400 transition-colors">
                  Latest News
                </Link>
              </li>
              <li>
                <Link to="/real-estate" className="hover:text-red-400 transition-colors">
                  Real Estate Listings
                </Link>
              </li>
              <li>
                <Link to="/videos" className="hover:text-red-400 transition-colors">
                  Video News &amp; Reports
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-red-400 transition-colors">
                  Property Comparison
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Advertising & Leads */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase font-['Outfit']">
              Services
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/advertise-property" className="text-red-400 font-semibold hover:underline">
                  Advertise Your Property
                </Link>
              </li>
              <li>
                <Link to="/property-requirement" className="hover:text-red-400 transition-colors">
                  Submit Property Requirement
                </Link>
              </li>
              <li>
                <Link to="/account/my-properties" className="hover:text-red-400 transition-colors">
                  Broker / Agent CRM
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-red-400 transition-colors">
                  About Bhoomi Bulletin
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-red-400 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Information */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase font-['Outfit']">
              Contact Us
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{branding.contactAddress}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{branding.contactPhone}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{branding.contactEmail}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 space-y-4 md:space-y-0">
          <div>
            &copy; {currentYear} {branding.siteName}. All rights reserved. Registered Real-Estate Media &amp; Advertising Network.
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/privacy-policy" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-slate-400 transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link to="/disclaimer" className="hover:text-slate-400 transition-colors">
              Disclaimer
            </Link>
            <a href="/sitemap.xml" target="_blank" className="hover:text-slate-400 transition-colors">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
