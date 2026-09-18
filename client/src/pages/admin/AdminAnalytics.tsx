import React, { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { formatPriceINR } from '../../components/property/PropertyCard.js';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Phone,
  MessageSquare,
  Building2,
  Newspaper,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#dc2626', '#2563eb', '#ca8a04', '#16a34a', '#9333ea', '#64748b'];

export const AdminAnalytics: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [popularProps, setPopularProps] = useState<any[]>([]);
  const [popularArticles, setPopularArticles] = useState<any[]>([]);
  const [leadsData, setLeadsData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [statsRes, propsRes, artsRes, leadsRes] = await Promise.all([
          api.get('/analytics/admin/overview'),
          api.get('/analytics/admin/popular-properties?limit=8'),
          api.get('/analytics/admin/popular-articles?limit=8'),
          api.get('/analytics/admin/leads'),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (propsRes.data.success) setPopularProps(propsRes.data.properties || []);
        if (artsRes.data.success) setPopularArticles(propsRes.data.articles || artsRes.data.articles || []);
        if (leadsRes.data.success) setLeadsData(leadsRes.data.leads);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Aggregating platform analytics...</div>;
  }

  const s = stats || {};

  // Format leads by status for pie chart
  const pieData = (leadsData?.enquiriesByStatus || []).map((item: any) => ({
    name: item.status,
    value: item._count.id,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 font-['Outfit'] flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-red-600" />
          <span>Comprehensive Platform Analytics</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed metrics across web traffic, property conversion, phone/WhatsApp CTA interactions, and CRM leads.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase">
            <span>Page Impressions</span>
            <Eye className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-['Outfit']">{s.totalPageViews || 0}</div>
          <p className="text-[11px] text-slate-500">Tracked via backend analytics engine</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase">
            <span>Property Detail Views</span>
            <Building2 className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-['Outfit']">{s.totalPropertyViews || 0}</div>
          <p className="text-[11px] text-slate-500">Unique user listing inspections</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase">
            <span>Article Reads</span>
            <Newspaper className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-['Outfit']">{s.totalArticleViews || 0}</div>
          <p className="text-[11px] text-slate-500">News &amp; real estate editorial reads</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-500 text-xs font-bold uppercase">
            <span>Total CRM Leads</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-['Outfit']">{leadsData?.totalLeads || 0}</div>
          <p className="text-[11px] text-slate-500">Direct inquiries &amp; requirements</p>
        </div>
      </div>

      {/* Top Performing Properties Table (Requirement 28) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 font-['Outfit'] flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-red-600" />
          <span>Top Performing Properties (Views, Inquiries &amp; CTA Clicks)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Property Name</th>
                <th className="p-3">City</th>
                <th className="p-3">Price</th>
                <th className="p-3">Views</th>
                <th className="p-3">Call Clicks</th>
                <th className="p-3">WhatsApp Clicks</th>
                <th className="p-3">Direct Inquiries</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {popularProps.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 max-w-xs truncate">{p.title}</td>
                  <td className="p-3">{p.city}</td>
                  <td className="p-3 font-semibold">{formatPriceINR(p.price)}</td>
                  <td className="p-3 font-bold text-slate-900">{p.viewsCount}</td>
                  <td className="p-3 text-slate-700 font-semibold">{p.phoneClicks || 0}</td>
                  <td className="p-3 text-green-700 font-semibold">{p.whatsappClicks || 0}</td>
                  <td className="p-3 font-bold text-red-600">{p._count?.enquiries || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popular News Articles */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 font-['Outfit'] flex items-center space-x-2">
          <Newspaper className="w-5 h-5 text-red-600" />
          <span>Most Read News Articles &amp; Analysis</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Headline</th>
                <th className="p-3">Category</th>
                <th className="p-3">Views Count</th>
                <th className="p-3">Published Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {popularArticles.map((art) => (
                <tr key={art.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 max-w-md truncate">{art.title}</td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {art.category}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-800">{art.viewsCount || 0}</td>
                  <td className="p-3 text-slate-400">
                    {new Date(art.publishedAt || art.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
