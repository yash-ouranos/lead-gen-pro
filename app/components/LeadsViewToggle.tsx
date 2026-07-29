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



export default function LeadsViewToggle({ leads, variant = "leads" }: { leads: any[], variant?: "dashboard" | "leads" }) {
    const router = useRouter();
    const [view, setView] = useState<"table" | "kanban">("table");
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [leadStatuses, setLeadStatuses] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/lead-status").then(r => r.json()).then(setLeadStatuses);
    }, []);

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
        { value: "status", label: "Status", options: uniqueLeadStatuses.map(s => ({ label: formatStatus(s), value: s })) },
        { value: "methodOfContact", label: "Method of Contact" },
        { value: "leadSource", label: "Lead Source" },
        { value: "aiScore", label: "AI Score" },
        { value: "activeStatus", label: "Lead State", options: uniqueActiveStatuses.map(s => ({ label: s, value: s })) }
    ];

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-4 bg-card px-4 py-2.5 border-b relative z-20">
                <div className="flex gap-1 bg-muted p-1 rounded-sm shrink-0">
                    <button
                        onClick={() => setView("table")}
                        className={cn(
                            "p-1.5 rounded-sm transition-all flex items-center justify-center",
                            view === "table" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                        title="List View"
                    >
                        <List size={18} />
                    </button>
                    <button
                        onClick={() => setView("kanban")}
                        className={cn(
                            "p-1.5 rounded-sm transition-all flex items-center justify-center",
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
                            className="pl-9 pr-4 py-1.5 border border-border rounded text-sm bg-background w-full md:w-[180px] lg:w-[220px] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    {variant === 'leads' && (
                        <>
                            <button className="flex items-center gap-2 border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors rounded bg-background text-foreground">
                                <Upload size={16} /> Import
                            </button>
                            <button className="flex items-center gap-2 border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors rounded bg-background text-foreground">
                                <User size={16} /> Assign
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
                        className="bg-primary text-white px-4 py-2 flex items-center gap-2 font-medium hover:bg-primary/90 transition"
                    >
                        <Add className="w-4 h-4"/> Add Lead
                    </Link>
                </div>
            </div>

            <div className="flex-1 min-h-[500px] bg-card pt-4 flex flex-col">
                {view === "table" ? (
                    <div className="overflow-hidden flex-1 flex flex-col">
                        <LeadTable leads={filteredLeads} onLeadClick={setSelectedLead} variant={variant} />
                    </div>
                ) : (
                    <KanbanBoard initialLeads={filteredLeads} onLeadClick={setSelectedLead} />
                )}
            </div>

            <LeadDetailsPanel lead={selectedLead} onClose={() => setSelectedLead(null)} />
        </div>
    );
}
