import React, { useState } from "react";
import api from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.js";
import { User, ShieldCheck, Camera, Edit3, Send, CheckCircle2, AlertCircle } from "lucide-react";

export const AccountInfo: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [changeField, setChangeField] = useState("name");
  const [newValue, setNewValue] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      await api.put("/auth/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refreshUser();
      setMessage({ type: "success", text: "Avatar updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to upload avatar" });
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim() || !reason.trim()) return;

    try {
      setSubmitting(true);
      await api.post("/auth/information-change-request", {
        fieldName: changeField,
        newValue,
        reason,
      });
      setMessage({ type: "success", text: "Information change request submitted to Admin for approval." });
      setModalOpen(false);
      setNewValue("");
      setReason("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to submit request" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 font-['Outfit']">Account Details</h1>
          <p className="text-xs text-slate-500">Verified profile details and admin information change request management.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          <span>Request Info Change</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center space-x-2 ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Profile Info Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
        {/* Avatar section */}
        <div className="flex items-center space-x-6 pb-6 border-b border-slate-100">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-red-600 text-white text-2xl font-black flex items-center justify-center overflow-hidden shadow-md">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name.charAt(0).toUpperCase()
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-slate-900 text-white p-1.5 rounded-full cursor-pointer hover:bg-red-600 transition-colors">
              <Camera className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">{user?.name}</h2>
              {user?.verificationStatus === "VERIFIED" && (
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Badge (🔵)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
              Role: {user?.userType}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Full Name</span>
            <div className="font-bold text-slate-800 text-sm mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {user?.name}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Email Address</span>
            <div className="font-bold text-slate-800 text-sm mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {user?.email}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</span>
            <div className="font-bold text-slate-800 text-sm mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {user?.phone || "Not specified"}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Account Type</span>
            <div className="font-bold text-slate-800 text-sm mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {user?.userType}
            </div>
          </div>

          {user?.companyName && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Company Name</span>
              <div className="font-bold text-slate-800 text-sm mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {user.companyName}
              </div>
            </div>
          )}

          {user?.licenseNumber && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">RERA / License Number</span>
              <div className="font-bold text-slate-800 text-sm mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {user.licenseNumber}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Information Change Request */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Request Information Change</h3>
            <p className="text-xs text-slate-500">
              To prevent unauthorized changes to verified listings and accounts, all personal details updates require Admin review.
            </p>

            <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Field to Update</label>
                <select
                  value={changeField}
                  onChange={(e) => setChangeField(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                >
                  <option value="name">Full Name</option>
                  <option value="phone">Phone Number</option>
                  <option value="companyName">Company Name</option>
                  <option value="licenseNumber">RERA / License Number</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">New Value Requested</label>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter the new details"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Change</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide context or proof for the change request..."
                  required
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold inline-flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Submitting..." : "Submit Request"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountInfo;
