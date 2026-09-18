import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import { CheckCircle2, ClipboardList, Send, AlertCircle } from 'lucide-react';

export const PropertyRequirementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    type: 'BUY',
    propertyType: 'APARTMENT',
    preferredLocation: '',
    budgetMin: '',
    budgetMax: '',
    preferredSize: '',
    additionalDetails: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        type: formData.type,
        propertyType: formData.propertyType,
        preferredLocation: formData.preferredLocation,
        budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : null,
        budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : null,
        preferredSize: formData.preferredSize || null,
        additionalDetails: formData.additionalDetails || null,
      };

      const res = await api.post('/enquiries/requirement', payload);
      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit requirement. Please check input fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="space-y-3 relative z-10">
          <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Lead Generator
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-['Outfit']">
            Post Your Property Requirement
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
            Looking to buy, rent, or invest in real estate? Tell us your exact budget and location criteria. Our network of verified owners and certified brokers will connect with matching properties.
          </p>
        </div>
      </div>

      {success ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Outfit']">
              Requirement Registered Successfully!
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your property requirement has been recorded in our lead management system. You can track matching responses inside your dashboard.
            </p>
          </div>

          <div className="pt-4 flex justify-center gap-4">
            {user ? (
              <button
                onClick={() => navigate('/account/my-requirements')}
                className="bg-slate-900 text-white text-xs font-semibold px-6 py-3 rounded-xl shadow hover:bg-slate-800 uppercase tracking-wider"
              >
                View My Requirements
              </button>
            ) : (
              <button
                onClick={() => navigate('/signup')}
                className="bg-red-600 text-white text-xs font-bold px-6 py-3 rounded-xl shadow hover:bg-red-700 uppercase tracking-wider"
              >
                Create Account to Track Leads
              </button>
            )}
            <button
              onClick={() => {
                setSuccess(false);
                setFormData({
                  ...formData,
                  preferredLocation: '',
                  additionalDetails: '',
                });
              }}
              className="bg-slate-100 text-slate-700 text-xs font-semibold px-6 py-3 rounded-xl hover:bg-slate-200 uppercase tracking-wider"
            >
              Post Another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your name"
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
                placeholder="10-digit mobile"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
              >
                <option value="BUY">Looking to Buy</option>
                <option value="RENT">Looking to Rent</option>
                <option value="INVEST">Investment Purpose</option>
              </select>
            </div>

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
                <option value="WAREHOUSE">Warehouse</option>
                <option value="COMMERCIAL">Commercial Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Location / City / Sector *</label>
            <input
              type="text"
              name="preferredLocation"
              required
              value={formData.preferredLocation}
              onChange={handleInputChange}
              placeholder="e.g. Golf Course Extension Road, Gurugram or South Delhi"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min Budget (INR ₹)</label>
              <input
                type="number"
                name="budgetMin"
                value={formData.budgetMin}
                onChange={handleInputChange}
                placeholder="e.g. 5000000"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Budget (INR ₹)</label>
              <input
                type="number"
                name="budgetMax"
                value={formData.budgetMax}
                onChange={handleInputChange}
                placeholder="e.g. 15000000"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Size / BHK</label>
              <input
                type="text"
                name="preferredSize"
                value={formData.preferredSize}
                onChange={handleInputChange}
                placeholder="e.g. 3 BHK, 1800 sq ft"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Requirements</label>
            <textarea
              name="additionalDetails"
              rows={3}
              value={formData.additionalDetails}
              onChange={handleInputChange}
              placeholder="e.g. Gated society, high floor preferred, ready to move in within 2 months..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-sm uppercase tracking-wider shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting Requirement...' : 'Post Requirement Now'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
