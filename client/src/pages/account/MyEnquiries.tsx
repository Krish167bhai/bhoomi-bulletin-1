import React, { useState, useEffect } from "react";
import api from "../../api/client.js";
import { MessageSquare, Phone, Mail, Clock, CheckCircle2, AlertCircle, Building2 } from "lucide-react";

export const MyEnquiries: React.FC = () => {
  const [tab, setTab] = useState<"RECEIVED" | "SENT">("RECEIVED");
  const [received, setReceived] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchEnquiries = async () => {
    try {
      const [recRes, sentRes] = await Promise.all([
        api.get("/enquiries/received"),
        api.get("/enquiries/sent"),
      ]);
      setReceived(recRes.data.enquiries || recRes.data.data || (Array.isArray(recRes.data) ? recRes.data : []));
      setSent(sentRes.data.enquiries || sentRes.data.data || (Array.isArray(sentRes.data) ? sentRes.data : []));
    } catch (err) {
      console.error("Failed to load enquiries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await api.put(`/enquiries/${id}`, { status: newStatus });
      setReceived((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h1 className="text-xl font-black text-slate-900 font-['Outfit']">Property Enquiries</h1>
        <p className="text-xs text-slate-500">Manage buyer/tenant leads for your listings and track enquiries sent to other owners.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setTab("RECEIVED")}
          className={`pb-3 text-xs font-bold transition-all relative ${
            tab === "RECEIVED" ? "text-red-600 border-b-2 border-red-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Received Enquiries ({received.length})
        </button>
        <button
          onClick={() => setTab("SENT")}
          className={`pb-3 text-xs font-bold transition-all relative ${
            tab === "SENT" ? "text-red-600 border-b-2 border-red-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Sent Enquiries ({sent.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading enquiries...</div>
      ) : tab === "RECEIVED" ? (
        received.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm space-y-2">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Enquiries Received Yet</h3>
            <p className="text-xs text-slate-500">When potential buyers or tenants enquire about your listed properties, they will show up here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {received.map((enq) => (
              <div
                key={enq.id}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3 hover:border-slate-200 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                    <Building2 className="w-4 h-4 text-red-600" />
                    <span>{enq.property?.title || "Property Listing"}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(enq.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Enquirer Info</span>
                    <div className="font-bold text-slate-800 text-sm mt-0.5">{enq.name || "Interested Buyer"}</div>
                    <div className="flex items-center space-x-2 text-slate-600 mt-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`tel:${enq.phone}`} className="hover:text-red-600 font-medium">
                        {enq.phone}
                      </a>
                    </div>
                    {enq.email && (
                      <div className="flex items-center space-x-2 text-slate-600 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{enq.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Message</span>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl mt-1 text-xs">{enq.message || "No message attached."}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Status:</span>
                    <select
                      value={enq.status || "PENDING"}
                      onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                      disabled={updatingId === enq.id}
                      className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                  <a
                    href={`https://wa.me/${enq.phone?.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl inline-flex items-center space-x-1"
                  >
                    <span>Contact via WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )
      ) : sent.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm space-y-2">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Sent Enquiries</h3>
          <p className="text-xs text-slate-500">Enquiries you send to sellers on property pages will be recorded here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sent.map((enq) => (
            <div key={enq.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-900">{enq.property?.title || "Property"}</span>
                <span className="text-[10px] text-slate-400">{new Date(enq.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">{enq.message}</p>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  Status: {enq.status || "SENT"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEnquiries;
