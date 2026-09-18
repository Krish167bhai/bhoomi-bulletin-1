import React, { useState, useEffect } from "react";
import api from "../../api/client.js";
import { useNotifications } from "../../context/NotificationContext.js";
import { Bell, CheckCheck, Trash2, AlertCircle } from "lucide-react";

export const MyNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const { fetchNotifications: refreshCtx } = useNotifications();

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      const list = res.data.notifications || res.data.data || res.data || [];
      setNotifications(list);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      refreshCtx();
    } catch (err) {
      alert("Failed to mark all as read");
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      refreshCtx();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      refreshCtx();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = notifications.filter((n) => (filter === "UNREAD" ? !n.isRead : true));

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 font-['Outfit']">Notifications Center</h1>
          <p className="text-xs text-slate-500">System alerts, enquiry notifications, and advertisement status updates.</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          <CheckCheck className="w-4 h-4 text-emerald-600" />
          <span>Mark All as Read</span>
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
            filter === "ALL" ? "bg-red-600 text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("UNREAD")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
            filter === "UNREAD" ? "bg-red-600 text-white" : "bg-white text-slate-600 border border-slate-200"
          }`}
        >
          Unread ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading notifications...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm space-y-2">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Notifications</h3>
          <p className="text-xs text-slate-500">You don't have any notifications under this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start space-x-4 ${
                n.isRead ? "bg-white border-slate-100" : "bg-red-50/40 border-red-100 shadow-sm"
              }`}
            >
              <div className={`p-2.5 rounded-xl ${n.isRead ? "bg-slate-100 text-slate-500" : "bg-red-600 text-white"}`}>
                <Bell className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 font-['Outfit']">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{n.message}</p>

                <div className="flex items-center space-x-3 mt-3">
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="text-[11px] font-bold text-red-600 hover:underline"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-600 flex items-center space-x-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyNotifications;
