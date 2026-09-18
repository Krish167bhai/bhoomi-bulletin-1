import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { PropertyCard } from '../../components/property/PropertyCard.js';
import { EnquiryModal } from '../../components/property/EnquiryModal.js';
import {
  ArrowRight,
  Play,
  TrendingUp,
  Newspaper,
  Building2,
  PlusCircle,
  Clock,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [latestNews, setLatestNews] = useState<any[]>([]);
  const [realEstateNews, setRealEstateNews] = useState<any[]>([]);
  const [videoNews, setVideoNews] = useState<any[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [selectedPropertyForEnquiry, setSelectedPropertyForEnquiry] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Log page view event
    api.post('/analytics/track', {
      eventType: 'PAGE_VIEW',
      targetId: 'HOME',
      targetType: 'PAGE',
    }).catch(() => {});

    const loadHomeData = async () => {
      try {
        const [newsRes, reRes, videoRes, propsRes] = await Promise.all([
          api.get('/articles/published?category=NEWS&limit=4'),
          api.get('/articles/published?category=REAL_ESTATE&limit=4'),
          api.get('/articles/videos?limit=3'),
          api.get('/properties/published?limit=4&featuredOnly=true'),
        ]);

        if (newsRes.data.success) setLatestNews(newsRes.data.articles || []);
        if (reRes.data.success) setRealEstateNews(reRes.data.articles || []);
        if (videoRes.data.success) setVideoNews(videoRes.data.videos || []);
        if (propsRes.data.success) setFeaturedProperties(propsRes.data.properties || []);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO HEADLINE & BREAKING NEWS SECTION */}
      <section className="bg-slate-900 text-white pt-10 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#dc2626_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center space-x-2 bg-red-600/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Premier Real Estate Media &amp; Marketplace</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Authoritative News. <br />
                <span className="text-red-500">Verified Properties.</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                Read daily market reports, discover certified residential and commercial properties, and advertise your property to thousands of high-intent buyers across India.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/advertise-property"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg shadow-lg transition-all flex items-center space-x-2 uppercase text-xs tracking-wider"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Advertise Your Property</span>
                </Link>
                <Link
                  to="/real-estate"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg border border-slate-700 transition-all text-xs tracking-wider uppercase flex items-center space-x-2"
                >
                  <span>Browse Listings</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Quick Hero Feature / Live Lead badge */}
            <div className="w-full lg:w-96 bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Market Bulletin</span>
                <span className="flex items-center space-x-1.5 text-xs text-green-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span>Live Platform</span>
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-2.5 rounded-lg bg-slate-900/60">
                  <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-white">100% Admin Verified</p>
                    <p className="text-slate-400 text-[11px]">All broker listings and property ads undergo strict verification before going live.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-2.5 rounded-lg bg-slate-900/60">
                  <Building2 className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-white">Direct Owner &amp; Broker Leads</p>
                    <p className="text-slate-400 text-[11px]">Enquire directly via phone or WhatsApp with zero broker interference.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 2. SECTION: LATEST NEWS (Requirement 5) */}
        <section className="space-y-6">
          <div className="flex justify-between items-end border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Newspaper className="w-4 h-4" />
                <span>Industry Updates</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Latest News</h2>
            </div>
            <Link
              to="/latest-news"
              className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <span>View All News</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestNews.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                <div>
                  <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                    <img
                      src={article.featuredImage || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {article.category}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center text-[11px] text-slate-400 space-x-2">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                    </div>
                    <Link to={`/article/${article.slug}`}>
                      <h3 className="font-bold text-sm text-slate-900 line-clamp-2 hover:text-red-600 transition-colors">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <Link
                    to={`/article/${article.slug}`}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center space-x-1"
                  >
                    <span>Read Full Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 3. SECTION: REAL ESTATE NEWS & ANALYSIS (Requirement 5) */}
        <section className="space-y-6">
          <div className="flex justify-between items-end border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4" />
                <span>Market Insights &amp; Advisory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Real Estate News</h2>
            </div>
            <Link
              to="/latest-news?category=REAL_ESTATE"
              className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <span>More Real Estate News</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {realEstateNews.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                <div>
                  <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                    <img
                      src={article.featuredImage || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80'}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      RERA &amp; ADVISORY
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center text-[11px] text-slate-400 space-x-2">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
                    </div>
                    <Link to={`/article/${article.slug}`}>
                      <h3 className="font-bold text-sm text-slate-900 line-clamp-2 hover:text-red-600 transition-colors">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <Link
                    to={`/article/${article.slug}`}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center space-x-1"
                  >
                    <span>Read Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 4. FEATURED VERIFIED PROPERTY LISTINGS */}
        {featuredProperties.length > 0 && (
          <section className="space-y-6">
            <div className="flex justify-between items-end border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Advertisements</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Properties</h2>
              </div>
              <Link
                to="/real-estate"
                className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 flex items-center space-x-1"
              >
                <span>View All Properties</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onEnquireClick={(p) => setSelectedPropertyForEnquiry(p)}
                />
              ))}
            </div>
          </section>
        )}

        {/* 5. SECTION: VIDEO NEWS (Requirement 5) */}
        <section className="space-y-6">
          <div className="flex justify-between items-end border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center space-x-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Play className="w-4 h-4" />
                <span>Audio Visual Reports</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Video News</h2>
            </div>
            <Link
              to="/videos"
              className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <span>Watch More Videos</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videoNews.map((video) => (
              <div
                key={video.id}
                className="bg-slate-900 text-white rounded-xl overflow-hidden shadow-lg group flex flex-col justify-between"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={video.featuredImage || 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80'}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <Link
                    to={`/article/${video.slug}`}
                    className="absolute inset-0 flex items-center justify-center bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 ml-0.5 fill-white" />
                    </div>
                  </Link>
                  <span className="absolute bottom-2.5 right-2.5 bg-slate-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    Video Report
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <Link to={`/article/${video.slug}`}>
                    <h3 className="font-bold text-sm text-white line-clamp-2 group-hover:text-red-400 transition-colors">
                      {video.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {video.excerpt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. SECTION: PROPERTY ADVERTISING CTA (Requirement 5) */}
        <section className="bg-gradient-to-r from-red-600 to-red-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Advertise Your Property
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-['Outfit'] leading-tight">
              Reach Verified Property Buyers, NRIs &amp; Investors Across India
            </h2>
            <p className="text-sm sm:text-base text-red-100 leading-relaxed">
              Submit your property for high-impact advertising on Bhoomi Bulletin. Choose flexible advertisement durations (1 week to 2 years), receive verified inquiries directly via phone and WhatsApp, and manage all leads in our built-in CRM.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/advertise-property"
                className="bg-white text-red-700 hover:bg-red-50 font-bold px-6 py-3 rounded-xl shadow transition-all text-xs tracking-wider uppercase flex items-center space-x-2"
              >
                <PlusCircle className="w-4 h-4 text-red-600" />
                <span>Advertise Your Property Now</span>
              </Link>
              <Link
                to="/property-requirement"
                className="bg-red-900/60 hover:bg-red-900/80 text-white font-semibold px-6 py-3 rounded-xl border border-red-400/40 transition-all text-xs tracking-wider uppercase flex items-center space-x-2"
              >
                <span>Looking to Buy or Rent? Post Requirement</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Enquiry Modal */}
      <EnquiryModal
        property={selectedPropertyForEnquiry}
        isOpen={Boolean(selectedPropertyForEnquiry)}
        onClose={() => setSelectedPropertyForEnquiry(null)}
      />
    </div>
  );
};
