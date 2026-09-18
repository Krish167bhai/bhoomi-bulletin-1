import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useBranding } from '../../context/BrandingContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import {
  LayoutDashboard,
  PlusCircle,
  Newspaper,
  Building2,
  Megaphone,
  Briefcase,
  FileSpreadsheet,
  MessageSquare,
  Users,
  ShieldCheck,
  Star,
  Bell,
  BarChart3,
  Image as ImageIcon,
  Palette,
  Settings,
  Lock,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { branding } = useBranding();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Requirement 20: All 18 Admin Panel menu items
  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Create New Post', path: '/admin/create-post', icon: PlusCircle },
    { label: 'News Management', path: '/admin/news', icon: Newspaper },
    { label: 'Properties', path: '/admin/properties', icon: Building2 },
    { label: 'Advertisements', path: '/admin/advertisements', icon: Megaphone },
    { label: 'Broker/Agent Listings', path: '/admin/broker-listings', icon: Briefcase },
    { label: 'Property Requirements', path: '/admin/requirements', icon: FileSpreadsheet },
    { label: 'Enquiries', path: '/admin/enquiries', icon: MessageSquare },
    { label: 'Leads / CRM', path: '/admin/leads-crm', icon: Users },
    { label: 'Reviews Moderation', path: '/admin/reviews', icon: Star },
    { label: 'Verification (🔵)', path: '/admin/verification', icon: ShieldCheck },
    { label: 'Users Management', path: '/admin/users', icon: Users },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Media Library', path: '/admin/media', icon: ImageIcon },
    { label: 'Logo & Branding', path: '/admin/branding', icon: Palette },
    { label: 'Site Settings', path: '/admin/settings', icon: Settings },
    { label: 'Password & Security', path: '/admin/security', icon: Lock },
  ];

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-600">
            Administrator privileges required. Please sign in with an authorized administrator account.
          </p>
          <Link
            to="/login?redirect=/admin"
            className="inline-block bg-red-600 text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-slate-100 font-['Inter',sans-serif]">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 text-slate-300 flex-shrink-0 border-r border-slate-800">
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <Link to="/" className="flex items-center space-x-2 text-white font-extrabold text-lg font-['Outfit']">
            <span>BHOOMI</span>
            <span className="text-red-500">ADMIN</span>
          </Link>
        </div>

        {/* Menu Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 text-xs">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </Link>
            );
          })}
        </div>

        {/* Bottom User info & Quick Exit */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center space-x-2 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Public Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 text-xs text-red-400 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-red-600 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="text-sm font-bold text-slate-800 hidden sm:block font-['Outfit']">
              Bhoomi Bulletin Management Portal
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/admin/notifications"
              className="relative p-2 text-slate-600 hover:text-red-600 rounded-full hover:bg-slate-50 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-bold text-slate-900">{user.name}</div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Super Administrator</div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/70 backdrop-blur-sm">
            <div className="w-72 bg-slate-900 text-slate-300 flex flex-col p-4 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-white font-bold font-['Outfit'] text-lg">Admin Menu</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 text-xs">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-semibold ${
                        isActive ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <Link
                  to="/"
                  target="_blank"
                  className="flex items-center space-x-2 text-xs text-slate-400 px-3 py-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Public Website</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 text-xs text-red-400 px-3 py-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="p-4 sm:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
