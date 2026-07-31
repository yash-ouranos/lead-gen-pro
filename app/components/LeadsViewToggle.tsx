"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LeadTable from "./LeadTable";
import KanbanBoard from "./KanbanBoard";
import LeadDetailsPanel from "./LeadDetailsPanel";
import { List, Column, Filter, TrashCan, Add, User, Upload, Search } from "@carbon/icons-react";
import { cn, formatStatus, sortStatuses } from "@/lib/utils";
import Link from "next/link";
import { useAdvancedFilter } from "@/app/hooks/useAdvancedFilter";
import AdvancedFilterPopover from "./AdvancedFilterPopover";
import ImportLeadsModal from "./ImportLeadsModal";



export default function LeadsViewToggle({ leads, templates = [], variant = "leads" }: { leads: any[], templates?: any[], variant?: "dashboard" | "leads" }) {
    const router = useRouter();
    const [view, setView] = useState<"table" | "kanban">("table");
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [leadStatuses, setLeadStatuses] = useState<any[]>([]);
    const [methodOfContacts, setMethodOfContacts] = useState<any[]>([]);
    const [promotions, setPromotions] = useState<any[]>([]);
    const [staffs, setStaffs] = useState<any[]>([]);
    const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedStaffToAssign, setSelectedStaffToAssign] = useState("");
    const [isAssigning, setIsAssigning] = useState(false);

    useEffect(() => {
        fetch("/api/lead-status").then(r => r.json()).then(setLeadStatuses);
        fetch("/api/method-of-contact").then(r => r.json()).then(setMethodOfContacts);
        fetch("/api/promotions").then(r => r.json()).then(setPromotions);
        fetch("/api/staffs").then(r => r.json()).then(setStaffs);
    }, []);

    const handleBulkAssign = async () => {
        if (selectedLeadIds.length === 0) return;
        setIsAssigning(true);
        try {
            await fetch('/api/leads/bulk-assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadIds: selectedLeadIds, staffId: selectedStaffToAssign })
            });
            setSelectedLeadIds([]);
            setIsAssignModalOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Failed to bulk assign", error);
        } finally {
            setIsAssigning(false);
        }
    };

    const uniqueLeadStatuses = sortStatuses(Array.from(new Set([
        ...leads.map(l => l.status),
        ...leadStatuses.filter(s => s.status === 'Active').map(s => s.name)
    ])).filter(Boolean) as string[]);

    const uniqueActiveStatuses = ["Active", "Inactive", "Deleted"];

    const searchedLeads = leads.filter(lead => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const searchableString = [
            lead.name,
            lead.businessName,
            lead.email,
            lead.phone,
            lead.website,
            lead.streetNo,
            lead.city,
            lead.state,
            lead.country,
            lead.pinCode,
            lead.remarks
        ].filter(Boolean).join(" ").toLowerCase();

        return searchableString.includes(q);
    });

    const { filteredData: filteredLeads, filters, setFilters, appliedFilterCount } = useAdvancedFilter(searchedLeads);

    const dynamicColumns = [
        { value: "name", label: "Name" },
        { value: "companyName", label: "Company" },
        { value: "jobTitle", label: "Title" },
        { value: "email", label: "Email" },
        { value: "phone", label: "Phone" },
        { value: "temperature", label: "Temperature", options: [{label: "Hot", value: "Hot"}, {label: "Warm", value: "Warm"}, {label: "Cold", value: "Cold"}] },
        { value: "status", label: "Status", options: uniqueLeadStatuses.map(s => ({ label: formatStatus(s), value: s })) },
        { value: "methodOfContact", label: "Method of Contact", options: methodOfContacts.filter(m => m.status === 'Active').map(m => ({ label: m.name, value: m.name })) },
        { value: "promotions", label: "Promotion", options: promotions.filter(p => p.status === 'Active').map(p => ({ label: p.name, value: p.name })) },
        { value: "leadSource", label: "Lead Source" },
        { value: "country", label: "Country" },
        { value: "state", label: "State" },
        { value: "city", label: "City" },
        { value: "activeStatus", label: "Lead Status", options: uniqueActiveStatuses.map(s => ({ label: s, value: s })) }
    ];

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4 bg-card px-4 py-2.5 border-b relative z-20">
                <div className="flex gap-1 bg-muted p-1 rounded-sm shrink-0">
                    <button
                        onClick={() => setView("table")}
                        className={cn(
                            "p-1.5 rounded-sm transition-all flex items-center justify-center cursor-pointer",
                            view === "table" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                        title="List View"
                    >
                        <List size={18} />
                    </button>
                    <button
                        onClick={() => setView("kanban")}
                        className={cn(
                            "p-1.5 rounded-sm transition-all flex items-center justify-center cursor-pointer",
                            view === "kanban" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                        title="Kanban Board"
                    >
                        <Column size={18} />
                    </button>
                </div>
                <div className="flex flex-wrap items-center gap-3 ml-auto justify-end">
                    <div className="relative shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-border rounded-md bg-background w-full md:w-[180px] lg:w-[220px] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    {variant === 'leads' && (
                        <>
                            <button 
                                onClick={() => setIsImportModalOpen(true)}
                                className="flex items-center gap-2 border border-border px-4 py-2 font-medium hover:bg-muted transition-colors rounded-md bg-background text-foreground cursor-pointer"
                            >
                                <Upload size={16} /> Import
                            </button>
                            <button 
                                onClick={() => {
                                    setSelectedStaffToAssign("");
                                    setIsAssignModalOpen(true);
                                }}
                                disabled={selectedLeadIds.length === 0}
                                className="flex items-center gap-2 border border-border px-4 py-2 font-medium hover:bg-muted transition-colors rounded-md bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <User size={16} /> Assign {selectedLeadIds.length > 0 && `(${selectedLeadIds.length})`}
                            </button>
                        </>
                    )}
                    <AdvancedFilterPopover
                        columns={dynamicColumns}
                        filters={filters}
                        setFilters={setFilters}
                        appliedFilterCount={appliedFilterCount}
                    />
                    <Link
                        href="/leads/new"
                        className="bg-primary text-white px-4 py-2 flex items-center gap-2 font-medium hover:bg-primary/90 transition rounded-md"
                    >
                        <Add className="w-4 h-4" /> Add Lead
                    </Link>
                </div>
            </div>

            <div className="flex-1 min-h-[500px] bg-card pt-4 flex flex-col">
                {view === "table" ? (
                    <div className="overflow-hidden flex-1 flex flex-col">
                        <LeadTable 
                            leads={filteredLeads} 
                            onLeadClick={setSelectedLead} 
                            variant={variant} 
                            selectedLeadIds={selectedLeadIds}
                            setSelectedLeadIds={setSelectedLeadIds}
                        />
                    </div>
                ) : (
                    <KanbanBoard initialLeads={filteredLeads} onLeadClick={setSelectedLead} />
                )}
            </div>

            <LeadDetailsPanel lead={selectedLead} templates={templates} onClose={() => setSelectedLead(null)} />

            {/* Assign Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in" onClick={() => setIsAssignModalOpen(false)}>
                    <div className="bg-card w-full max-w-md rounded-lg shadow-xl border border-border p-6 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-semibold text-foreground mb-4">Assign Leads</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                            Select a user to assign to the {selectedLeadIds.length} selected lead(s).
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-foreground mb-1.5">User</label>
                            <select
                                value={selectedStaffToAssign}
                                onChange={(e) => setSelectedStaffToAssign(e.target.value)}
                                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary cursor-pointer"
                            >
                                <option value="">Unassigned</option>
                                {staffs.filter(s => s.status === 'Active').map((staff) => (
                                    <option key={staff.id} value={staff.id}>
                                        {staff.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsAssignModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-md transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkAssign}
                                disabled={isAssigning}
                                className="px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {isAssigning ? 'Assigning...' : 'Assign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Import Leads Modal */}
            <ImportLeadsModal 
                isOpen={isImportModalOpen}
                onOpenChange={setIsImportModalOpen}
                onSuccess={() => setSelectedLeadIds([])}
            />
        </div>
    );
}
