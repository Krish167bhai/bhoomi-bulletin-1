import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Upload,
  CheckCircle2,
  Building2,
  Calendar,
  AlertCircle,
  FileText,
  DollarSign,
  PlusCircle,
  Image as ImageIcon,
} from 'lucide-react';

export const AdvertisePropertyPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form fields according to Requirement 6
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    userType: user?.userType || 'OWNER',
    propertyType: 'APARTMENT',
    listingType: 'BUY',
    title: '',
    description: '',
    location: '',
    city: '',
    state: '',
    pincode: '',
    price: '',
    priceNegotiable: false,
    sizeSqFt: '',
    bedrooms: '3',
    bathrooms: '3',
    furnishing: 'Semi-Furnished',
    additionalInfo: '',
    adDuration: 'MONTH_1', // Requirement 7
  });

  const [featuresList, setFeaturesList] = useState<string[]>(['Parking', 'Gated Security', 'Lift Access']);
  const [amenitiesList, setAmenitiesList] = useState<string[]>(['Power Backup', 'Water Supply']);
  const [customFeature, setCustomFeature] = useState('');

  // Media files
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successResponse, setSuccessResponse] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddFeature = () => {
    if (customFeature.trim() && !featuresList.includes(customFeature.trim())) {
      setFeaturesList([...featuresList, customFeature.trim()]);
      setCustomFeature('');
    }
  };

  const handleRemoveFeature = (f: string) => {
    setFeaturesList(featuresList.filter((item) => item !== f));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedPhotos(Array.from(e.target.files).slice(0, 8)); // Max 8 photos
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedVideo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      alert('Please log in or register before submitting an advertisement.');
      navigate('/login?redirect=/advertise-property');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload photos and video to persistent media storage if selected
      let uploadedPhotoUrls: string[] = [];
      let uploadedVideoUrl: string | null = null;

      if (selectedPhotos.length > 0 || selectedVideo) {
        setUploadProgress(true);
        const mediaForm = new FormData();
        selectedPhotos.forEach((photo) => {
          mediaForm.append('photos', photo);
        });
        if (selectedVideo) {
          mediaForm.append('video', selectedVideo);
        }

        const uploadRes = await api.post('/upload/property-media', mediaForm, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (uploadRes.data.success) {
          uploadedPhotoUrls = uploadRes.data.photos || [];
          uploadedVideoUrl = uploadRes.data.video || null;
        }
      }

      // 2. Submit property ad to backend API (saves to DB with PENDING_APPROVAL)
      const payload = {
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        userType: formData.userType,
        price: parseFloat(formData.price),
        priceNegotiable: formData.priceNegotiable,
        location: formData.location,
        city: formData.city,
        state: formData.state || null,
        pincode: formData.pincode || null,
        sizeSqFt: parseFloat(formData.sizeSqFt),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        furnishing: formData.furnishing,
        features: featuresList,
        amenities: amenitiesList,
        additionalInfo: formData.additionalInfo || null,
        photos: uploadedPhotoUrls,
        videoUrl: uploadedVideoUrl,
        adDuration: formData.adDuration,
        isAdvertisement: true,
      };

      const res = await api.post('/properties/submit', payload);

      if (res.data.success) {
        setSuccessResponse(res.data.property);
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit property. Please ensure all required fields are valid.');
    } finally {
      setSubmitting(false);
      setUploadProgress(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Property Advertisement
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-['Outfit']">
            Advertise Your Property on Bhoomi Bulletin
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Reach thousands of serious homebuyers, commercial investors, and NRI clients. Submit your listing details below. Our verification team will review and publish your ad with the official verified badge.
          </p>
        </div>
      </div>

      {successResponse ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Outfit']">
              Property Submission Received!
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Your property advertisement for <strong className="text-slate-900 font-semibold">"{successResponse.title}"</strong> has been recorded in our persistent database and queued for editorial verification.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-md mx-auto text-left text-xs space-y-2.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Submission ID:</span>
              <span className="font-mono font-bold text-slate-800">{successResponse.id.slice(0, 12)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Approval Status:</span>
              <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded uppercase text-[10px]">
                Pending Admin Review
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Selected Ad Duration:</span>
              <span className="font-semibold text-slate-800">{successResponse.adDuration.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/account/my-properties')}
              className="bg-slate-900 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow hover:bg-slate-800 transition-colors uppercase tracking-wider"
            >
              Go to My Advertisements
            </button>
            <button
              onClick={() => {
                setSuccessResponse(null);
                setFormData({
                  ...formData,
                  title: '',
                  description: '',
                  price: '',
                  sizeSqFt: '',
                });
              }}
              className="bg-slate-100 text-slate-700 font-semibold text-xs px-6 py-3 rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-wider"
            >
              Post Another Property
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Advertiser Information (Requirement 6) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-red-600" />
              <span>1. Advertiser Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit phone"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">You are advertising as: *</label>
              <div className="grid grid-cols-3 gap-3">
                {(['OWNER', 'BROKER', 'AGENT'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: type })}
                    className={`py-2.5 text-xs font-bold rounded-lg border transition-all ${
                      formData.userType === type
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Property Basic Details (Requirement 6) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-red-600" />
              <span>2. Property Specification</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Advertisement Headline / Title *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Luxurious 3 BHK Park-Facing Apartment in South Delhi"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Property Type *</label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                >
                  <option value="APARTMENT">Apartment / Flat</option>
                  <option value="VILLA">Villa / Independent House</option>
                  <option value="PLOT_LAND">Plot / Land</option>
                  <option value="SHOP">Commercial Shop</option>
                  <option value="OFFICE">Office Space</option>
                  <option value="WAREHOUSE">Warehouse / Godown</option>
                  <option value="COMMERCIAL">Commercial Other</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Listing Type *</label>
                <select
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                >
                  <option value="BUY">For Sale (Buy)</option>
                  <option value="RENT">For Rent / Lease</option>
                  <option value="INVEST">Investment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Size (Sq. Ft.) *</label>
                <input
                  type="number"
                  name="sizeSqFt"
                  required
                  value={formData.sizeSqFt}
                  onChange={handleInputChange}
                  placeholder="e.g. 1850"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price (in INR ₹) *</label>
                <input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g. 8500000"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
                <select
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                >
                  <option value="">N/A (Plot/Shop)</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5">5+ BHK</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
                <select
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
                >
                  <option value="">N/A</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5+</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="priceNegotiable"
                name="priceNegotiable"
                checked={formData.priceNegotiable}
                onChange={handleInputChange}
                className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-4 h-4"
              />
              <label htmlFor="priceNegotiable" className="text-xs text-slate-700 font-medium cursor-pointer">
                Price is negotiable
              </label>
            </div>
          </div>

          {/* Section 3: Location Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
              3. Location Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Locality / Sector / Address *</label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Sector 54, Golf Course Road"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Gurugram, Delhi, Noida"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Property Description & Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
              4. Property Details &amp; Highlights
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description *</label>
              <textarea
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe key highlights, floor position, road width, nearby landmarks, metro proximity, etc."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Features Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Key Features &amp; Amenities</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {featuresList.map((f) => (
                  <span
                    key={f}
                    className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-full font-medium flex items-center space-x-1"
                  >
                    <span>{f}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(f)}
                      className="text-slate-400 hover:text-red-600 font-bold ml-1"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customFeature}
                  onChange={(e) => setCustomFeature(e.target.value)}
                  placeholder="Add custom feature (e.g. Italian Marble, Corner Plot)"
                  className="text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Media Uploads (Requirement 6, 11, 12, 30) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-red-600" />
              <span>5. Photos &amp; Video Media</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-red-500 transition-colors bg-slate-50">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <label className="block text-xs font-bold text-slate-800 cursor-pointer">
                  Upload Photos (Max 8)
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, WEBP up to 10MB each</p>
                {selectedPhotos.length > 0 && (
                  <p className="text-xs font-bold text-green-600 mt-2">
                    {selectedPhotos.length} photo(s) selected
                  </p>
                )}
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-red-500 transition-colors bg-slate-50">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <label className="block text-xs font-bold text-slate-800 cursor-pointer">
                  Upload Walkthrough Video (Optional)
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-500 mt-1">MP4, WEBM up to 50MB</p>
                {selectedVideo && (
                  <p className="text-xs font-bold text-green-600 mt-2 truncate">
                    {selectedVideo.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 6: Advertisement Duration (Requirement 7) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-red-600" />
              <span>6. Advertisement Duration</span>
            </h3>
            <p className="text-xs text-slate-600">
              Select how long your advertisement should remain active before automatic expiry:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'WEEK_1', label: '1 Week' },
                { id: 'MONTH_1', label: '1 Month' },
                { id: 'MONTH_2', label: '2 Months' },
                { id: 'MONTH_3', label: '3 Months' },
                { id: 'MONTH_6', label: '6 Months' },
                { id: 'YEAR_1', label: '1 Year' },
                { id: 'YEAR_2', label: '2 Years' },
              ].map((dur) => (
                <button
                  key={dur.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, adDuration: dur.id })}
                  className={`p-3 text-xs font-bold rounded-xl border text-center transition-all ${
                    formData.adDuration === dur.id
                      ? 'bg-red-600 text-white border-red-600 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-sm uppercase tracking-wider shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <PlusCircle className="w-5 h-5" />
              <span>
                {submitting
                  ? uploadProgress
                    ? 'Uploading Media Files...'
                    : 'Saving Advertisement...'
                  : 'Submit Property for Advertisement'}
              </span>
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-2.5">
              By submitting, your listing will be sent to the editorial team for verification. Upon approval, it will go live with verified contact buttons.
            </p>
          </div>
        </form>
      )}
    </div>
  );
};
