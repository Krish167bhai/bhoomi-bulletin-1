import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import { useCompare } from '../../context/CompareContext.js';
import { formatPriceINR } from '../../components/property/PropertyCard.js';
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  CheckCircle2,
  Heart,
  Scale,
  Phone,
  MessageSquare,
  Send,
  Star,
  ShieldCheck,
  Calendar,
  Share2,
  AlertCircle,
  Video,
} from 'lucide-react';

export const PropertyDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const navigate = useNavigate();

  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isFavourited, setIsFavourited] = useState(false);

  // Enquiry form state
  const [enquiryName, setEnquiryName] = useState(user?.name || '');
  const [enquiryPhone, setEnquiryPhone] = useState(user?.phone || '');
  const [enquiryEmail, setEnquiryEmail] = useState(user?.email || '');
  const [enquiryMessage, setEnquiryMessage] = useState('Hi, I am interested in this property. Please share full details and schedule a site visit.');
  const [preferredContact, setPreferredContact] = useState<'PHONE' | 'EMAIL' | 'WHATSAPP'>('PHONE');
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquiryError, setEnquiryError] = useState('');

  // Review submission state (Requirement 14)
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');
  const [reviewsList, setReviewsList] = useState<any[]>([]);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/properties/slug/${slug}`);
        if (res.data.success && res.data.property) {
          setProperty(res.data.property);
          setIsFavourited(res.data.property.isFavourited || false);
          setReviewsList(res.data.property.reviews || []);
        }
      } catch (err) {
        console.error('Error fetching property detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [slug]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">Loading property details...</div>;
  }

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Property Not Found</h2>
        <p className="text-sm text-slate-600">The property you are looking for may have been unlisted or expired.</p>
        <Link to="/real-estate" className="inline-block bg-slate-900 text-white px-6 py-2.5 rounded-lg text-xs font-semibold">
          Browse Active Properties
        </Link>
      </div>
    );
  }

  let photosList: string[] = [];
  try {
    photosList = JSON.parse(property.photos || '[]');
  } catch {
    photosList = [];
  }
  if (photosList.length === 0 && property.featuredImage) {
    photosList = [property.featuredImage];
  }
  if (photosList.length === 0) {
    photosList = ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'];
  }

  let features: string[] = [];
  try {
    features = JSON.parse(property.features || '[]');
  } catch {
    features = [];
  }

  let amenities: string[] = [];
  try {
    amenities = JSON.parse(property.amenities || '[]');
  } catch {
    amenities = [];
  }

  const inCompare = isInCompare(property.id);

  const handleToggleFav = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post('/properties/favourite/toggle', { propertyId: property.id });
      if (res.data.success) {
        setIsFavourited(res.data.isFavourited);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhoneClick = () => {
    api.post('/analytics/track', {
      eventType: 'PHONE_CLICK',
      targetId: property.id,
      targetType: 'PROPERTY',
    }).catch(() => {});
  };

  const handleWhatsappClick = () => {
    api.post('/analytics/track', {
      eventType: 'WHATSAPP_CLICK',
      targetId: property.id,
      targetType: 'PROPERTY',
    }).catch(() => {});
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryLoading(true);
    setEnquiryError('');
    try {
      const res = await api.post('/enquiries/submit', {
        propertyId: property.id,
        name: enquiryName,
        email: enquiryEmail,
        phone: enquiryPhone,
        message: enquiryMessage,
        preferredContact,
      });

      if (res.data.success) {
        setEnquirySuccess(true);
      }
    } catch (err: any) {
      setEnquiryError(err.response?.data?.message || 'Failed to submit enquiry.');
    } finally {
      setEnquiryLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setReviewSubmitting(true);
    setReviewMsg('');
    try {
      const res = await api.post('/reviews/submit', {
        propertyId: property.id,
        rating: reviewRating,
        title: reviewTitle,
        content: reviewContent,
      });

      if (res.data.success) {
        setReviewMsg('Thank you! Your review has been submitted for moderation.');
        setReviewTitle('');
        setReviewContent('');
      }
    } catch (err: any) {
      setReviewMsg(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const phoneNum = property.user?.phone || '9811000001';
  const whatsappUrl = `https://wa.me/91${phoneNum.replace(/[^0-9]/g, '').slice(-10)}?text=Hi, I am interested in "${encodeURIComponent(property.title)}" on Bhoomi Bulletin.`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div className="text-xs text-slate-500 flex items-center space-x-2">
          <Link to="/" className="hover:text-red-600">Home</Link>
          <span>/</span>
          <Link to="/real-estate" className="hover:text-red-600">Properties</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold truncate max-w-xs">{property.title}</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (inCompare) removeFromCompare(property.id);
              else addToCompare(property.id);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              inCompare
                ? 'bg-gold-500 text-white shadow'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>{inCompare ? 'In Comparison' : 'Add to Compare'}</span>
          </button>

          <button
            onClick={handleToggleFav}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              isFavourited
                ? 'bg-red-600 text-white shadow'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavourited ? 'fill-white' : ''}`} />
            <span>{isFavourited ? 'Saved' : 'Save Property'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Contact Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Gallery, Overview, Features, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Photo Gallery */}
          <div className="space-y-3">
            <div className="relative h-96 sm:h-[480px] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md">
              <img
                src={photosList[activePhotoIdx]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded">
                  {property.propertyType.replace('_', ' ')}
                </span>
                {property.verificationStatus === 'VERIFIED' && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded flex items-center space-x-1 shadow">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>🔵 Verified Listing</span>
                  </span>
                )}
                {property.isFeatured && (
                  <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded shadow">
                    FEATURED
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Row */}
            {photosList.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {photosList.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`h-20 w-28 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      activePhotoIdx === idx ? 'border-red-600 scale-105 shadow' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Price Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center text-xs text-slate-500 mb-1 font-medium">
                  <MapPin className="w-4 h-4 text-red-500 mr-1 flex-shrink-0" />
                  <span>{property.location}, {property.city}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
                  {property.title}
                </h1>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-3 text-right">
                <span className="text-xs uppercase font-bold text-red-600 tracking-wider block">Price</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit']">
                  {formatPriceINR(property.price)}
                </span>
                {property.priceNegotiable && (
                  <span className="text-[11px] text-slate-500 block">(Negotiable)</span>
                )}
              </div>
            </div>

            {/* Key Specs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-center">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">Bedrooms</span>
                <span className="text-base font-bold text-slate-800 flex items-center justify-center space-x-1 mt-0.5">
                  <BedDouble className="w-4 h-4 text-red-500" />
                  <span>{property.bedrooms ? `${property.bedrooms} BHK` : 'N/A'}</span>
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">Bathrooms</span>
                <span className="text-base font-bold text-slate-800 flex items-center justify-center space-x-1 mt-0.5">
                  <Bath className="w-4 h-4 text-red-500" />
                  <span>{property.bathrooms || 'N/A'}</span>
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">Super Area</span>
                <span className="text-base font-bold text-slate-800 flex items-center justify-center space-x-1 mt-0.5">
                  <Maximize2 className="w-4 h-4 text-red-500" />
                  <span>{property.sizeSqFt} sq.ft</span>
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">Furnishing</span>
                <span className="text-sm font-bold text-slate-800 block mt-1">
                  {property.furnishing || 'Unfurnished'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
              Property Description &amp; Highlights
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Features & Amenities */}
          {(features.length > 0 || amenities.length > 0) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                Features &amp; Amenities
              </h3>

              {features.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {features.map((f, i) => (
                      <span key={i} className="bg-slate-100 text-slate-800 text-xs px-3 py-1.5 rounded-lg font-medium">
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {amenities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Society Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((a, i) => (
                      <span key={i} className="bg-red-50 text-red-700 text-xs px-3 py-1.5 rounded-lg font-medium">
                        ✓ {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Video Walkthrough (if available) */}
          {property.videoUrl && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
                <Video className="w-5 h-5 text-red-600" />
                <span>Video Walkthrough</span>
              </h3>
              <div className="rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center">
                {property.videoUrl.startsWith('http') && !property.videoUrl.startsWith('/uploads') ? (
                  <iframe
                    src={property.videoUrl.replace('watch?v=', 'embed/')}
                    title="Property Walkthrough Video"
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                ) : (
                  <video src={property.videoUrl} controls className="w-full h-full object-cover" />
                )}
              </div>
            </div>
          )}

          {/* Reviews & Ratings Section (Requirement 14) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                User Reviews ({reviewsList.length})
              </h3>
              <div className="flex items-center space-x-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-amber-800">Verified Feedback</span>
              </div>
            </div>

            {/* Existing Approved Reviews */}
            {reviewsList.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No reviews yet for this listing. Be the first to share feedback!</p>
            ) : (
              <div className="space-y-4">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-xs text-slate-800">{rev.user?.name || 'Verified Buyer'}</div>
                      <div className="flex text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    {rev.title && <h4 className="font-bold text-xs text-slate-900">{rev.title}</h4>}
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Submit Review Form */}
            <form onSubmit={handleReviewSubmit} className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Write a Review</h4>
              {reviewMsg && (
                <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-200">
                  {reviewMsg}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rating (1 to 5 Stars)</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-slate-300 hover:text-amber-500"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewRating ? 'text-amber-500 fill-amber-500' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Review Title</label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Excellent construction and transparent agent"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Detailed Experience *</label>
                <textarea
                  rows={3}
                  required
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Share details about the property condition, society maintenance, or broker assistance..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors uppercase tracking-wider"
              >
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Advertiser Profile & Enquire Card */}
        <div className="space-y-6">
          {/* Advertiser Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Advertiser Profile</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-base">
                {property.user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-sm text-slate-900 truncate">{property.user?.name}</span>
                  {property.user?.verificationStatus === 'VERIFIED' && (
                    <span title="Verified Advertiser" className="text-blue-600 flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 truncate">{property.user?.companyName || 'Verified Advertiser'}</div>
                <span className="inline-block mt-1 bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  {property.user?.role || property.userType}
                </span>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={`tel:${phoneNum}`}
                onClick={handlePhoneClick}
                className="flex items-center justify-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 mr-1.5" />
                <span>Call Now</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsappClick}
                className="flex items-center justify-center py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Enquire Now Box (Requirement 10) */}
          <div id="enquire" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
              Send Direct Enquiry
            </h3>
            <p className="text-xs text-slate-500">
              The property owner/agent will receive your verified inquiry immediately.
            </p>

            {enquirySuccess ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
                <h4 className="font-bold text-sm text-green-900">Enquiry Sent!</h4>
                <p className="text-xs text-green-700">The advertiser has received your request and will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-3.5">
                {enquiryError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                    {enquiryError}
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={enquiryName}
                    onChange={(e) => setEnquiryName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={enquiryPhone}
                    onChange={(e) => setEnquiryPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={enquiryEmail}
                    onChange={(e) => setEnquiryEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Preferred Contact</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['PHONE', 'WHATSAPP', 'EMAIL'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPreferredContact(method)}
                        className={`py-1.5 text-[10px] font-bold rounded border transition-all ${
                          preferredContact === method
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Message</label>
                  <textarea
                    rows={3}
                    required
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={enquiryLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider shadow transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{enquiryLoading ? 'Sending...' : 'Enquire Now'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
