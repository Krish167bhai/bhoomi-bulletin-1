import React, { useState, useEffect } from "react";
import api from "../../api/client.js";
import { Eye, MessageSquare, Phone, Send, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const AdAnalytics: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/analytics/my-ads?days=${period}`);
      const list = res.data.data || res.data || [];
      setData(list);
    } catch (err) {
      console.error("Failed to load ad analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const totalViews = data.reduce((acc, item) => acc + (item.viewsCount || item.views || 0), 0);
  const totalEnquiries = data.reduce((acc, item) => acc + (item.enquiriesCount || item.enquiries || 0), 0);
  const totalPhoneClicks = data.reduce((acc, item) => acc + (item.phoneClicks || 0), 0);
  const totalWhatsappClicks = data.reduce((acc, item) => acc + (item.whatsappClicks || 0), 0);

  const chartData = data.map((item) => ({
    name: item.title ? (item.title.length > 15 ? item.title.substring(0, 15) + "..." : item.title) : "Ad",
    Views: item.viewsCount || item.views || 0,
    Enquiries: item.enquiriesCount || item.enquiries || 0,
  }));

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 font-['Outfit']">Advertisement Performance Analytics</h1>
          <p className="text-xs text-slate-500">Track view counts, buyer inquiries, and call/WhatsApp lead interactions.</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalViews}</div>
            <div className="text-xs text-slate-500 font-medium">Total Views</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalEnquiries}</div>
            <div className="text-xs text-slate-500 font-medium">Form Enquiries</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalPhoneClicks}</div>
            <div className="text-xs text-slate-500 font-medium">Phone Clicks</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalWhatsappClicks}</div>
            <div className="text-xs text-slate-500 font-medium">WhatsApp Clicks</div>
          </div>
        </div>
      </div>

      {/* Recharts Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 font-['Outfit'] uppercase">Views & Enquiries Breakdown</h2>
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">Loading chart data...</div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500">No active ads data available for analytics.</div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                <Bar dataKey="Views" fill="#dc2626" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Enquiries" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">Per-Advertisement Metrics</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Property Title</th>
                <th className="p-3">Views</th>
                <th className="p-3">Enquiries</th>
                <th className="p-3">Phone Clicks</th>
                <th className="p-3">WhatsApp Clicks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{item.title}</td>
                  <td className="p-3 font-semibold text-slate-700">{item.viewsCount || item.views || 0}</td>
                  <td className="p-3 font-semibold text-slate-700">{item.enquiriesCount || item.enquiries || 0}</td>
                  <td className="p-3 font-semibold text-emerald-600">{item.phoneClicks || 0}</td>
                  <td className="p-3 font-semibold text-emerald-600">{item.whatsappClicks || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdAnalytics;
