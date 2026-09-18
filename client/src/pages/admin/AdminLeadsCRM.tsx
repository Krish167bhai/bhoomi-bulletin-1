import React, { useEffect, useState } from 'react';
import api from '../../api/client.js';
import {
  Users,
  Search,
  Plus,
  Calendar,
  Phone,
  MessageSquare,
  ChevronRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'NEW', label: 'New Leads', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { id: 'CONTACTED', label: 'Contacted', color: 'bg-amber-50 border-amber-200 text-amber-800' },
  { id: 'FOLLOW_UP', label: 'Follow-ups', color: 'bg-purple-50 border-purple-200 text-purple-800' },
  { id: 'QUALIFIED', label: 'Qualified', color: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
  { id: 'CONVERTED', label: 'Converted', color: 'bg-green-50 border-green-200 text-green-800' },
  { id: 'CLOSED', label: 'Closed', color: 'bg-slate-100 border-slate-200 text-slate-700' },
];

export const AdminLeadsCRM: React.FC = () => {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  // Note Modal
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [newNote, setNewNote] = useState('');
  const [nextFollowUp, setNextFollowUp] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/leads');
      if (res.data.success) {
        setEnquiries(res.data.enquiries || []);
        setRequirements(res.data.requirements || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const allLeads = [
    ...enquiries.map((e) => ({ ...e, leadType: 'ENQUIRY' })),
    ...requirements.map((r) => ({ ...r, leadType: 'REQUIREMENT' })),
  ];

  const filteredLeads = allLeads.filter((lead) => {
    const q = searchFilter.toLowerCase();
    return (
      lead.name.toLowerCase().includes(q) ||
      lead.phone.toLowerCase().includes(q) ||
      (lead.property?.title && lead.property.title.toLowerCase().includes(q))
    );
  });

  const handleUpdateStatus = async (id: string, leadType: string, newStatus: string) => {
    try {
      await api.patch(`/admin/leads/${id}/status`, {
        leadType,
        status: newStatus,
      });
      fetchLeads();
    } catch (err) {
      alert('Error updating status.');
    }
  };

  const handleSaveNote = async () => {
    if (!selectedLead || !newNote.trim()) return;
    setSavingNote(true);
    try {
      await api.patch(`/admin/leads/${selectedLead.id}/status`, {
        leadType: selectedLead.leadType,
        status: selectedLead.status,
        note: newNote,
        followUpDate: nextFollowUp || null,
      });
      alert('Note saved to lead timeline.');
      setNewNote('');
      setNextFollowUp('');
      setSelectedLead(null);
      fetchLeads();
    } catch (err) {
      alert('Failed to save note.');
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Outfit'] flex items-center space-x-2">
            <Users className="w-6 h-6 text-red-600" />
            <span>Broker &amp; Lead Management CRM Pipeline</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track customer acquisition pipeline stages: New → Contacted → Follow-up → Qualified → Converted → Closed.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search leads by name/phone..."
            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* CRM Pipeline Kanban / Column Layout (Requirement 16) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => l.status === stage.id);
          return (
            <div
              key={stage.id}
              className="bg-slate-50 rounded-2xl border border-slate-200 p-3 space-y-3 min-w-[200px]"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-bold text-xs text-slate-800 font-['Outfit']">
                  {stage.label}
                </span>
                <span className="text-[10px] font-extrabold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                  {stageLeads.length}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
                {stageLeads.length === 0 ? (
                  <div className="text-[11px] text-slate-400 text-center py-6 italic">No leads in stage</div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs"
                    >
                      <div className="font-bold text-slate-900 truncate">{lead.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{lead.phone}</span>
                      </div>

                      {lead.property ? (
                        <div className="text-[11px] text-slate-600 truncate bg-slate-50 p-1 rounded">
                          {lead.property.title}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-600 truncate bg-red-50 text-red-700 p-1 rounded">
                          Req: {lead.preferredLocation} ({lead.propertyType})
                        </div>
                      )}

                      {/* Move stage dropdown */}
                      <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                        <select
                          value={lead.status}
                          onChange={(e) => handleUpdateStatus(lead.id, lead.leadType, e.target.value)}
                          className="text-[10px] font-semibold p-1 border border-slate-200 rounded bg-slate-50"
                        >
                          {PIPELINE_STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="text-[10px] font-bold text-red-600 hover:underline"
                        >
                          Notes ({lead.notes?.length || 0})
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Note / Follow-up Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 font-['Outfit']">
                Lead Activity &amp; Notes: {selectedLead.name}
              </h3>
              <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            {/* Timeline Notes */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(!selectedLead.notes || selectedLead.notes.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No notes logged yet for this lead.</p>
              ) : (
                selectedLead.notes.map((n: any) => (
                  <div key={n.id} className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{n.author?.name || 'Staff Note'}</span>
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-700">{n.note}</p>
                    {n.nextFollowUp && (
                      <span className="inline-block text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                        Next Follow-up: {new Date(n.nextFollowUp).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add note */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Add CRM Note *</label>
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="e.g. Spoke to client on phone. Scheduled site inspection this Saturday at 3 PM."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Set Next Follow-up Date</label>
                <input
                  type="date"
                  value={nextFollowUp}
                  onChange={(e) => setNextFollowUp(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingNote || !newNote.trim()}
                  onClick={handleSaveNote}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow"
                >
                  {savingNote ? 'Saving...' : 'Save Activity Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
