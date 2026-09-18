import React, { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { Users, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [changeRequests, setChangeRequests] = useState<any[]>([]);
  const [tab, setTab] = useState<'USERS' | 'REQUESTS'>('USERS');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, reqsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/info-change-requests'),
      ]);
      if (usersRes.data.success) setUsers(usersRes.data.users || []);
      if (reqsRes.data.success) setChangeRequests(reqsRes.data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolveRequest = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      await api.post(`/admin/info-change-requests/${id}/resolve`, {
        action,
        adminNotes: `Resolved as ${action} by administrator`,
      });
      alert(`Request has been ${action.toLowerCase()}d.`);
      fetchData();
    } catch (err) {
      alert('Failed to resolve request.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 font-['Outfit'] flex items-center space-x-2">
          <Users className="w-6 h-6 text-red-600" />
          <span>User Accounts &amp; Information Security</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review registered accounts and approve/reject sensitive profile change requests (Requirement 23).
        </p>
      </div>

      <div className="flex space-x-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab('USERS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'USERS' ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          All Users ({users.length})
        </button>
        <button
          onClick={() => setTab('REQUESTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            tab === 'REQUESTS' ? 'bg-red-600 text-white shadow' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          <span>Information Change Requests ({changeRequests.filter(r => r.status === 'PENDING').length} Pending)</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading user records...</div>
      ) : tab === 'USERS' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Mobile Number</th>
                <th className="p-4">Role / Type</th>
                <th className="p-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-900">{u.name}</td>
                  <td className="p-4 font-mono">{u.email}</td>
                  <td className="p-4 font-mono">{u.phone}</td>
                  <td className="p-4">
                    <span className="font-semibold text-slate-800">{u.role}</span>
                    <span className="text-[10px] text-slate-400 block uppercase">({u.userType})</span>
                  </td>
                  <td className="p-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
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
                <th className="p-4">User</th>
                <th className="p-4">Current Info</th>
                <th className="p-4">Requested Updates</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {changeRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No information change requests submitted.
                  </td>
                </tr>
              ) : (
                changeRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">{req.user?.name}</td>
                    <td className="p-4 font-mono text-[11px] text-slate-500">
                      <div>{req.user?.email}</div>
                      <div>{req.user?.phone}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-800 space-y-0.5">
                      {req.requestedName && <div>Name: <span className="text-green-700">{req.requestedName}</span></div>}
                      {req.requestedEmail && <div>Email: <span className="text-green-700">{req.requestedEmail}</span></div>}
                      {req.requestedPhone && <div>Phone: <span className="text-green-700">{req.requestedPhone}</span></div>}
                    </td>
                    <td className="p-4 text-slate-500 max-w-xs">{req.reason || 'Not specified'}</td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          req.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : req.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {req.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleResolveRequest(req.id, 'APPROVE')}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-bold text-xs"
                          >
                            Approve Change
                          </button>
                          <button
                            onClick={() => handleResolveRequest(req.id, 'REJECT')}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
