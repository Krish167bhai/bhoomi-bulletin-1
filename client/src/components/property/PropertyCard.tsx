import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useCompare } from '../../context/CompareContext.js';
import api from '../../api/client.js';
import {
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  CheckCircle2,
  Phone,
  MessageSquare,
  Scale,
} from 'lucide-react';

export interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    slug: string;
    propertyType: string;
    listingType: string;
    price: number;
    priceNegotiable?: boolean;
    location: string;
    city: string;
    sizeSqFt: number;
    bedrooms?: number | null;
    bathrooms?: number | null;
    featuredImage?: string | null;
    photos?: string;
    verificationStatus: string;
    isFeatured?: boolean;
    isFavourited?: boolean;
    user?: {
      name: string;
      phone: string;
      role: string;
      verificationStatus: string;
      companyName?: string | null;
    };
  };
  onEnquireClick?: (property: any) => void;
}

export const formatPriceINR = (price: number): string => {
  if (!price || isNaN(price)) return '₹ Price on Request';
  if (price >= 10000000) {
    const cr = (price / 10000000).toFixed(2);
    return `₹${cr.replace(/\.00$/, '')} Cr`;
  }
  if (price >= 100000) {
    const lakh = (price / 100000).toFixed(2);
    return `₹${lakh.replace(/\.00$/, '')} Lakh`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
};

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onEnquireClick }) => {
  const { user } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const [favourited, setFavourited] = useState<boolean>(property.isFavourited || false);
  const [favLoading, setFavLoading] = useState(false);
  const navigate = useNavigate();

  const inCompare = isInCompare(property.id);

  let imageSrc = property.featuredImage;
  if (!imageSrc && property.photos) {
    try {
      const parsed = JSON.parse(property.photos);
      if (Array.isArray(parsed) && parsed.length > 0) imageSrc = parsed[0];
    } catch {
      // Fallback
    }
  }
  if (!imageSrc) {
    imageSrc = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
  }

  const handleToggleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    setFavLoading(true);
    try {
      const res = await api.post('/properties/favourite/toggle', { propertyId: property.id });
      if (res.data.success) {
        setFavourited(res.data.isFavourited);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setFavLoading(false);
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(property.id);
    } else {
      addToCompare(property.id);
    }
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Track phone click event
    api.post('/analytics/track', {
      eventType: 'PHONE_CLICK',
      targetId: property.id,
      targetType: 'PROPERTY',
    }).catch(() => {});
  };

  const handleWhatsappClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Track WhatsApp click event
    api.post('/analytics/track', {
      eventType: 'WHATSAPP_CLICK',
      targetId: property.id,
      targetType: 'PROPERTY',
    }).catch(() => {});
  };

  const phoneNum = property.user?.phone || '9811000001';
  const whatsappUrl = `https://wa.me/91${phoneNum.replace(/[^0-9]/g, '').slice(-10)}?text=Hi, I am interested in your property: "${encodeURIComponent(property.title)}" listed on Bhoomi Bulletin.`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group">
      {/* Image Container */}
      <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
        <Link to={`/property/${property.slug}`} className="block w-full h-full">
          <img
            src={imageSrc}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded">
            {property.propertyType.replace('_', ' ')}
          </span>
          {property.isFeatured && (
            <span className="bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow">
              FEATURED
            </span>
          )}
          {property.verificationStatus === 'VERIFIED' && (
            <span className="bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded flex items-center space-x-1 shadow">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified</span>
            </span>
          )}
        </div>

        {/* Top Right Favourite & Compare Actions */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5">
          <button
            onClick={handleToggleCompare}
            title={inCompare ? 'Remove from comparison' : 'Add to compare'}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              inCompare
                ? 'bg-gold-500 text-white shadow'
                : 'bg-white/80 text-slate-700 hover:bg-white'
            }`}
          >
            <Scale className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleFav}
            disabled={favLoading}
            title={favourited ? 'Saved to favourites' : 'Save to favourites'}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              favourited
                ? 'bg-red-600 text-white shadow'
                : 'bg-white/80 text-slate-700 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${favourited ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom Price Tag */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow font-['Outfit']">
          <span className="text-lg font-extrabold text-slate-900">
            {formatPriceINR(property.price)}
          </span>
          {property.priceNegotiable && (
            <span className="text-[10px] text-slate-500 font-sans ml-1.5 font-medium">(Negotiable)</span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center text-xs text-slate-500 mb-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-red-500 mr-1 flex-shrink-0" />
            <span className="truncate">{property.location}, {property.city}</span>
          </div>

          {/* Title */}
          <Link to={`/property/${property.slug}`}>
            <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-red-600 transition-colors">
              {property.title}
            </h3>
          </Link>

          {/* Specs: BHK, Bath, Sq Ft */}
          <div className="grid grid-cols-3 gap-2 py-3 my-3 border-y border-slate-100 text-center text-xs text-slate-600">
            {property.bedrooms !== null && property.bedrooms !== undefined ? (
              <div className="flex items-center justify-center space-x-1">
                <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-800">{property.bedrooms}</span>
                <span className="text-slate-400 text-[10px]">BHK</span>
              </div>
            ) : (
              <div className="text-slate-400 text-[11px]">—</div>
            )}
            {property.bathrooms !== null && property.bathrooms !== undefined ? (
              <div className="flex items-center justify-center space-x-1 border-x border-slate-100">
                <Bath className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-800">{property.bathrooms}</span>
                <span className="text-slate-400 text-[10px]">Baths</span>
              </div>
            ) : (
              <div className="text-slate-400 text-[11px] border-x border-slate-100">—</div>
            )}
            <div className="flex items-center justify-center space-x-1">
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-800">{property.sizeSqFt}</span>
              <span className="text-slate-400 text-[10px]">sq.ft</span>
            </div>
          </div>
        </div>

        {/* Footer actions: Advertiser Info & Enquiry Button */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
            <span className="font-medium text-slate-700 truncate max-w-[140px]">
              {property.user?.companyName || property.user?.name || 'Owner Listing'}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
              {property.user?.role || 'OWNER'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <a
              href={`tel:${phoneNum}`}
              onClick={handlePhoneClick}
              title="Call Owner/Agent"
              className="flex items-center justify-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 mr-1 text-slate-600" />
              <span>Call</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsappClick}
              title="Chat on WhatsApp"
              className="flex items-center justify-center py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1 text-green-600" />
              <span>WhatsApp</span>
            </a>
            <button
              onClick={() => (onEnquireClick ? onEnquireClick(property) : navigate(`/property/${property.slug}#enquire`))}
              className="flex items-center justify-center py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              <span>Enquire</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
