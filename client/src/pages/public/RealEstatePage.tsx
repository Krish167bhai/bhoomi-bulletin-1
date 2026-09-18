import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import { PropertyCard } from '../../components/property/PropertyCard.js';
import { EnquiryModal } from '../../components/property/EnquiryModal.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Search,
  Filter,
  BookmarkPlus,
  CheckCircle2,
  Building2,
  X,
} from 'lucide-react';

export const RealEstatePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [properties, setProperties] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPropertyForEnquiry, setSelectedPropertyForEnquiry] = useState<any | null>(null);

  // Filter states from URL
  const listingType = searchParams.get('listingType') || 'ALL';
  const propertyType = searchParams.get('propertyType') || 'ALL';
  const city = searchParams.get('city') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const bedrooms = searchParams.get('bedrooms') || 'ANY';
  const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  // Local search input
  const [cityInput, setCityInput] = useState(city);
  const [saveSearchModalOpen, setSaveSearchModalOpen] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [savingSearch, setSavingSearch] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        query.set('page', String(page));
        query.set('limit', '12');
        if (listingType !== 'ALL') query.set('listingType', listingType);
        if (propertyType !== 'ALL') query.set('propertyType', propertyType);
        if (city) query.set('city', city);
        if (minPrice) query.set('minPrice', minPrice);
        if (maxPrice) query.set('maxPrice', maxPrice);
        if (bedrooms !== 'ANY') query.set('bedrooms', bedrooms);
        if (verifiedOnly) query.set('verifiedOnly', 'true');
        if (sortBy) query.set('sortBy', sortBy);

        const res = await api.get(`/properties/published?${query.toString()}`);
        if (res.data.success) {
          setProperties(res.data.properties || []);
          setTotalPages(res.data.pagination?.totalPages || 1);
          setTotalCount(res.data.pagination?.total || 0);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'ALL' || value === 'ANY' || value === 'false') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('city', cityInput.trim());
  };

  const handleSaveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setSavingSearch(true);
    try {
      const filters = {
        listingType,
        propertyType,
        city,
        minPrice,
        maxPrice,
        bedrooms,
        verifiedOnly,
      };
      await api.post('/saved-searches', {
        name: saveSearchName || `${bedrooms !== 'ANY' ? `${bedrooms} BHK ` : ''}${propertyType !== 'ALL' ? propertyType : 'Property'} in ${city || 'India'}`,
        filters,
        alertsActive: true,
      });
      alert('Search saved! You will receive notifications when new matching properties are published.');
      setSaveSearchModalOpen(false);
      setSaveSearchName('');
    } catch (err) {
      alert('Failed to save search.');
    } finally {
      setSavingSearch(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Verified Property Marketplace
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-['Outfit']">
            Real Estate Listings
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Browse verified apartments, plots, commercial offices, and luxury villas directly from owners and verified agents.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSaveSearchModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-3 rounded-xl border border-slate-700 flex items-center space-x-2 transition-colors uppercase tracking-wider"
          >
            <BookmarkPlus className="w-4 h-4 text-gold-500" />
            <span>Save This Search &amp; Get Alerts</span>
          </button>
          <button
            onClick={() => navigate('/advertise-property')}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-3 rounded-xl shadow transition-colors uppercase tracking-wider"
          >
            + Post Your Property
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Buy / Rent */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Purpose</label>
            <select
              value={listingType}
              onChange={(e) => updateParam('listingType', e.target.value)}
              className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="ALL">All (Buy, Rent, Invest)</option>
              <option value="BUY">Buy</option>
              <option value="RENT">Rent</option>
              <option value="INVEST">Invest</option>
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Property Type</label>
            <select
              value={propertyType}
              onChange={(e) => updateParam('propertyType', e.target.value)}
              className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="ALL">All Property Types</option>
              <option value="APARTMENT">Apartment / Flat</option>
              <option value="VILLA">Villa / Independent House</option>
              <option value="PLOT_LAND">Plot / Land</option>
              <option value="SHOP">Commercial Shop</option>
              <option value="OFFICE">Office Space</option>
              <option value="WAREHOUSE">Warehouse</option>
              <option value="COMMERCIAL">Commercial Other</option>
            </select>
          </div>

          {/* City Search */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">City / Region</label>
            <form onSubmit={handleCitySearch} className="relative">
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="e.g. Delhi, Noida, Gurugram"
                className="w-full text-xs font-semibold pl-8 pr-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </form>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Bedrooms</label>
            <select
              value={bedrooms}
              onChange={(e) => updateParam('bedrooms', e.target.value)}
              className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="ANY">Any Bedrooms</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => updateParam('sortBy', e.target.value)}
              className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="featured">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="views_desc">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Checkbox: Verified Only */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <label className="inline-flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => updateParam('verifiedOnly', String(e.target.checked))}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="font-semibold text-slate-700 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Show 🔵 Verified Properties Only</span>
            </span>
          </label>

          <span className="text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{totalCount}</strong> matching properties
          </span>
        </div>
      </div>

      {/* Property Cards Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading listings...</div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No matching properties found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try broadening your filter criteria or post a property requirement to receive direct matches from verified brokers.
          </p>
          <button
            onClick={() => {
              setSearchParams(new URLSearchParams());
              setCityInput('');
            }}
            className="mt-2 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              onEnquireClick={(p) => setSelectedPropertyForEnquiry(p)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 pt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('page', String(p));
                setSearchParams(params);
              }}
              className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                page === p ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Enquiry Modal */}
      <EnquiryModal
        property={selectedPropertyForEnquiry}
        isOpen={Boolean(selectedPropertyForEnquiry)}
        onClose={() => setSelectedPropertyForEnquiry(null)}
      />

      {/* Save Search Modal (Requirement 12) */}
      {saveSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 font-['Outfit']">
                Save Search &amp; Enable Alerts
              </h3>
              <button
                onClick={() => setSaveSearchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Name this search. We will automatically alert you whenever a newly approved property matches your exact criteria.
            </p>
            <form onSubmit={handleSaveSearch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Search Name (e.g. 3 BHK Delhi Under ₹80 Lakh)
                </label>
                <input
                  type="text"
                  required
                  value={saveSearchName}
                  onChange={(e) => setSaveSearchName(e.target.value)}
                  placeholder="e.g. 3 BHK Delhi Under ₹80 Lakh"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={savingSearch}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider shadow disabled:opacity-50"
              >
                {savingSearch ? 'Saving...' : 'Save & Activate Alerts'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
