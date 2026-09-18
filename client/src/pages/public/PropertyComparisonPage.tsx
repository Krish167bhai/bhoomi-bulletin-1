import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { useCompare } from '../../context/CompareContext.js';
import { formatPriceINR } from '../../components/property/PropertyCard.js';
import {
  Scale,
  X,
  CheckCircle2,
  Building2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const PropertyComparisonPage: React.FC = () => {
  const { compareIds, removeFromCompare, clearCompare } = useCompare();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCompareData = async () => {
      if (compareIds.length === 0) {
        setProperties([]);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/properties/compare?ids=${compareIds.join(',')}`);
        if (res.data.success) {
          setProperties(res.data.properties || []);
        }
      } catch (err) {
        console.error('Error fetching comparison:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompareData();
  }, [compareIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4" />
            <span>Side-by-Side Matrix</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Property Comparison ({properties.length} / 4)
          </h1>
        </div>

        {properties.length > 0 && (
          <button
            onClick={clearCompare}
            className="text-xs font-semibold text-slate-500 hover:text-red-600 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Clear All Comparisons
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading comparison details...</div>
      ) : properties.length < 2 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <Scale className="w-16 h-16 text-slate-300 mx-auto" />
          <h3 className="text-xl font-bold text-slate-800 font-['Outfit']">
            Select at least 2 properties to compare
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Browse our listings and click the scale icon or "Add to Compare" button on 2 to 4 properties to view their specs side-by-side.
          </p>
          <Link
            to="/real-estate"
            className="inline-block bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-6 py-3 rounded-xl shadow uppercase tracking-wider transition-colors"
          >
            Explore Real Estate Listings
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase w-48 sticky left-0 bg-slate-50">
                  Feature / Specification
                </th>
                {properties.map((p) => (
                  <th key={p.id} className="p-4 min-w-[240px] max-w-[280px]">
                    <div className="relative space-y-2">
                      <button
                        onClick={() => removeFromCompare(p.id)}
                        title="Remove from comparison"
                        className="absolute -top-1 -right-1 p-1 bg-slate-200 hover:bg-red-600 hover:text-white rounded-full text-slate-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <img
                        src={p.featuredImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'}
                        alt={p.title}
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      <Link to={`/property/${p.slug}`}>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-2 hover:text-red-600 mt-1">
                          {p.title}
                        </h4>
                      </Link>
                      <div className="text-base font-extrabold text-red-600 font-['Outfit']">
                        {formatPriceINR(p.price)}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {/* Type */}
              <tr>
                <td className="p-4 font-bold text-slate-500 bg-slate-50 sticky left-0">Property Type</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 font-semibold">{p.propertyType.replace('_', ' ')}</td>
                ))}
              </tr>
              {/* Listing Type */}
              <tr>
                <td className="p-4 font-bold text-slate-500 bg-slate-50 sticky left-0">Listing Type</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.listingType}</td>
                ))}
              </tr>
              {/* Location */}
              <tr>
                <td className="p-4 font-bold text-slate-500 bg-slate-50 sticky left-0">Location &amp; City</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 font-medium">{p.location}, {p.city}</td>
                ))}
              </tr>
              {/* Size */}
              <tr>
                <td className="p-4 font-bold text-slate-500 bg-slate-50 sticky left-0">Area (Sq. Ft.)</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4 font-semibold">{p.sizeSqFt} sq.ft</td>
                ))}
              </tr>
              {/* Bedrooms */}
              <tr>
                <td className="p-4 font-bold text-slate-500 bg-slate-50 sticky left-0">Bedrooms</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.bedrooms ? `${p.bedrooms} BHK` : 'N/A'}</td>
                ))}
              </tr>
              {/* Bathrooms */}
              <tr>
                <td className="p-4 font-bold text-slate-500 bg-slate-50 sticky left-0">Bathrooms</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.bathrooms || 'N/A'}</td>
                ))}
              </tr>
              {/* Furnishing */}
              <tr>
                <td className="p-4 font-bold text-slate-500 bg-slate-50 sticky left-0">Furnishing</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">{p.furnishing || 'Unfurnished'}</td>
                ))}
              </tr>
              {/* Verification Status */}
              <tr>
                <td className="p-4 font-bold text-slate-500 bg-slate-50 sticky left-0">Verification</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">
                    {p.verificationStatus === 'VERIFIED' ? (
                      <span className="inline-flex items-center space-x-1 text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>🔵 Verified</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Under Review</span>
                    )}
                  </td>
                ))}
              </tr>
              {/* Advertiser */}
              <tr>
                <td className="p-4 font-bold text-slate-500 bg-slate-50 sticky left-0">Advertiser</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">
                    <div className="font-semibold">{p.user?.name}</div>
                    <div className="text-[11px] text-slate-400">{p.user?.companyName || p.userType}</div>
                  </td>
                ))}
              </tr>
              {/* Action */}
              <tr>
                <td className="p-4 font-bold text-slate-500 bg-slate-50 sticky left-0">Action</td>
                {properties.map((p) => (
                  <td key={p.id} className="p-4">
                    <Link
                      to={`/property/${p.slug}`}
                      className="inline-flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors"
                    >
                      <span>View Listing</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
