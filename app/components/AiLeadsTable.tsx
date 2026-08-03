"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { transferToMainLeads, deleteAiLeads } from "@/app/(app)/ai-leads/actions";
import LeadDetailsPanel from "./LeadDetailsPanel";
import { Launch, TrashCan, Checkmark, Search, Add, Email } from "@carbon/icons-react";
import toast from "react-hot-toast";
import { usePermissions } from "@/lib/hooks/usePermissions";

export default function AiLeadsTable({ leads, templates = [] }: { leads: any[]; templates?: any[] }) {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const searchedLeads = leads.filter(lead => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const searchableString = [
      lead.businessName,
      lead.name,
      lead.email,
      lead.phone,
      lead.website,
      lead.city,
      lead.country,
      lead.campaign?.niche
    ].filter(Boolean).join(" ").toLowerCase();
    return searchableString.includes(q);
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeadIds(searchedLeads.map(l => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (e.target.checked) {
      setSelectedLeadIds(prev => [...prev, id]);
    } else {
      setSelectedLeadIds(prev => prev.filter(leadId => leadId !== id));
    }
  };

  const handleBulkTransfer = async () => {
    if (selectedLeadIds.length === 0) return;
    setIsTransferring(true);
    await transferToMainLeads(selectedLeadIds);
    toast.success(`${selectedLeadIds.length} leads transferred successfully`);
    setSelectedLeadIds([]);
    setIsTransferring(false);
  };

  const handleBulkDelete = async () => {
    if (selectedLeadIds.length === 0) return;
    if (!confirm("Are you sure you want to delete these AI leads?")) return;
    setIsDeleting(true);
    await deleteAiLeads(selectedLeadIds);
    toast.success(`${selectedLeadIds.length} leads deleted successfully`);
    setSelectedLeadIds([]);
    setIsDeleting(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-card animate-in fade-in duration-500 overflow-y-auto">
      <div className="flex-none p-6 md:p-8 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">Review raw scraped prospects and transfer them to your main pipeline.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search AI leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground transition-colors"
            />
          </div>
          {selectedLeadIds.length > 0 && hasPermission("MANAGE_AI_LEADS") && (
            <>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="flex items-center px-3 py-2 bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors cursor-pointer rounded-md"
              >
                <TrashCan className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{isDeleting ? '...' : 'Delete'}</span>
              </button>
              <button
                onClick={handleBulkTransfer}
                disabled={isTransferring}
                className="flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm cursor-pointer rounded-md whitespace-nowrap"
              >
                <Checkmark className="w-4 h-4 mr-2" />
                {isTransferring ? 'Transferring...' : `Transfer to Leads (${selectedLeadIds.length})`}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8">
        {searchedLeads.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 border border-border">
            <h3 className="text-lg font-medium text-foreground mb-2">No AI Leads Found</h3>
            <p className="text-muted-foreground text-sm mb-6">Launch a scraping campaign to find new prospects automatically.</p>
          </div>
        ) : (
          <div className="bg-card border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted text-muted-foreground">
                  <tr>
                    <th className="p-4 w-12">
                      <input 
                        type="checkbox" 
                        checked={selectedLeadIds.length === searchedLeads.length && searchedLeads.length > 0}
                        onChange={handleSelectAll}
                        className="cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 font-medium">Business / Name</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Campaign Source</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {searchedLeads.map((lead) => (
                    <tr 
                      key={lead.id} 
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={selectedLeadIds.includes(lead.id)}
                          onChange={(e) => handleSelectOne(e, lead.id)}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{lead.businessName}</div>
                        {lead.name && <div className="text-xs text-muted-foreground mt-0.5">{lead.name}</div>}
                        {lead.website && (
                          <a onClick={(e) => e.stopPropagation()} href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-0.5 inline-flex items-center w-fit">
                            {lead.website} <Launch className="w-3 h-3 ml-1" />
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {lead.email && <div className="text-foreground">{lead.email}</div>}
                        {lead.phone && <div className="text-muted-foreground text-xs mt-0.5">{lead.phone}</div>}
                        {!lead.email && !lead.phone && <span className="text-muted-foreground italic text-xs">No contact info</span>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {[lead.city, lead.state, lead.country].filter(Boolean).join(", ")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-sm">
                          {lead.campaign?.niche || "Unknown Niche"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={`/email/compose/${lead.id}`}
                          className="text-blue-600 hover:text-blue-700 transition-colors inline-block cursor-pointer mr-3"
                          title="Compose Email"
                        >
                          <Email size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <LeadDetailsPanel lead={selectedLead} templates={templates} onClose={() => setSelectedLead(null)} />
    </div>
  );
}
