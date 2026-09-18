import React, { useState, useEffect } from "react";
import api from "../../api/client.js";
import { Star, Trash2, Calendar, AlertCircle } from "lucide-react";

export const MyReviews: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await api.get("/reviews?mine=true");
      setReviews(res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h1 className="text-xl font-black text-slate-900 font-['Outfit']">My Property Reviews</h1>
        <p className="text-xs text-slate-500">Track all ratings and feedback you have posted on property listings.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm space-y-2">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Reviews Submitted</h3>
          <p className="text-xs text-slate-500">Share your experience on properties you have visited to help other users.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">{rev.property?.title || "Property"}</h3>
                  <div className="flex items-center space-x-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1.5">{rev.rating}/5</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase ${
                    rev.status === "APPROVED"
                      ? "bg-emerald-50 text-emerald-700"
                      : rev.status === "REJECTED"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {rev.status || "PENDING MODERATION"}
                </span>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">{rev.comment || rev.text}</p>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(rev.id)}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviews;
