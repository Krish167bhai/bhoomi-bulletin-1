import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import { useNotifications } from "../../context/NotificationContext.js";
import { Header } from "../common/Header.js";
import { Footer } from "../common/Footer.js";
import {
  LayoutDashboard,
  Home,
  List,
  MessageSquare,
  Heart,
  Search,
  Star,
  Bell,
  BarChart2,
  User,
  Lock,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

export const AccountLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/account", icon: LayoutDashboard },
    { label: "My Advertisements", path: "/account/my-ads", icon: Home },
    { label: "My Requirements", path: "/account/my-requirements", icon: List },
    { label: "My Enquiries", path: "/account/enquiries", icon: MessageSquare },
    { label: "My Favourites", path: "/account/favourites", icon: Heart },
    { label: "Saved Searches", path: "/account/saved-searches", icon: Search },
    { label: "My Reviews", path: "/account/reviews", icon: Star },
    { label: "Notifications", path: "/account/notifications", icon: Bell, badge: unreadCount },
    { label: "Ad Analytics", path: "/account/ad-analytics", icon: BarChart2 },
    { label: "Account Info", path: "/account/info", icon: User },
    { label: "Change Password", path: "/account/change-password", icon: Lock },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-['Inter',sans-serif]">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
            <Lock className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Please Sign In</h2>
            <p className="text-sm text-slate-600 mb-6">You need an active account to view your dashboard.</p>
            <Link to="/login" className="bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl block">
              Sign In
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-['Inter',sans-serif]">
      <Header />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6 sticky top-24">
            {/* User Profile Card */}
            <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-red-600 text-white text-xl font-black flex items-center justify-center shadow-md">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-slate-900 truncate">{user.name}</h3>
                  {user.verificationStatus === "VERIFIED" && (
                    <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {user.userType}
                </span>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                      isActive
                        ? "bg-red-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? "bg-white text-red-600" : "bg-red-100 text-red-600"
                      }`}>
                        {item.badge}
                      </span>
                    ) : (
                      isActive && <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 py-3 rounded-xl transition-colors mt-4"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Mobile Header & Drawer */}
        <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">{user.name}</div>
              <div className="text-xs text-slate-500">{user.userType} Account</div>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-slate-600 hover:text-red-600 rounded-lg"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden bg-white rounded-2xl p-4 shadow-lg border border-slate-100 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs ${
                    isActive ? "bg-red-600 text-white" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 text-xs font-bold text-red-600 bg-red-50 py-2.5 rounded-xl mt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* Main Account Portal View */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};
