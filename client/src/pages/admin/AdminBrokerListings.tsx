import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { formatPriceINR } from '../../components/property/PropertyCard.js';
import { Briefcase, CheckCircle2, ShieldAlert, ExternalLink, Trash2 } from 'lucide-react';

export const AdminBrokerListings: React.FC = () => {
  const [brokerProperties, setBrokerProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBrokerProps = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/properties');
      if (res.data.success) {
        // Filter listings where userType is BROKER or AGENT
        const filtered = (res.data.properties || []).filter(
          (p: any) => p.userType === 'BROKER' || p.userType === 'AGENT' || p.user?.role === 'BROKER' || p.user?.role === 'AGENT'
        );
        setBrokerProperties(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokerProps();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 font-['Outfit'] flex items-center space-x-2">
          <Briefcase className="w-6 h-6 text-red-600" />
          <span>Broker &amp; Agent Property Listings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Special review and verification queue for certified real estate brokers, agencies, and regional agents.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading broker listings...</div>
      ) : brokerProperties.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No broker or agent property listings currently logged.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Property</th>
                <th className="p-4">Broker / Agency</th>
                <th className="p-4">Agent Verification</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {brokerProperties.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{p.title}</div>
                    <div className="text-[11px] text-slate-400">{p.location}, {p.city}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{p.user?.name}</div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {p.user?.companyName || 'Registered Broker'}
                    </div>
                  </td>
                  <td className="p-4">
                    {p.user?.verificationStatus === 'VERIFIED' ? (
                      <span className="text-blue-600 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>🔵 Verified Broker</span>
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium flex items-center space-x-1">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Unverified Profile</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-bold text-slate-900">{formatPriceINR(p.price)}</td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        p.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link
                      to={`/property/${p.slug}`}
                      target="_blank"
                      className="inline-block p-1 text-slate-500 hover:text-slate-900"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
