import React, { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { Bell, CheckCheck, Trash2, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      alert('Failed to mark all as read.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      alert('Failed to delete notification.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Outfit'] flex items-center space-x-2">
            <Bell className="w-6 h-6 text-red-600" />
            <span>Administrator Notification Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time event logs for registrations, pending property ads, buyer enquiries, and expiry warnings.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center space-x-1 text-xs font-semibold text-slate-700 hover:text-red-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-green-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No notifications logged at this time.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between ${
                n.isRead ? 'bg-white border-slate-200 opacity-80' : 'bg-red-50/50 border-red-200 shadow-sm'
              }`}
            >
              <div className="space-y-1 pr-4">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${n.isRead ? 'bg-slate-300' : 'bg-red-600 animate-pulse'}`}
                  />
                  <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                  <span className="text-[11px] text-slate-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-4">{n.message}</p>
                {n.link && (
                  <div className="pl-4 pt-1">
                    <Link
                      to={n.link}
                      className="text-xs font-bold text-red-600 hover:underline inline-flex items-center space-x-1"
                    >
                      <span>Take Action</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleDelete(n.id)}
                className="text-slate-400 hover:text-red-600 p-1 rounded"
                title="Delete Notification"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
