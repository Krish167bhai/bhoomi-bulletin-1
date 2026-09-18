import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import {
  PlusCircle,
  Upload,
  CheckCircle2,
  AlertCircle,
  Newspaper,
  Building2,
  Play,
  Megaphone,
} from 'lucide-react';

export const AdminCreatePost: React.FC = () => {
  const navigate = useNavigate();

  const [postType, setPostType] = useState<'ARTICLE' | 'PROPERTY_AD' | 'VIDEO_NEWS' | 'ANNOUNCEMENT'>('ARTICLE');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('NEWS');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [tags, setTags] = useState('Real Estate, Market Trends');

  // Property ad specific
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [listingType, setListingType] = useState('BUY');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('Delhi');
  const [city, setCity] = useState('Delhi');
  const [sizeSqFt, setSizeSqFt] = useState('1800');
  const [bedrooms, setBedrooms] = useState('3');
  const [duration, setDuration] = useState('MONTH_1');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      try {
        const res = await api.post('/upload/single', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.success) {
          setFeaturedImage(res.data.url);
        }
      } catch (err) {
        alert('Image upload failed.');
      }
    }
  };

  const handleSubmit = async (publishImmediately: boolean) => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        postType,
        title,
        content,
        category,
        excerpt,
        featuredImage,
        videoUrl,
        tags: tags.split(',').map((t) => t.trim()),
        propertyType,
        listingType,
        price,
        location,
        city,
        sizeSqFt,
        bedrooms,
        duration,
        publishImmediately,
      };

      const res = await api.post('/admin/posts/create', payload);
      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] flex items-center space-x-2">
          <PlusCircle className="w-6 h-6 text-red-600" />
          <span>+ Create New Post (Admin Direct Publishing)</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Publish verified news articles, direct advertisements, or video broadcasts without review delay.
        </p>
      </div>

      {success ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Post Created &amp; Published!</h2>
          <p className="text-xs text-slate-600">The content is now live on Bhoomi Bulletin.</p>
          <div className="pt-2 flex justify-center space-x-3">
            <button
              onClick={() => {
                setSuccess(false);
                setTitle('');
                setContent('');
              }}
              className="bg-slate-900 text-white text-xs font-semibold px-5 py-2.5 rounded-lg"
            >
              Create Another Post
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="bg-slate-100 text-slate-700 text-xs font-semibold px-5 py-2.5 rounded-lg"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Post Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Select Post Type *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'ARTICLE', label: 'News Article', icon: Newspaper },
                { id: 'PROPERTY_AD', label: 'Property Ad', icon: Building2 },
                { id: 'VIDEO_NEWS', label: 'Video News', icon: Play },
                { id: 'ANNOUNCEMENT', label: 'Announcement', icon: Megaphone },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPostType(item.id as any)}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center space-y-1.5 transition-all ${
                      postType === item.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Headline / Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Major Highway Corridor Expansion Boosts Property Prices in North India"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* If Property Ad */}
          {postType === 'PROPERTY_AD' ? (
            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Property Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="APARTMENT">Apartment</option>
                    <option value="VILLA">Villa / House</option>
                    <option value="PLOT_LAND">Plot / Land</option>
                    <option value="SHOP">Commercial Shop</option>
                    <option value="OFFICE">Office Space</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Price (INR ₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="8500000"
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="WEEK_1">1 Week</option>
                    <option value="MONTH_1">1 Month</option>
                    <option value="MONTH_3">3 Months</option>
                    <option value="MONTH_6">6 Months</option>
                    <option value="YEAR_1">1 Year</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Size (Sq Ft)</label>
                  <input
                    type="number"
                    value={sizeSqFt}
                    onChange={(e) => setSizeSqFt(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
              >
                <option value="NEWS">News</option>
                <option value="REAL_ESTATE">Real Estate Advisory &amp; Trends</option>
                <option value="VIDEO_NEWS">Video News</option>
                <option value="ANNOUNCEMENT">Official Announcement</option>
              </select>
            </div>
          )}

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Short Excerpt / Summary</label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="One or two sentences summarizing the post..."
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Video URL (if video news or property) */}
          {(postType === 'VIDEO_NEWS' || category === 'VIDEO_NEWS') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Video URL (YouTube or uploaded file)</label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          )}

          {/* Featured Image */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Featured Image</label>
            <div className="flex items-center space-x-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-xs"
              />
              {featuredImage && (
                <img src={featuredImage} alt="Preview" className="w-16 h-10 object-cover rounded-lg border" />
              )}
            </div>
          </div>

          {/* Body Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Content *</label>
            <textarea
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full report, description, market breakdown..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none font-mono"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={loading || !title.trim()}
              onClick={() => handleSubmit(false)}
              className="px-5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={loading || !title.trim()}
              onClick={() => handleSubmit(true)}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow transition-colors"
            >
              {loading ? 'Publishing...' : 'Publish Immediately'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
