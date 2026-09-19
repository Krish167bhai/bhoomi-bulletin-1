import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client.js";
import { Search, Bell, BellOff, Trash2, ArrowRight, AlertCircle } from "lucide-react";

export const MySavedSearches: React.FC = () => {
  const [searches, setSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSearches = async () => {
    try {
      const res = await api.get("/saved-searches");
      setSearches(res.data.searches || res.data.data || (Array.isArray(res.data) ? res.data : []));
    } catch (err) {
      console.error("Failed to fetch saved searches", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearches();
  }, []);

  const handleToggleAlert = async (id: string, currentAlert: boolean) => {
    try {
      await api.put(`/saved-searches/${id}`, { emailAlerts: !currentAlert });
      setSearches((prev) =>
        prev.map((s) => (s.id === id ? { ...s, emailAlerts: !currentAlert } : s))
      );
    } catch (err) {
      alert("Failed to update search alert preferences");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this saved search?")) return;
    try {
      await api.delete(`/saved-searches/${id}`);
      setSearches((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Failed to delete saved search");
    }
  };

  const handleRunSearch = (filters: any) => {
    const params = new URLSearchParams();
    if (typeof filters === "object") {
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.append(k, String(v));
      });
    }
    navigate(`/real-estate?${params.toString()}`);
  };

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 font-['Outfit']">Saved Searches & Alerts</h1>
          <p className="text-xs text-slate-500">Receive instant email notifications when new properties match your saved search criteria.</p>
        </div>
        <Link
          to="/real-estate"
          className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>New Property Search</span>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading saved searches...</div>
      ) : searches.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Saved Searches</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Save your search filters on the real estate directory to get notified when matching properties are listed.
          </p>
          <Link
            to="/real-estate"
            className="inline-block bg-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl"
          >
            Search Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {searches.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-200 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">{s.name || "Custom Search"}</h3>
                  <button
                    onClick={() => handleToggleAlert(s.id, s.emailAlerts)}
                    className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      s.emailAlerts ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {s.emailAlerts ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                    <span>{s.emailAlerts ? "Alerts Active" : "Alerts Paused"}</span>
                  </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-slate-600">
                  <div>
                    <span className="font-bold text-slate-800">Filters: </span>
                    {typeof s.filters === "string" ? s.filters : JSON.stringify(s.filters || {})}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-xs font-bold text-slate-400 hover:text-red-600 flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => handleRunSearch(s.filters)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5"
                >
                  <span>Run Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySavedSearches;
