import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.js";
import { Home, MessageSquare, Heart, Bell, PlusCircle, ArrowRight, ShieldCheck } from "lucide-react";

export const AccountDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeAds: 0,
    enquiriesCount: 0,
    favouritesCount: 0,
    unreadNotifications: 0,
  });
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [adsRes, enqRes, favRes, notifRes] = await Promise.all([
          api.get("/properties?createdBy=me"),
          api.get("/enquiries/received"),
          api.get("/properties/favourites"),
          api.get("/notifications?limit=5"),
        ]);

        const ads = adsRes.data.data || adsRes.data || [];
        const enqs = enqRes.data.data || enqRes.data || [];
        const favs = favRes.data.data || favRes.data || [];
        const notifs = notifRes.data.notifications || notifRes.data.data || notifRes.data || [];

        setStats({
          activeAds: ads.filter((p: any) => p.status === "ACTIVE").length,
          enquiriesCount: enqs.length,
          favouritesCount: favs.length,
          unreadNotifications: notifs.filter((n: any) => !n.isRead).length,
        });

        setRecentNotifications(notifs.slice(0, 5));
      } catch (err) {
        console.error("Failed to load account dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {user?.userType || "USER"}
            </span>
            {user?.verificationStatus === "VERIFIED" && (
              <span className="flex items-center text-blue-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 mr-1" /> Verified Member
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black font-['Outfit']">Welcome back, {user?.name}!</h1>
          <p className="text-slate-300 text-xs max-w-xl">
            Manage your property listings, track buyer enquiries, view ad performance analytics, and manage saved properties from your control panel.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/advertise"
              className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Property</span>
            </Link>
            <Link
              to="/account/my-ads"
              className="inline-flex items-center space-x-1 text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <span>Manage Ads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{loading ? "..." : stats.activeAds}</div>
            <div className="text-xs text-slate-500 font-medium">Active Advertisements</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{loading ? "..." : stats.enquiriesCount}</div>
            <div className="text-xs text-slate-500 font-medium">Enquiries Received</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{loading ? "..." : stats.favouritesCount}</div>
            <div className="text-xs text-slate-500 font-medium">Saved Favourites</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{loading ? "..." : stats.unreadNotifications}</div>
            <div className="text-xs text-slate-500 font-medium">Unread Notifications</div>
          </div>
        </div>
      </div>

      {/* Quick Action Grid & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Links */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-['Outfit']">Quick Shortcuts</h2>
          <div className="space-y-2 text-xs">
            <Link
              to="/account/my-ads"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-600 transition-colors font-medium"
            >
              <span>View & Manage My Ads</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/account/enquiries"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-600 transition-colors font-medium"
            >
              <span>Check Enquiries</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/account/ad-analytics"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-600 transition-colors font-medium"
            >
              <span>Ad Performance Analytics</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/account/info"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-600 transition-colors font-medium"
            >
              <span>Account Details & Verification</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Notifications preview */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-['Outfit']">Recent Activity</h2>
            <Link to="/account/notifications" className="text-xs font-bold text-red-600 hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">Loading notifications...</div>
          ) : recentNotifications.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">No recent notifications.</div>
          ) : (
            <div className="space-y-3">
              {recentNotifications.map((notif: any) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border text-xs flex items-start space-x-3 ${
                    notif.isRead ? "bg-slate-50 border-slate-100 text-slate-600" : "bg-red-50/50 border-red-100 text-slate-900 font-semibold"
                  }`}
                >
                  <Bell className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold">{notif.title}</div>
                    <div className="text-slate-600 line-clamp-1">{notif.message}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountDashboard;
