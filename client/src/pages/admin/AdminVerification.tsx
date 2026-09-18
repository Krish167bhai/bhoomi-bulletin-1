import React, { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export const AdminVerification: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [tab, setTab] = useState<'USERS' | 'PROPERTIES'>('USERS');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, propsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/properties'),
      ]);
      if (usersRes.data.success) setUsers(usersRes.data.users || []);
      if (propsRes.data.success) setProperties(resPropsFilter(propsRes.data.properties || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resPropsFilter = (items: any[]) => items;

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateUserVerification = async (userId: string, newStatus: string) => {
    try {
      await api.patch(`/admin/users/${userId}/verification`, {
        status: newStatus,
        notes: `Verification status updated to ${newStatus} by admin`,
      });
      alert(`User verification status changed to: ${newStatus}`);
      fetchData();
    } catch (err) {
      alert('Failed to update verification status.');
    }
  };

  const handleUpdatePropVerification = async (propId: string, newStatus: string) => {
    try {
      await api.patch(`/admin/properties/${propId}`, {
        verificationStatus: newStatus,
      });
      alert(`Property verification badge updated to: ${newStatus}`);
      fetchData();
    } catch (err) {
      alert('Failed to update property verification.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 font-['Outfit'] flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
          <span>Official 🔵 Verified Badge &amp; Document Review</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review owner identities, broker RERA licenses, and property title documentation. Grant or revoke verified badges.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab('USERS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'USERS' ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          Owners &amp; Brokers Verification ({users.length})
        </button>
        <button
          onClick={() => setTab('PROPERTIES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'PROPERTIES' ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          Property Listings Verification ({properties.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading verification records...</div>
      ) : tab === 'USERS' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role / Agency</th>
                <th className="p-4">RERA License / ID</th>
                <th className="p-4">Current Badge</th>
                <th className="p-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-[11px] text-slate-400">{u.email} • {u.phone}</div>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-slate-800">{u.role}</span>
                    {u.companyName && <div className="text-[11px] text-slate-500">{u.companyName}</div>}
                  </td>
                  <td className="p-4 font-mono font-semibold text-slate-700">
                    {u.licenseNumber || 'Not provided'}
                  </td>
                  <td className="p-4">
                    {u.verificationStatus === 'VERIFIED' ? (
                      <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 w-max">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>🔵 Verified</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">{u.verificationStatus}</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {u.verificationStatus !== 'VERIFIED' ? (
                      <button
                        onClick={() => handleUpdateUserVerification(u.id, 'VERIFIED')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                      >
                        Grant 🔵 Verified
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateUserVerification(u.id, 'NONE')}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-red-100 hover:text-red-700 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        Revoke Badge
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Property</th>
                <th className="p-4">Advertiser</th>
                <th className="p-4">Location</th>
                <th className="p-4">Badge Status</th>
                <th className="p-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {properties.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-900 max-w-xs truncate">
                    {p.title}
                  </td>
                  <td className="p-4">{p.user?.name}</td>
                  <td className="p-4">{p.location}, {p.city}</td>
                  <td className="p-4">
                    {p.verificationStatus === 'VERIFIED' ? (
                      <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 w-max">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>🔵 Verified Property</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">{p.verificationStatus}</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {p.verificationStatus !== 'VERIFIED' ? (
                      <button
                        onClick={() => handleUpdatePropVerification(p.id, 'VERIFIED')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                      >
                        Verify Property
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdatePropVerification(p.id, 'NONE')}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-red-100 hover:text-red-700 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        Revoke Verification
                      </button>
                    )}
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
