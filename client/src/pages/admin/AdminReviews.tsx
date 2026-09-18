import React, { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reviews');
      if (res.data.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleModerate = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/reviews/${id}/moderate`, { status });
      fetchReviews();
    } catch (err) {
      alert('Failed to update review status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this review?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      fetchReviews();
    } catch (err) {
      alert('Failed to delete review.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 font-['Outfit'] flex items-center space-x-2">
          <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          <span>Reviews &amp; Ratings Moderation</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review 1-5 star user feedback. Only approved reviews appear on public property listing pages.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No user reviews submitted yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Property Reviewed</th>
                <th className="p-4">Review Content</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800">
                    {rev.user?.name}
                    <div className="text-[11px] text-slate-400 font-normal">{rev.user?.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 max-w-xs truncate font-semibold text-slate-700">
                    {rev.property?.title || 'General Agent Review'}
                  </td>
                  <td className="p-4 max-w-sm">
                    {rev.title && <div className="font-bold text-slate-900">{rev.title}</div>}
                    <p className="text-xs text-slate-600 line-clamp-2">{rev.content}</p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        rev.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : rev.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {rev.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleModerate(rev.id, 'APPROVED')}
                        className="px-2.5 py-1 bg-green-600 text-white rounded text-[11px] font-bold"
                      >
                        Approve
                      </button>
                    )}
                    {rev.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleModerate(rev.id, 'REJECTED')}
                        className="px-2.5 py-1 bg-amber-600 text-white rounded text-[11px] font-bold"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(rev.id)}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
