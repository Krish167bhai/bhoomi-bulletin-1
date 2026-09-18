import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client.js";
import { PlusCircle, List, Trash2, Calendar, MapPin, DollarSign, AlertCircle } from "lucide-react";

export const MyRequirements: React.FC = () => {
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRequirements = async () => {
    try {
      const res = await api.get("/property-requirements?mine=true");
      const list = res.data.data || res.data || [];
      setRequirements(list);
    } catch (err) {
      console.error("Failed to fetch requirements", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this property requirement?")) return;
    try {
      setDeletingId(id);
      await api.delete(`/property-requirements/${id}`);
      setRequirements((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert("Failed to delete requirement");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 font-['Outfit']">My Property Requirements</h1>
          <p className="text-xs text-slate-500">Track property buying/leasing requirements submitted to top brokers and owners.</p>
        </div>
        <Link
          to="/post-requirement"
          className="inline-flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Requirement</span>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading requirements...</div>
      ) : requirements.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Requirements Submitted Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Looking for a specific property? Post your budget and location criteria to get matched directly by brokers.
          </p>
          <Link
            to="/post-requirement"
            className="inline-block bg-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl"
          >
            Post Property Requirement
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requirements.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3 relative hover:border-slate-200 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-red-50 text-red-600 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg">
                    {req.transactionType || "BUY"} • {req.propertyType}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 font-['Outfit'] line-clamp-1">
                  {req.title || `${req.propertyType} in ${req.preferredLocation}`}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{req.preferredLocation || "Location Not Specified"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-bold text-slate-800">
                      Budget: ₹{req.minBudget ? Number(req.minBudget).toLocaleString("en-IN") : "0"} - ₹
                      {req.maxBudget ? Number(req.maxBudget).toLocaleString("en-IN") : "Flexible"}
                    </span>
                  </div>
                </div>

                {req.notes && <p className="text-xs text-slate-500 line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl">{req.notes}</p>}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                  {req.status || "ACTIVE"}
                </span>
                <button
                  onClick={() => handleDelete(req.id)}
                  disabled={deletingId === req.id}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequirements;
