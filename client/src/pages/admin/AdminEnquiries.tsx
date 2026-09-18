import React, { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { MessageSquare, Phone, Mail, Clock, CheckCircle } from 'lucide-react';

export const AdminEnquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/leads');
      if (res.data.success) {
        setEnquiries(res.data.enquiries || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/admin/leads/${id}/status`, {
        leadType: 'ENQUIRY',
        status: newStatus,
        note: `Status updated to ${newStatus} by admin`,
      });
      fetchEnquiries();
    } catch (err) {
      alert('Failed to update enquiry status.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 font-['Outfit'] flex items-center space-x-2">
          <MessageSquare className="w-6 h-6 text-red-600" />
          <span>Global Property Enquiries</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete inbox of direct inquiries submitted across all published property advertisements.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading enquiries...</div>
      ) : enquiries.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No enquiries logged yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Sender</th>
                <th className="p-4">Property Inquired</th>
                <th className="p-4">Advertiser</th>
                <th className="p-4">Message</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enquiries.map((enq) => (
                <tr key={enq.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{enq.name}</div>
                    <div className="text-[11px] text-slate-400">{enq.phone} • {enq.email}</div>
                    <span className="text-[10px] text-slate-500 font-semibold">Pref: {enq.preferredContact}</span>
                  </td>
                  <td className="p-4 max-w-xs truncate">
                    <div className="font-bold text-slate-800">{enq.property?.title}</div>
                    <div className="text-[11px] text-slate-400">{enq.property?.location}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{enq.receiverUser?.name}</div>
                    <div className="text-[11px] text-slate-400">{enq.receiverUser?.phone}</div>
                  </td>
                  <td className="p-4 max-w-xs">
                    <p className="text-xs text-slate-600 line-clamp-2 italic">"{enq.message}"</p>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                      {enq.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <select
                      value={enq.status}
                      onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                      className="text-xs p-1.5 border border-slate-300 rounded bg-white font-medium"
                    >
                      <option value="NEW">New</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="FOLLOW_UP">Follow-up</option>
                      <option value="QUALIFIED">Qualified</option>
                      <option value="CONVERTED">Converted</option>
                      <option value="CLOSED">Closed</option>
                    </select>
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
