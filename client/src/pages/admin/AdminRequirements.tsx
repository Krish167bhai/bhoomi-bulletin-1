import React, { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { formatPriceINR } from '../../components/property/PropertyCard.js';
import { FileSpreadsheet, Phone, Mail, MapPin } from 'lucide-react';

export const AdminRequirements: React.FC = () => {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/leads');
      if (res.data.success) {
        setRequirements(res.data.requirements || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/admin/leads/${id}/status`, {
        leadType: 'REQUIREMENT',
        status: newStatus,
        note: `Status changed to ${newStatus} by admin`,
      });
      fetchRequirements();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 font-['Outfit'] flex items-center space-x-2">
          <FileSpreadsheet className="w-6 h-6 text-red-600" />
          <span>Property Requirements &amp; Buyer Leads</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review requirements submitted by genuine buyers and tenants looking for apartments, plots, and offices.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading requirements...</div>
      ) : requirements.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No property requirements submitted yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Applicant</th>
                <th className="p-4">Looking For</th>
                <th className="p-4">Preferred Location</th>
                <th className="p-4">Budget Range</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requirements.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{req.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Phone className="w-3 h-3" />
                      <span>{req.phone}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{req.propertyType}</div>
                    <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                      {req.type}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-700">{req.preferredLocation}</td>
                  <td className="p-4 font-bold text-slate-900">
                    {req.budgetMin ? formatPriceINR(req.budgetMin) : 'Any'} - {req.budgetMax ? formatPriceINR(req.budgetMax) : 'Max'}
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <select
                      value={req.status}
                      onChange={(e) => handleStatusChange(req.id, e.target.value)}
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
