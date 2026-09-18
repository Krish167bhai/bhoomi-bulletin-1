import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import { useBranding } from "../../context/BrandingContext.js";
import { useNotifications } from "../../context/NotificationContext.js";
import { useCompare } from "../../context/CompareContext.js";
import {
  Search,
  Menu,
  X,
  Bell,
  User as UserIcon,
  LogOut,
  Layers,
  ShieldAlert,
  PlusCircle,
  LogIn,
  UserPlus,
} from "lucide-react";

export const Header: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { branding } = useBranding();
  const { unreadCount } = useNotifications();
  const { compareIds } = useCompare();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm font-['Inter',sans-serif]">
      {/* Top Bar for Breaking / Support info & Quick Account Links */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="bg-red-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wider uppercase">
              Bulletin Alert
            </span>
            <span className="truncate">India's Leading Real Estate News, Market Trends & Direct Property Advertising Platform</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-300">
            <span>Helpline: {branding.contactPhone}</span>
            {compareIds.length > 0 && (
              <Link to="/compare" className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 font-medium">
                <Layers className="w-3.5 h-3.5" />
                <span>Compare ({compareIds.length})</span>
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-red-400 hover:text-red-300 flex items-center space-x-1 font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </Link>
            )}

            {/* Quick Auth Links in Top Bar */}
            <div className="border-l border-slate-700 pl-4 flex items-center space-x-3">
              {user ? (
                <Link to="/account" className="flex items-center space-x-1 text-white hover:text-red-400 font-bold">
                  <UserIcon className="w-3.5 h-3.5 text-red-500" />
                  <span>My Account ({user.name.split(" ")[0]})</span>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="hover:text-white flex items-center space-x-1">
                    <LogIn className="w-3 h-3 text-red-500" />
                    <span>Sign In</span>
                  </Link>
                  <span className="text-slate-600">|</span>
                  <Link to="/signup" className="hover:text-white flex items-center space-x-1 font-semibold text-white">
                    <UserPlus className="w-3 h-3 text-red-500" />
                    <span>Register</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              {branding.logoDesktop ? (
                <img
                  src={branding.logoDesktop}
                  alt={branding.siteName}
                  className="h-12 w-auto max-w-[280px] object-contain"
                />
              ) : (
                <div className="text-2xl font-extrabold tracking-tight text-slate-900 font-['Outfit']">
                  BHOOMI <span className="text-red-600">BULLETIN</span>
                </div>
              )}
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-semibold text-slate-700">
            <Link to="/" className="hover:text-red-600 transition-colors">
              Home
            </Link>
            <Link to="/latest-news" className="hover:text-red-600 transition-colors">
              Latest News
            </Link>
            <Link to="/real-estate" className="hover:text-red-600 transition-colors">
              Real Estate
            </Link>
            <Link to="/videos" className="hover:text-red-600 transition-colors">
              Videos
            </Link>
            <Link to="/property-requirement" className="hover:text-red-600 transition-colors">
              Post Requirement
            </Link>
            <Link to="/advertise-property" className="hover:text-red-600 transition-colors">
              Advertise Property
            </Link>
            {user && (
              <Link to="/account" className="text-red-600 font-bold hover:underline flex items-center space-x-1">
                <UserIcon className="w-4 h-4" />
                <span>My Account</span>
              </Link>
            )}
          </nav>

          {/* Right Header Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Search Trigger / Inline input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search news, properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 w-44 focus:w-60 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>

            {/* Notification Bell (for logged in) */}
            {user && (
              <Link to="/account/notifications" className="relative p-2 text-slate-600 hover:text-red-600">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Red Advertise Property Button - Requirement 3 */}
            <Link
              to="/advertise-property"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-4 py-2.5 rounded-md shadow-sm transition-all flex items-center space-x-1.5 tracking-wide uppercase"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Advertise Property</span>
            </Link>

            {/* Prominent Auth / Account Button */}
            {user ? (
              <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
                <Link
                  to="/account"
                  className="flex items-center space-x-2 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-red-50 hover:text-red-600 px-3 py-2 rounded-xl transition-all border border-slate-200"
                >
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  title="Logout Account"
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
                <Link
                  to="/login"
                  className="text-slate-800 hover:text-red-600 text-xs font-bold px-3 py-2 border border-slate-300 rounded-lg hover:border-red-600 transition-all flex items-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5 text-red-600" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center space-x-2 lg:hidden">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-slate-600 hover:text-red-600"
            >
              <Search className="w-5 h-5" />
            </button>
            {user && (
              <Link to="/account/notifications" className="relative p-2 text-slate-600 hover:text-red-600">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-red-600 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input dropdown */}
        {searchOpen && (
          <div className="lg:hidden pb-4 px-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search news, properties, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          {/* Quick Account Header on Mobile */}
          {user ? (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-red-600 text-white font-bold flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{user.name}</div>
                  <div className="text-[10px] text-slate-500">{user.email}</div>
                </div>
              </div>
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-red-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm"
              >
                Dashboard
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-100">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center border border-red-600 text-red-600 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-slate-900 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:bg-slate-50 hover:text-red-600"
          >
            Home
          </Link>
          <Link
            to="/latest-news"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:bg-slate-50 hover:text-red-600"
          >
            Latest News
          </Link>
          <Link
            to="/real-estate"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:bg-slate-50 hover:text-red-600"
          >
            Real Estate
          </Link>
          <Link
            to="/videos"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:bg-slate-50 hover:text-red-600"
          >
            Videos
          </Link>
          <Link
            to="/property-requirement"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:bg-slate-50 hover:text-red-600"
          >
            Post Property Requirement
          </Link>
          <Link
            to="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:bg-slate-50 hover:text-red-600"
          >
            Compare Properties ({compareIds.length})
          </Link>

          {user && (
            <Link
              to="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-bold text-red-600 bg-red-50"
            >
              My Account Dashboard
            </Link>
          )}

          {/* Red Advertise Property button on mobile */}
          <Link
            to="/advertise-property"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-center bg-red-600 text-white font-bold text-sm py-3 rounded-lg shadow uppercase tracking-wide"
          >
            Advertise Property
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-semibold text-red-600 bg-red-50"
            >
              Admin Dashboard
            </Link>
          )}

          {/* Logout section on mobile */}
          {user && (
            <div className="pt-2 border-t border-slate-200">
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate("/");
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
