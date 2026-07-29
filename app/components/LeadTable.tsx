"use client";

import { useState, useEffect } from "react";
import { Activity, ChevronLeft, Star, Renew, Launch, ChevronRight, Email, Location, Box, TrashCan, Edit } from "@carbon/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatStatus, sortStatuses } from "@/lib/utils";

type Lead = any; // We can type this properly later

type LeadTableProps = {
  leads: Lead[];
  onLeadClick?: (lead: Lead) => void;
  variant?: "dashboard" | "leads";
};

const ITEMS_PER_PAGE = 10;

export default function LeadTable({ leads, onLeadClick, variant = "leads" }: LeadTableProps) {
 const router = useRouter();
 const [currentPage, setCurrentPage] = useState(1);
  const [localLeads, setLocalLeads] = useState<Lead[]>(leads);
  const [leadStatuses, setLeadStatuses] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/lead-status").then(r => r.json()).then(setLeadStatuses);
    fetch("/api/staffs").then(r => r.json()).then(setStaffs);
  }, []);
 const [updatingId, setUpdatingId] = useState<string | null>(null);
 const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
 const [leadToDelete, setLeadToDelete] = useState<string | null>(null);

 useEffect(() => {
 setLocalLeads(leads);
 }, [leads]);

 const toggleSelectAll = () => {
    if (selectedLeadIds.length === localLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(localLeads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLeadIds(prev =>
      prev.includes(id) ? prev.filter(lId => lId !== id) : [...prev, id]
    );
  };

 const handleStatusChange = async (leadId: string, newStatus: string) => {
 setLocalLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
 setUpdatingId(leadId);
 
 try {
 await fetch(`/api/leads/${leadId}`, {
 method:'PATCH',
 headers: {'Content-Type':'application/json'},
 body: JSON.stringify({ status: newStatus })
 });
 router.refresh();
 } catch (error) {
 console.error("Failed to update status", error);
 setLocalLeads(leads); // revert
 } finally {
      setUpdatingId(null);
    }
  };

  const handleStaffChange = async (leadId: string, staffId: string) => {
    setLocalLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return { ...l, assignStaffId: staffId || null, staff: staffs.find(s => s.id === staffId) || null };
      }
      return l;
    }));
    setUpdatingId(leadId);
    
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignStaffId: staffId || null })
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to update staff", error);
      setLocalLeads(leads); // revert
    } finally {
      setUpdatingId(null);
    }
  };

  const promptDelete = (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLeadToDelete(leadId);
  };

  const confirmDelete = async () => {
    if (!leadToDelete) return;
    const idToDelete = leadToDelete;
    setLeadToDelete(null);

    setLocalLeads(prev => prev.filter(l => l.id !== idToDelete));
    setUpdatingId(idToDelete);

    try {
      await fetch(`/api/leads/${idToDelete}`, {
        method: 'DELETE',
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to delete lead", error);
      setLocalLeads(leads); // revert
    } finally {
      setUpdatingId(null);
    }
  };

 const totalPages = Math.ceil(localLeads.length / ITEMS_PER_PAGE) || 1;
 const paginatedLeads = localLeads.slice(
 (currentPage - 1) * ITEMS_PER_PAGE,
 currentPage * ITEMS_PER_PAGE
 );

 return (
 <div className="flex flex-col h-full justify-between w-full">
 <div className="overflow-x-auto flex-1">
 <table className="w-full text-left text-sm text-muted-foreground border-collapse">
 <thead className="bg-[#e0e0e0] border-b border-border text-[13px] font-semibold text-foreground">
                <tr>
                  {variant === 'leads' && (
                    <th className="px-6 py-4 w-[50px] text-center">
                      <input
                        type="checkbox"
                        checked={localLeads.length > 0 && selectedLeadIds.length === localLeads.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                      />
                    </th>
                  )}
                  <th className="px-4 py-4 w-[60px] text-center font-semibold text-xs tracking-wider uppercase">ID</th>
                  <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">LEAD NAME</th>
                  <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">COMPANY NAME</th>
                  {variant === 'leads' ? (
                    <>
                      <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">PROMOTION</th>
                      <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">REFERRAL</th>
                      <th className="px-6 py-4 text-center font-semibold text-xs tracking-wider uppercase">ASSIGNED USER</th>
                      <th className="px-6 py-4 text-center font-semibold text-xs tracking-wider uppercase">STATUS</th>
                      <th className="px-6 py-4 text-center font-semibold text-xs tracking-wider uppercase">LEAD STATUS</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">FOLLOW-UP DATE</th>
                      <th className="px-6 py-4 text-center font-semibold text-xs tracking-wider uppercase">LEAD STATUS</th>
                      <th className="px-6 py-4 text-center font-semibold text-xs tracking-wider uppercase">ASSIGNED USER</th>
                    </>
                  )}
                  <th className="px-6 py-4 text-right font-semibold text-xs tracking-wider uppercase">ACTIONS</th>
                </tr>
 </thead>
 <tbody>
 {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Box className="w-10 h-10 text-muted-foreground/40"/>
                        <p className="text-sm font-medium">No leads found. Create a campaign to start scraping.</p>
                      </div>
                    </td>
                  </tr>
 ) : null}
              {paginatedLeads.map((lead, index) => (
                <tr key={lead.id} className="bg-card hover:bg-muted/50 transition-colors hover: border-b border-border last:border-0 cursor-pointer group relative" onClick={() => onLeadClick?.(lead)}
                >
                  {variant === 'leads' && (
                    <td className="px-6 py-4 text-center relative" onClick={(e) => e.stopPropagation()}>
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"/>
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.includes(lead.id)}
                        onChange={(e) => toggleSelectLead(lead.id, e as any)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                      />
                    </td>
                  )}
                  <td className={`px-4 py-4 text-center font-medium text-foreground text-sm ${variant !== 'leads' ? 'relative' : ''}`}>
                    {variant !== 'leads' && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"/>
                    )}
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground text-sm">
                      {lead.name || lead.email || "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {lead.businessName || "NA"}
                  </td>
                  {variant === 'leads' ? (
                    <>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {lead.promotions && lead.promotions.length > 0 
                          ? lead.promotions.map((p: any) => p.name).join(", ") 
                          : "NA"}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {lead.referral ? lead.referral.name : "NA"}
                      </td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block w-full max-w-[150px]">
                          <select
                            value={lead.assignStaffId || ""}
                            onChange={(e) => handleStaffChange(lead.id, e.target.value)}
                            disabled={updatingId === lead.id}
                            className="appearance-none outline-none cursor-pointer w-full text-center px-2 py-1.5 pr-6 text-xs font-medium tracking-wide border transition-all bg-muted text-foreground border-border hover:border-muted-foreground/50 rounded"
                          >
                            <option value="">Unassigned</option>
                            {staffs.filter(s => s.status === 'Active').map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                            {lead.assignStaffId && !staffs.find(s => s.id === lead.assignStaffId) && lead.staff && (
                              <option value={lead.assignStaffId}>{lead.staff.name}</option>
                            )}
                          </select>
                          {updatingId === lead.id ? (
                            <Renew size={12} className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"/>
                          ) : (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          lead.activeStatus === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {lead.activeStatus || "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block w-full max-w-[130px]">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            disabled={updatingId === lead.id}
                            className={`appearance-none outline-none cursor-pointer w-full text-center px-2 py-1.5 pr-6 text-xs font-bold tracking-wide border transition-all ${
                              lead.status === 'NEW' ? 'bg-primary/10 text-primary border-primary/20 hover:border-primary/50' :
                              lead.status === 'CONTACTED' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:border-indigo-500/50' :
                              lead.status === 'ENGAGED' ? 'bg-violet-500/10 text-violet-500 border-violet-500/20 hover:border-violet-500/50' :
                              lead.status === 'MEETING_BOOKED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:border-emerald-500/50' :
                              lead.status === 'CLOSED_WON' ? 'bg-green-500/20 text-green-600 border-green-500/30 hover:border-green-500/50' :
                              lead.status === 'OPEN' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:border-blue-500/50' :
                              lead.status === 'HOLD' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:border-amber-500/50' :
                              lead.status === 'CLOSED_LOST' ? 'bg-muted text-muted-foreground border-border hover:border-muted-foreground/50' : 'bg-muted text-muted-foreground border-border'
                            }`}
                          >
                            {sortStatuses(Array.from(new Set([lead.status, ...leadStatuses.filter(s => s.status === 'Active').map(s => s.name)]))).map(s => (
                              <option key={s} value={s as string}>{formatStatus(s as string)}</option>
                            ))}
                          </select>
                          {updatingId === lead.id ? (
                            <Renew size={12} className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"/>
                          ) : (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                          )}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                        {lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "NA"}
                      </td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block w-full max-w-[130px]">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            disabled={updatingId === lead.id}
                            className={`appearance-none outline-none cursor-pointer w-full text-center px-2 py-1.5 pr-6 text-xs font-bold tracking-wide border transition-all ${
                              lead.status === 'NEW' ? 'bg-primary/10 text-primary border-primary/20 hover:border-primary/50' :
                              lead.status === 'CONTACTED' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:border-indigo-500/50' :
                              lead.status === 'ENGAGED' ? 'bg-violet-500/10 text-violet-500 border-violet-500/20 hover:border-violet-500/50' :
                              lead.status === 'MEETING_BOOKED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:border-emerald-500/50' :
                              lead.status === 'CLOSED_WON' ? 'bg-green-500/20 text-green-600 border-green-500/30 hover:border-green-500/50' :
                              lead.status === 'OPEN' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:border-blue-500/50' :
                              lead.status === 'HOLD' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:border-amber-500/50' :
                              lead.status === 'CLOSED_LOST' ? 'bg-muted text-muted-foreground border-border hover:border-muted-foreground/50' : 'bg-muted text-muted-foreground border-border'
                            }`}
                          >
                            {sortStatuses(Array.from(new Set([lead.status, ...leadStatuses.filter(s => s.status === 'Active').map(s => s.name)]))).map(s => (
                              <option key={s} value={s as string}>{formatStatus(s as string)}</option>
                            ))}
                          </select>
                          {updatingId === lead.id ? (
                            <Renew size={12} className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"/>
                          ) : (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block w-full max-w-[150px]">
                          <select
                            value={lead.assignStaffId || ""}
                            onChange={(e) => handleStaffChange(lead.id, e.target.value)}
                            disabled={updatingId === lead.id}
                            className="appearance-none outline-none cursor-pointer w-full text-center px-2 py-1.5 pr-6 text-xs font-medium tracking-wide border transition-all bg-muted text-foreground border-border hover:border-muted-foreground/50 rounded"
                          >
                            <option value="">Unassigned</option>
                            {staffs.filter(s => s.status === 'Active').map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                            {lead.assignStaffId && !staffs.find(s => s.id === lead.assignStaffId) && lead.staff && (
                              <option value={lead.assignStaffId}>{lead.staff.name}</option>
                            )}
                          </select>
                          {updatingId === lead.id ? (
                            <Renew size={12} className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"/>
                          ) : (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/leads/${lead.id}/edit`);
                        }}
                        className="cursor-pointer text-green-600 hover:text-green-700 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={(e) => promptDelete(lead.id, e)}
                        className="cursor-pointer text-red-500 hover:text-red-700 transition-colors"
                      >
                        <TrashCan size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
 ))}
 </tbody>
 </table>
 </div>

 {localLeads.length > 0 && (
 <div className="sticky bottom-0 z-10 px-6 py-4 border-t flex items-center justify-between bg-card shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
 <p className="text-xs text-muted-foreground font-medium">
 Showing <span className="font-bold text-foreground">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{""}
 <span className="font-bold text-foreground">
 {Math.min(currentPage * ITEMS_PER_PAGE, localLeads.length)}
 </span>{""}
 of <span className="font-bold text-foreground">{localLeads.length}</span> leads
 </p>
 <div className="flex items-center gap-1">
 <button
 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
 disabled={currentPage === 1}
 className="cursor-pointer p-1.5 border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
 >
 <ChevronLeft size={16} />
 </button>
 <span className="text-xs text-muted-foreground font-bold px-3 uppercase tracking-wider">
 Page {currentPage} of {totalPages}
 </span>
 <button
 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
 disabled={currentPage === totalPages}
 className="cursor-pointer p-1.5 border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
 >
 <ChevronRight size={16} />
 </button>
 </div>
 </div>
 )}

  {leadToDelete && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-xl shadow-lg border overflow-hidden">
        <div className="p-6 pb-0 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <TrashCan size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Delete Lead</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Are you sure you want to delete this lead? This action cannot be undone and will permanently remove the lead from your CRM.
            </p>
          </div>
        </div>
        <div className="p-6 pt-6 flex justify-end gap-3 bg-muted/20 mt-6">
          <button
            onClick={() => setLeadToDelete(null)}
            className="cursor-pointer px-4 py-2 rounded-md border border-input bg-background hover:bg-muted text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="cursor-pointer px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Lead
          </button>
        </div>
      </div>
    </div>
  )}
 </div>
 );
}
