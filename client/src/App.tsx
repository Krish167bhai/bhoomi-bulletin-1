import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { BrandingProvider } from "./context/BrandingContext.js";
import { CompareProvider } from "./context/CompareContext.js";
import { NotificationProvider } from "./context/NotificationContext.js";

const loadComp = (fn: () => Promise<any>) => lazy(() => fn().then((m: any) => ({ default: m.default || Object.values(m)[0] })));

// Layouts
const PublicLayout = loadComp(() => import("./components/common/PublicLayout.js"));
const AdminLayout = loadComp(() => import("./components/admin/AdminLayout.js"));
const AccountLayout = loadComp(() => import("./components/account/AccountLayout.js"));

// Public pages
const HomePage = loadComp(() => import("./pages/public/HomePage.js"));
const LatestNewsPage = loadComp(() => import("./pages/public/LatestNewsPage.js"));
const RealEstatePage = loadComp(() => import("./pages/public/RealEstatePage.js"));
const VideosPage = loadComp(() => import("./pages/public/VideosPage.js"));
const AdvertisePropertyPage = loadComp(() => import("./pages/public/AdvertisePropertyPage.js"));
const PropertyRequirementPage = loadComp(() => import("./pages/public/PropertyRequirementPage.js"));
const PropertyDetailPage = loadComp(() => import("./pages/public/PropertyDetailPage.js"));
const ArticleDetailPage = loadComp(() => import("./pages/public/ArticleDetailPage.js"));
const SearchResultsPage = loadComp(() => import("./pages/public/SearchResultsPage.js"));
const PropertyComparisonPage = loadComp(() => import("./pages/public/PropertyComparisonPage.js"));
const LoginPage = loadComp(() => import("./pages/public/LoginPage.js"));
const SignUpPage = loadComp(() => import("./pages/public/SignUpPage.js"));
const ForgotPasswordPage = loadComp(() => import("./pages/public/ForgotPasswordPage.js"));
const ResetPasswordPage = loadComp(() => import("./pages/public/ResetPasswordPage.js"));
const AboutPage = loadComp(() => import("./pages/public/AboutPage.js"));
const ContactPage = loadComp(() => import("./pages/public/ContactPage.js"));
const PrivacyPolicyPage = loadComp(() => import("./pages/public/PrivacyPolicyPage.js"));
const TermsPage = loadComp(() => import("./pages/public/TermsPage.js"));
const DisclaimerPage = loadComp(() => import("./pages/public/DisclaimerPage.js"));

// Admin pages
const AdminDashboard = loadComp(() => import("./pages/admin/AdminDashboard.js"));
const AdminCreatePost = loadComp(() => import("./pages/admin/AdminCreatePost.js"));
const AdminNews = loadComp(() => import("./pages/admin/AdminNews.js"));
const AdminProperties = loadComp(() => import("./pages/admin/AdminProperties.js"));
const AdminAdvertisements = loadComp(() => import("./pages/admin/AdminAdvertisements.js"));
const AdminBrokerListings = loadComp(() => import("./pages/admin/AdminBrokerListings.js"));
const AdminRequirements = loadComp(() => import("./pages/admin/AdminRequirements.js"));
const AdminEnquiries = loadComp(() => import("./pages/admin/AdminEnquiries.js"));
const AdminLeadsCRM = loadComp(() => import("./pages/admin/AdminLeadsCRM.js"));
const AdminReviews = loadComp(() => import("./pages/admin/AdminReviews.js"));
const AdminVerification = loadComp(() => import("./pages/admin/AdminVerification.js"));
const AdminUsers = loadComp(() => import("./pages/admin/AdminUsers.js"));
const AdminNotifications = loadComp(() => import("./pages/admin/AdminNotifications.js"));
const AdminAnalytics = loadComp(() => import("./pages/admin/AdminAnalytics.js"));
const AdminMediaLibrary = loadComp(() => import("./pages/admin/AdminMediaLibrary.js"));
const AdminBranding = loadComp(() => import("./pages/admin/AdminBranding.js"));
const AdminSettings = loadComp(() => import("./pages/admin/AdminSettings.js"));
const AdminSecurity = loadComp(() => import("./pages/admin/AdminSecurity.js"));

// Account (User Portal) pages
const AccountDashboard = loadComp(() => import("./pages/account/AccountDashboard.js"));
const MyAdvertisements = loadComp(() => import("./pages/account/MyAdvertisements.js"));
const MyRequirements = loadComp(() => import("./pages/account/MyRequirements.js"));
const MyEnquiries = loadComp(() => import("./pages/account/MyEnquiries.js"));
const MyFavourites = loadComp(() => import("./pages/account/MyFavourites.js"));
const MySavedSearches = loadComp(() => import("./pages/account/MySavedSearches.js"));
const MyReviews = loadComp(() => import("./pages/account/MyReviews.js"));
const MyNotifications = loadComp(() => import("./pages/account/MyNotifications.js"));
const AdAnalytics = loadComp(() => import("./pages/account/AdAnalytics.js"));
const AccountInfo = loadComp(() => import("./pages/account/AccountInfo.js"));
const ChangePassword = loadComp(() => import("./pages/account/ChangePassword.js"));

// ──────────── Route Guards ────────────

const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({
  children,
  requireAdmin = false,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// ──────────── Loading Fallback ────────────

const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      <p className="text-sm text-slate-500 font-medium">Loading…</p>
    </div>
  </div>
);

// ──────────── App Routes ────────────

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public Routes with Header Navbar & Footer Layout ── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          
          <Route path="/news" element={<LatestNewsPage />} />
          <Route path="/latest-news" element={<LatestNewsPage />} />
          <Route path="/news/:slug" element={<ArticleDetailPage />} />
          <Route path="/article/:slug" element={<ArticleDetailPage />} />
          
          <Route path="/real-estate" element={<RealEstatePage />} />
          <Route path="/properties" element={<RealEstatePage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          
          <Route path="/videos" element={<VideosPage />} />
          
          <Route path="/advertise" element={<AdvertisePropertyPage />} />
          <Route path="/advertise-property" element={<AdvertisePropertyPage />} />
          
          <Route path="/post-requirement" element={<PropertyRequirementPage />} />
          <Route path="/property-requirement" element={<PropertyRequirementPage />} />
          
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/property-search" element={<SearchResultsPage />} />
          
          <Route path="/compare" element={<PropertyComparisonPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />

          {/* ── Auth Routes ── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Route>

        {/* ── User Account Portal ── */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AccountDashboard />} />
          <Route path="my-ads" element={<MyAdvertisements />} />
          <Route path="my-requirements" element={<MyRequirements />} />
          <Route path="enquiries" element={<MyEnquiries />} />
          <Route path="favourites" element={<MyFavourites />} />
          <Route path="saved-searches" element={<MySavedSearches />} />
          <Route path="reviews" element={<MyReviews />} />
          <Route path="notifications" element={<MyNotifications />} />
          <Route path="ad-analytics" element={<AdAnalytics />} />
          <Route path="info" element={<AccountInfo />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        {/* ── Admin Panel ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="create-post" element={<AdminCreatePost />} />
          <Route path="news" element={<AdminNews />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="advertisements" element={<AdminAdvertisements />} />
          <Route path="broker-listings" element={<AdminBrokerListings />} />
          <Route path="requirements" element={<AdminRequirements />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="leads-crm" element={<AdminLeadsCRM />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="verification" element={<AdminVerification />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="media" element={<AdminMediaLibrary />} />
          <Route path="branding" element={<AdminBranding />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="security" element={<AdminSecurity />} />
        </Route>

        {/* ── 404 Fallback ── */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-8">
              <div className="text-8xl font-black text-slate-200 mb-4">404</div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h1>
              <p className="text-slate-500 mb-6">The page you are looking for does not exist.</p>
              <a
                href="/"
                className="bg-red-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-red-700 transition-colors"
              >
                Go to Home
              </a>
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <BrandingProvider>
          <NotificationProvider>
            <CompareProvider>
              <AppRoutes />
            </CompareProvider>
          </NotificationProvider>
        </BrandingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
