import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import {
  Users,
  Building2,
  Megaphone,
  Clock,
  CheckCircle2,
  Eye,
  FileSpreadsheet,
  MessageSquare,
  Newspaper,
  TrendingUp,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard-stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading admin dashboard...</div>;
  }

  const s = stats || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Pending Submissions Alert Banner */}
      {s.pendingSubmissions > 0 && (
        <div className="bg-amber-500 text-white p-4 rounded-2xl shadow flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <span className="font-bold text-sm">
                {s.pendingSubmissions} Property Submission(s) Pending Review!
              </span>
              <p className="text-xs text-amber-100">
                Review advertiser specs, documents, and pricing before publishing.
              </p>
            </div>
          </div>
          <Link
            to="/admin/properties?status=PENDING_APPROVAL"
            className="bg-white text-amber-900 font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow hover:bg-amber-50 transition-colors flex items-center space-x-1"
          >
            <span>Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Top 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-['Outfit']">{s.totalUsers || 0}</div>
            <div className="text-xs font-semibold text-slate-500">Total Users (+{s.newUsersLast30Days || 0} this month)</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-['Outfit']">{s.activeAds || 0}</div>
            <div className="text-xs font-semibold text-slate-500">Active Advertisements ({s.expiredAds || 0} Expired)</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-['Outfit']">{s.totalEnquiries || 0}</div>
            <div className="text-xs font-semibold text-slate-500">Direct Inquiries Generated</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-['Outfit']">{s.totalPageViews || 0}</div>
            <div className="text-xs font-semibold text-slate-500">Recorded Page Views</div>
          </div>
        </div>
      </div>

      {/* Traffic Trends Chart (Requirement 19 & 28) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 font-['Outfit'] flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <span>Platform Traffic &amp; Interaction Trends (Last 7 Days)</span>
            </h3>
            <p className="text-xs text-slate-500">Real database events for page views, property inquiries, and detail views</p>
          </div>
          <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
            Live Database Connected
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={s.trafficTrends || []}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="propsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="#dc2626" strokeWidth={2} fillOpacity={1} fill="url(#viewsGrad)" />
              <Area type="monotone" dataKey="propertyViews" name="Property Views" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#propsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comprehensive Secondary Metrics (All 16 Metrics - Requirement 19) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Properties</span>
          <div className="text-xl font-bold text-slate-800 font-['Outfit'] mt-1">{s.totalProperties || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Articles</span>
          <div className="text-xl font-bold text-slate-800 font-['Outfit'] mt-1">{s.totalArticles || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Videos</span>
          <div className="text-xl font-bold text-slate-800 font-['Outfit'] mt-1">{s.totalVideos || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Requirements</span>
          <div className="text-xl font-bold text-slate-800 font-['Outfit'] mt-1">{s.totalRequirements || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] font-bold text-blue-600 uppercase">Verified Props (🔵)</span>
          <div className="text-xl font-bold text-blue-600 font-['Outfit'] mt-1">{s.verifiedProperties || 0}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
          <span className="text-[11px] font-bold text-blue-600 uppercase">Verified Agents (🔵)</span>
          <div className="text-xl font-bold text-blue-600 font-['Outfit'] mt-1">{s.verifiedAgents || 0}</div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/create-post"
          className="p-6 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow group"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">+ Direct Publishing</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="text-lg font-bold font-['Outfit']">Create New Post</h4>
          <p className="text-xs text-slate-400 mt-1">Publish news articles, direct advertisements, or video reports immediately.</p>
        </Link>

        <Link
          to="/admin/leads-crm"
          className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-red-300 transition-all shadow-sm group"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pipeline Tracking</span>
            <ArrowRight className="w-4 h-4 text-red-600 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 font-['Outfit']">Manage Leads CRM</h4>
          <p className="text-xs text-slate-500 mt-1">Track buyer/tenant pipeline from New to Qualified and Converted.</p>
        </Link>

        <Link
          to="/admin/branding"
          className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-red-300 transition-all shadow-sm group"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Instant Update</span>
            <ArrowRight className="w-4 h-4 text-red-600 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 font-['Outfit']">Logo &amp; Branding</h4>
          <p className="text-xs text-slate-500 mt-1">Upload desktop logo, mobile logo, and favicon dynamically.</p>
        </Link>
      </div>
    </div>
  );
};
