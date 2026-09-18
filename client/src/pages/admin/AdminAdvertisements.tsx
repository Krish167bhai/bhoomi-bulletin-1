import React, { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { formatPriceINR } from '../../components/property/PropertyCard.js';
import {
  Calendar,
  Clock,
  RotateCcw,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export const AdminAdvertisements: React.FC = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewModalAd, setRenewModalAd] = useState<any | null>(null);
  const [renewDuration, setRenewDuration] = useState('MONTH_1');

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/properties?isAd=true');
      if (res.data.success) {
        setAds(res.data.properties || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleManualExpire = async (id: string) => {
    if (!confirm('Expire this advertisement immediately? It will be moved to inactive history.')) return;
    try {
      await api.patch(`/admin/properties/${id}`, {
        status: 'EXPIRED',
        isPublished: false,
      });
      fetchAds();
    } catch (err) {
      alert('Failed to expire ad.');
    }
  };

  const handleTogglePause = async (id: string, currentlyPublished: boolean) => {
    try {
      await api.patch(`/admin/properties/${id}`, {
        isPublished: !currentlyPublished,
      });
      fetchAds();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleRenew = async () => {
    if (!renewModalAd) return;
    try {
      await api.patch(`/admin/properties/${renewModalAd.id}`, {
        renewDuration,
      });
      alert('Advertisement renewed successfully!');
      setRenewModalAd(null);
      fetchAds();
    } catch (err) {
      alert('Failed to renew ad.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">
          Advertisement Expiry &amp; Duration Management
        </h1>
        <p className="text-xs text-slate-500">
          Monitor scheduled advertisement durations, trigger immediate renewals, pause visibility, or manually expire ads.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading advertisements...</div>
      ) : ads.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No advertisements currently registered.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Ad / Property</th>
                  <th className="p-4">Owner / Agent</th>
                  <th className="p-4">Duration Plan</th>
                  <th className="p-4">Start Date</th>
                  <th className="p-4">Scheduled Expiry</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ad Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ads.map((ad) => {
                  const isExpired = ad.status === 'EXPIRED' || (ad.adExpiryDate && new Date(ad.adExpiryDate) < new Date());
                  return (
                    <tr key={ad.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{ad.title}</div>
                        <div className="text-[11px] text-slate-400">{formatPriceINR(ad.price)} • {ad.city}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{ad.user?.name}</div>
                        <div className="text-[11px] text-slate-400">{ad.user?.phone}</div>
                      </td>
                      <td className="p-4 font-bold text-slate-700">
                        {ad.adDuration?.replace('_', ' ')}
                      </td>
                      <td className="p-4">
                        {ad.adStartDate ? new Date(ad.adStartDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold">
                          {ad.adExpiryDate ? new Date(ad.adExpiryDate).toLocaleDateString() : 'N/A'}
                        </div>
                        {isExpired && (
                          <span className="text-[10px] text-red-600 font-bold">Past Expiry</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            ad.status === 'APPROVED' && ad.isPublished
                              ? 'bg-green-100 text-green-800'
                              : ad.status === 'APPROVED' && !ad.isPublished
                              ? 'bg-amber-100 text-amber-800'
                              : ad.status === 'EXPIRED'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {ad.status === 'APPROVED' && !ad.isPublished ? 'PAUSED' : ad.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {ad.status === 'APPROVED' && (
                          <>
                            <button
                              onClick={() => handleTogglePause(ad.id, ad.isPublished)}
                              className="p-1.5 rounded-lg border hover:bg-slate-100 text-slate-700"
                              title={ad.isPublished ? 'Pause Advertisement' : 'Resume Advertisement'}
                            >
                              {ad.isPublished ? <PauseCircle className="w-4 h-4 text-amber-600" /> : <PlayCircle className="w-4 h-4 text-green-600" />}
                            </button>
                            <button
                              onClick={() => handleManualExpire(ad.id)}
                              className="px-2.5 py-1 rounded bg-slate-200 hover:bg-red-100 hover:text-red-700 text-slate-700 font-semibold text-[11px]"
                            >
                              Expire
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setRenewModalAd(ad);
                            setRenewDuration(ad.adDuration || 'MONTH_1');
                          }}
                          className="px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px]"
                        >
                          Renew
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {renewModalAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
              Renew Property Advertisement
            </h3>
            <p className="text-xs text-slate-600">
              Select new advertisement duration for <strong>"{renewModalAd.title}"</strong>. This resets the start date to today and calculates the new expiry timestamp.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Renewal Duration</label>
              <select
                value={renewDuration}
                onChange={(e) => setRenewDuration(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
              >
                <option value="WEEK_1">1 Week</option>
                <option value="MONTH_1">1 Month</option>
                <option value="MONTH_2">2 Months</option>
                <option value="MONTH_3">3 Months</option>
                <option value="MONTH_6">6 Months</option>
                <option value="YEAR_1">1 Year</option>
                <option value="YEAR_2">2 Years</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRenewModalAd(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRenew}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow"
              >
                Confirm Renewal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
