import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client.js";
import { PlusCircle, Eye, Calendar, Trash2, ExternalLink, Clock, AlertCircle } from "lucide-react";

export const MyAdvertisements: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      const res = await api.get("/properties?createdBy=me");
      const list = res.data.data || res.data || [];
      setProperties(list);
    } catch (err) {
      console.error("Failed to load user properties", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this property advertisement?")) return;
    try {
      setDeletingId(id);
      await api.delete(`/properties/${id}`);
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete advertisement");
    } finally {
      setDeletingId(null);
    }
  };

  const getDaysRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const filteredProperties = properties.filter((p) => {
    if (filter === "ALL") return true;
    return p.status === filter;
  });

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 font-['Outfit']">My Advertisements</h1>
          <p className="text-xs text-slate-500">Manage all your posted property listings and track their duration status.</p>
        </div>
        <Link
          to="/advertise"
          className="inline-flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Advertisement</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {["ALL", "ACTIVE", "PENDING", "EXPIRED", "REJECTED"].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === st ? "bg-red-600 text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {st} {st !== "ALL" && `(${properties.filter((p) => p.status === st).length})`}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading your property ads...</div>
      ) : filteredProperties.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Advertisements Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any property listings under this status filter.
          </p>
          <Link
            to="/advertise"
            className="inline-block bg-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl"
          >
            Advertise Property Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProperties.map((p) => {
            const daysLeft = getDaysRemaining(p.expiresAt);
            const image = p.images && p.images.length > 0 ? p.images[0] : null;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-slate-200 transition-all"
              >
                {/* Thumbnail */}
                <div className="w-full sm:w-32 h-28 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                  {image ? (
                    <img src={image} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                      No Image
                    </div>
                  )}
                  <span
                    className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shadow-sm ${
                      p.status === "ACTIVE"
                        ? "bg-emerald-500 text-white"
                        : p.status === "PENDING"
                        ? "bg-amber-500 text-white"
                        : p.status === "EXPIRED"
                        ? "bg-slate-700 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-bold text-sm text-slate-900 truncate font-['Outfit']">{p.title}</h3>
                  <p className="text-xs text-slate-500 truncate">{p.location || `${p.city}, ${p.state}`}</p>
                  <div className="text-sm font-black text-red-600">
                    ₹{p.price ? Number(p.price).toLocaleString("en-IN") : "Price on Call"}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.viewsCount || 0} views</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Duration: {p.adDurationDays || 30} Days</span>
                    </span>
                    {p.status === "ACTIVE" && daysLeft !== null && (
                      <span className={`flex items-center space-x-1 font-bold ${daysLeft <= 5 ? "text-red-600" : "text-emerald-600"}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{daysLeft} days remaining</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <Link
                    to={`/properties/${p.id}`}
                    target="_blank"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    title="View Listing Page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                    title="Delete Advertisement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAdvertisements;
