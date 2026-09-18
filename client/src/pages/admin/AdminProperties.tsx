import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api/client.js';
import { formatPriceINR } from '../../components/property/PropertyCard.js';
import {
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Edit,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const AdminProperties: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || 'ALL';

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Approval Modal State
  const [approvalModalProperty, setApprovalModalProperty] = useState<any | null>(null);
  const [selectedDuration, setSelectedDuration] = useState('MONTH_1');
  const [grantVerified, setGrantVerified] = useState(true);
  const [markFeatured, setMarkFeatured] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Reject Modal State
  const [rejectModalProperty, setRejectModalProperty] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const query = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/admin/properties${query}`);
      if (res.data.success) {
        setProperties(res.data.properties || []);
      }
    } catch (err) {
      console.error('Failed to load properties for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [statusFilter]);

  const handleApprove = async () => {
    if (!approvalModalProperty) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/admin/submissions/${approvalModalProperty.id}/approve`, {
        duration: selectedDuration,
        verified: grantVerified,
        isFeatured: markFeatured,
      });

      if (res.data.success) {
        alert('Property approved, activated, and published live!');
        setApprovalModalProperty(null);
        fetchProperties();
      }
    } catch (err) {
      alert('Error approving property.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModalProperty) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/admin/submissions/${rejectModalProperty.id}/reject`, {
        reason: rejectionReason,
      });

      if (res.data.success) {
        alert('Property submission rejected.');
        setRejectModalProperty(null);
        setRejectionReason('');
        fetchProperties();
      }
    } catch (err) {
      alert('Error rejecting property.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this property?')) return;
    try {
      await api.delete(`/admin/properties/${id}`);
      fetchProperties();
    } catch (err) {
      alert('Failed to delete property.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">
            Property Submissions &amp; Listings Management
          </h1>
          <p className="text-xs text-slate-500">
            Review user submissions, verify details, grant verified badges, or moderate active advertisements.
          </p>
        </div>

        <Link
          to="/admin/create-post"
          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg uppercase tracking-wider shadow"
        >
          + Create Post
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'ALL', label: 'All Properties' },
          { id: 'PENDING_APPROVAL', label: 'Pending Approval (Queue)' },
          { id: 'APPROVED', label: 'Published / Active' },
          { id: 'EXPIRED', label: 'Expired' },
          { id: 'REJECTED', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              if (tab.id === 'ALL') next.delete('status');
              else next.set('status', tab.id);
              setSearchParams(next);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              statusFilter === tab.id
                ? 'bg-slate-900 text-white shadow'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading properties...</div>
      ) : properties.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No properties found under this status filter.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Property</th>
                  <th className="p-4">Advertiser</th>
                  <th className="p-4">Price / Type</th>
                  <th className="p-4">Duration &amp; Expiry</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 min-w-[220px]">
                      <div className="font-bold text-slate-900 line-clamp-1">{p.title}</div>
                      <div className="text-[11px] text-slate-400">{p.location}, {p.city}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{p.user?.name}</div>
                      <div className="text-[11px] text-slate-400">{p.user?.phone}</div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {p.userType}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{formatPriceINR(p.price)}</div>
                      <div className="text-[11px] text-slate-400">{p.propertyType.replace('_', ' ')}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold">{p.adDuration?.replace('_', ' ')}</div>
                      <div className="text-[11px] text-slate-400">
                        {p.adExpiryDate ? `Expires: ${new Date(p.adExpiryDate).toLocaleDateString()}` : 'Not scheduled'}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          p.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : p.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : p.status === 'EXPIRED'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      {p.verificationStatus === 'VERIFIED' ? (
                        <span className="text-blue-600 font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>🔵 Verified</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">{p.verificationStatus}</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {p.status === 'PENDING_APPROVAL' && (
                        <>
                          <button
                            onClick={() => {
                              setApprovalModalProperty(p);
                              setSelectedDuration(p.adDuration || 'MONTH_1');
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold px-2.5 py-1 rounded text-[11px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectModalProperty(p)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-2.5 py-1 rounded text-[11px]"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <Link
                        to={`/property/${p.slug}`}
                        target="_blank"
                        className="inline-block p-1 text-slate-500 hover:text-slate-900"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1 text-slate-400 hover:text-red-600"
                        title="Delete Property"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approvalModalProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
              Approve &amp; Publish Property Advertisement
            </h3>
            <p className="text-xs text-slate-600">
              Approving <strong>"{approvalModalProperty.title}"</strong> will publish it live on Bhoomi Bulletin and start its advertisement duration timer.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Set Ad Duration</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
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

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="grantVerified"
                  checked={grantVerified}
                  onChange={(e) => setGrantVerified(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <label htmlFor="grantVerified" className="text-xs text-slate-800 font-semibold cursor-pointer">
                  Grant Official 🔵 Verified Property Badge
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="markFeatured"
                  checked={markFeatured}
                  onChange={(e) => setMarkFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600"
                />
                <label htmlFor="markFeatured" className="text-xs text-slate-800 font-semibold cursor-pointer">
                  Highlight as FEATURED on Homepage
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApprovalModalProperty(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleApprove}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow"
              >
                {actionLoading ? 'Approving...' : 'Confirm & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
              Reject Property Submission
            </h3>
            <p className="text-xs text-slate-600">
              Specify reason for rejection. This note will be sent as a notification to the advertiser.
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete title documents, invalid pricing claims, or blurry photos."
              className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            />

            <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModalProperty(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleReject}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
