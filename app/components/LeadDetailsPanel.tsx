"use client";

import { useState, useEffect } from "react";
import { Edit, Close, Chat } from "@carbon/icons-react";
import { useRouter } from "next/navigation";
import { formatStatus, sortStatuses } from "@/lib/utils";
import MultiSelectDropdown from "@/app/components/MultiSelectDropdown";

export default function LeadDetailsPanel({ lead, onClose }: { lead: any; onClose: () => void }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [localActivities, setLocalActivities] = useState<any[]>(lead?.activities || []);
  
  const [editedLead, setEditedLead] = useState<any>(lead);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<"NOTES" | "HISTORY">("NOTES");

  const [staffs, setStaffs] = useState<any[]>([]);
  const [leadStatuses, setLeadStatuses] = useState<any[]>([]);

  useEffect(() => {
    if (lead) {
      setEditedLead(lead);
      setLocalActivities(lead.activities || []);
      setDirty(false);
      setEditingField(null);
    }
  }, [lead]);

  useEffect(() => {
    fetch('/api/staffs').then(res => res.json()).then(data => setStaffs(Array.isArray(data) ? data : []));
    fetch('/api/lead-status').then(res => res.json()).then(data => setLeadStatuses(Array.isArray(data) ? data : []));
  }, []);

  if (!lead || !editedLead) return null;

  const handleFieldChange = (field: string, value: any) => {
    setEditedLead((prev: any) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const renderActivityDescription = (desc: string) => {
    if (desc.startsWith('Assigned to staff ID: ')) {
      const staffId = desc.replace('Assigned to staff ID: ', '');
      const staff = staffs.find(s => s.id === staffId);
      return staff ? `Assigned to staff: ${staff.name}` : desc;
    }
    return desc;
  };

  const handleUpdateLead = async () => {
    setIsUpdating(true);
    try {
      const payload = {
        name: editedLead.name,
        businessName: editedLead.businessName,
        website: editedLead.website,
        phone: editedLead.phone,
        email: editedLead.email,
        leadType: editedLead.leadType,
        followUpDate: editedLead.followUpDate,
        assignStaffId: editedLead.assignStaffId,
        status: editedLead.status,
      };
      
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setDirty(false);
        setEditingField(null);
        router.refresh();
      }
    } catch(e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNoteSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!note.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const newNote = note;
    setNote("");

    // Optimistic UI
    const tempId = Date.now().toString();
    setLocalActivities(prev => [{
      id: tempId,
      type: "NOTE",
      description: newNote,
      createdAt: new Date().toISOString()
    }, ...prev]);

    try {
      const res = await fetch(`/api/leads/${lead.id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "NOTE", description: newNote })
      });
      if (res.ok) {
        const savedActivity = await res.json();
        setLocalActivities(prev => prev.map(a => a.id === tempId ? savedActivity : a));
        router.refresh();
      } else {
        setLocalActivities(prev => prev.filter(a => a.id !== tempId));
      }
    } catch (error) {
      setLocalActivities(prev => prev.filter(a => a.id !== tempId));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNoteSubmit();
    }
  };

  const renderDetailRow = (
    label: string, 
    field: string, 
    valueDisplay: string | null | undefined, 
    inputType: "text" | "email" | "date" | "select" | "multiselect" = "text",
    options?: { id: string; value: string; label: string }[]
  ) => {
    const isEditing = editingField === field;
    
    return (
      <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0 group">
        <div className="flex items-center gap-2 pr-4 w-full">
          <span className="font-bold text-gray-800 text-sm whitespace-nowrap w-[140px]">{label}:</span>
          
          {isEditing ? (
            <div className="flex-1 flex gap-2 relative">
              {inputType === "text" || inputType === "email" ? (
                <input 
                  type={inputType}
                  value={editedLead[field] || ""}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setEditingField(null); }}
                  autoFocus
                  className="w-full text-sm px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ) : inputType === "date" ? (
                <input 
                  type="date"
                  value={editedLead[field] ? new Date(editedLead[field]).toISOString().split('T')[0] : ""}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setEditingField(null); }}
                  autoFocus
                  className="w-full text-sm px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ) : inputType === "select" ? (
                <select 
                  value={editedLead[field] || ""}
                  onChange={(e) => { handleFieldChange(field, e.target.value); setEditingField(null); }}
                  onBlur={() => setEditingField(null)}
                  autoFocus
                  className="w-full text-sm px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  {options?.map(opt => (
                    <option key={opt.id} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : inputType === "multiselect" ? (
                <div className="w-full relative z-[60]">
                  <MultiSelectDropdown 
                    options={[{ id: "B2B", name: "B2B" }, { id: "B2C", name: "B2C" }]}
                    selectedIds={Array.isArray(editedLead[field]) ? editedLead[field] : []}
                    onChange={(ids) => handleFieldChange(field, ids)}
                    placeholder="Select Categories"
                  />
                </div>
              ) : null}
            </div>
          ) : (
            <span className="text-gray-600 text-sm flex-1">{valueDisplay || "N/A"}</span>
          )}
        </div>
        
        <button 
          type="button"
          onClick={() => setEditingField(isEditing ? null : field)}
          className="cursor-pointer text-gray-400 hover:text-blue-600 transition-colors shrink-0 mt-0.5"
        >
          <Edit size={16} />
        </button>
      </div>
    );
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-4 md:inset-10 lg:inset-x-20 xl:inset-x-32 z-50 bg-gray-100 shadow-2xl rounded-lg flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b shrink-0 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-900">Lead Details</h2>
          <button 
            onClick={onClose}
            className="cursor-pointer p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <Close size={20} />
          </button>
        </div>

        {/* Content Body - 2 Columns */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 md:p-6 gap-6">
          
          {/* Left Column - Details */}
          <div className="w-full md:w-[350px] lg:w-[450px] bg-white border rounded shadow-sm flex flex-col overflow-hidden shrink-0">
            <div className="flex-1 p-5 overflow-y-auto">
              {renderDetailRow("Name", "name", editedLead.name, "text")}
              {renderDetailRow("Company Name", "businessName", editedLead.businessName, "text")}
              {renderDetailRow("Website", "website", editedLead.website, "text")}
              {renderDetailRow("Contact No.", "phone", editedLead.phone, "text")}
              {renderDetailRow("Email", "email", editedLead.email, "email")}
              {renderDetailRow("Customer Categories", "leadType", Array.isArray(editedLead.leadType) ? editedLead.leadType.join(", ") : editedLead.leadType, "multiselect")}
              {renderDetailRow("Follow-Up Date", "followUpDate", editedLead.followUpDate ? new Date(editedLead.followUpDate).toLocaleDateString() : null, "date")}
              {renderDetailRow("Assign User", "assignStaffId", staffs.find(s => s.id === editedLead.assignStaffId)?.name, "select", staffs.map(s => ({ id: s.id, value: s.id, label: s.name })))}
              {renderDetailRow("Lead Status", "status", editedLead.status ? formatStatus(editedLead.status) : null, "select", sortStatuses(leadStatuses).map(s => ({ id: s.id, value: s.name, label: formatStatus(s.name) })))}
            </div>
            
            {dirty && (
              <div className="p-4 bg-gray-50 border-t shrink-0">
                <button 
                  onClick={handleUpdateLead}
                  disabled={isUpdating}
                  className="cursor-pointer w-full py-2 bg-primary text-white rounded font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Updating..." : "Update Details"}
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Notes & Activities */}
          <div className="flex-1 bg-white border rounded shadow-sm flex flex-col overflow-hidden">
            <div className="flex px-2 pt-2 border-b gap-2 bg-slate-50 shrink-0">
              <button 
                onClick={() => setActiveTab('NOTES')}
                className={`cursor-pointer px-4 py-2 font-medium text-[15px] border-b-2 transition-colors ${activeTab === 'NOTES' ? 'border-primary text-primary bg-white rounded-t' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Note Details
              </button>
              <button 
                onClick={() => setActiveTab('HISTORY')}
                className={`cursor-pointer px-4 py-2 font-medium text-[15px] border-b-2 transition-colors ${activeTab === 'HISTORY' ? 'border-primary text-primary bg-white rounded-t' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Activity History
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-white flex flex-col gap-4">
              {activeTab === 'NOTES' && (
                localActivities.filter((a: any) => a.type === 'NOTE').length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                    No notes yet. Type below and press Enter.
                  </div>
                ) : (
                  <div className="space-y-4 flex flex-col-reverse">
                    {localActivities.filter((a: any) => a.type === 'NOTE').map((activity: any) => (
                      <div key={activity.id} className="flex flex-col items-end">
                        <div className="max-w-[80%] rounded p-3 bg-indigo-50 border border-indigo-100 text-indigo-900 shadow-sm relative">
                          <p className="text-sm whitespace-pre-wrap">{activity.description}</p>
                        </div>
                        <span className="text-xs text-gray-400 mt-1.5 px-1 font-medium">
                          {activity.user?.name ? `${activity.user.name} • ` : ''}
                          {new Date(activity.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === 'HISTORY' && (
                localActivities.filter((a: any) => a.type !== 'NOTE').length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                    No activity history.
                  </div>
                ) : (
                  <div className="space-y-4 flex flex-col-reverse">
                    {localActivities.filter((a: any) => a.type !== 'NOTE').map((activity: any) => (
                      <div key={activity.id} className="flex flex-col items-start">
                        <div className="rounded p-3 bg-gray-50 border border-gray-100 text-gray-800 shadow-sm w-full max-w-[80%]">
                          <div className="text-[10px] font-bold mb-1 text-gray-400 uppercase tracking-wider">{activity.type.replace(/_/g, ' ')}</div>
                          <p className="text-sm whitespace-pre-wrap font-medium">{renderActivityDescription(activity.description)}</p>
                        </div>
                        <span className="text-xs text-gray-400 mt-1.5 px-1 font-medium">
                          {activity.user?.name ? `${activity.user.name} • ` : ''}
                          {new Date(activity.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {activeTab === 'NOTES' && (
              <div className="p-4 bg-white border-t shrink-0">
                <form onSubmit={handleNoteSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your note and press Enter..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={!note.trim() || isSubmitting}
                    className="cursor-pointer px-4 py-3 bg-slate-50 border border-slate-200 text-gray-500 rounded-md hover:bg-slate-100 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Chat size={20} />
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
