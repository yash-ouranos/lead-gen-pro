"use client";

import { useState, useEffect } from"react";
import { useRouter } from"next/navigation";
import { Activity, Star, Launch, Email, Location, OverflowMenuHorizontal } from"@carbon/icons-react";
import Link from"next/link";
import { cn } from"@/lib/utils";
import * as DropdownMenuPrimitive from"@radix-ui/react-dropdown-menu";

const STATUSES = [
  "NEW", 
  "OPEN",
  "CONTACTED", 
  "ENGAGED", 
  "MEETING_BOOKED", 
  "CLOSED_WON", 
  "HOLD",
  "CLOSED_LOST"
];

const STATUS_LABELS: Record<string, string> = {
  "NEW": "NEW",
  "OPEN": "OPEN",
  "CONTACTED": "CONNECTED",
  "ENGAGED": "ENGAGED",
  "MEETING_BOOKED": "MEETING BOOKED",
  "CLOSED_WON": "CLOSED WON",
  "HOLD": "HOLD",
  "CLOSED_LOST": "CLOSED LOST"
};

type Lead = any;

export default function KanbanBoard({ initialLeads, onLeadClick }: { initialLeads: Lead[], onLeadClick?: (lead: Lead) => void }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const router = useRouter();

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      e.target && (e.target as HTMLElement).classList.add("opacity-50");
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedLeadId(null);
    e.target && (e.target as HTMLElement).classList.remove("opacity-50");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (!draggedLeadId) return;

    setLeads(prev => prev.map(lead => 
      lead.id === draggedLeadId ? { ...lead, status } : lead
    ));

    try {
      await fetch(`/api/leads/${draggedLeadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-4 pt-4 px-4">
      {STATUSES.map(status => {
        const columnLeads = leads.filter(l => l.status === status);
        return (
          <div 
            key={status}
            className="flex-shrink-0 w-80 bg-muted flex flex-col h-full border border-border shadow-sm overflow-hidden"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="p-3 border-b border-border bg-[#e0e0e0] flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-widest text-foreground flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", 
                  status === 'NEW' ? 'bg-primary' :
                  status === 'OPEN' ? 'bg-blue-500' :
                  status === 'CONTACTED' ? 'bg-indigo-500' :
                  status === 'ENGAGED' ? 'bg-violet-500' :
                  status === 'MEETING_BOOKED' ? 'bg-emerald-500' :
                  status === 'CLOSED_WON' ? 'bg-green-500' :
                  status === 'HOLD' ? 'bg-amber-500' :
                  'bg-muted-foreground'
                )} />
                {STATUS_LABELS[status]}
              </h3>
              <span className="text-xs font-mono font-bold text-muted-foreground bg-background px-2 py-0.5 border border-border shadow-sm">
                {columnLeads.length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
 {columnLeads.map(lead => (
 <div
 key={lead.id}
 draggable
 onClick={() => onLeadClick?.(lead)}
 onDragStart={(e) => handleDragStart(e, lead.id)}
 onDragEnd={handleDragEnd}
 className="bg-card p-4 border border-border cursor-pointer active:cursor-grabbing hover:border-primary/50 hover:shadow-md transition-all group"
 >
 <div className="flex justify-between items-start mb-2">
 <h4 className="font-semibold text-foreground text-sm">{lead.businessName}</h4>
 {lead.aiScore !== null && (
 <span className={cn("text-[10px] font-mono font-bold px-1.5 py-0.5 border", 
 lead.aiScore > 80 ?'bg-emerald-500/10 text-emerald-500 border-emerald-500/20': 
 lead.aiScore > 50 ?'bg-amber-500/10 text-amber-500 border-amber-500/20':'bg-rose-500/10 text-rose-500 border-rose-500/20'
 )}>
 {lead.aiScore}
 </span>
 )}
 </div>
 
 {lead.email && (
 <div className="text-xs text-muted-foreground mb-2 truncate">
 {lead.email}
 </div>
 )}

 <div className="flex items-center justify-between mt-4">
 <div className="flex items-center gap-2">
 {lead.emailLogs?.length > 0 && (
 <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-muted-foreground"title="Email Opens">
 <Activity size={12} className={lead.emailLogs[0].openCount > 0 ?"text-emerald-500":"text-muted-foreground/50"} />
 <span>{lead.emailLogs.reduce((sum: number, log: any) => sum + log.openCount, 0)}</span>
 </div>
 )}
 </div>
 
 <div className="flex items-center gap-1"onClick={e => e.stopPropagation()}>
 <Link href={`/email/compose/${lead.id}`} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"title="SendAlt Email">
 <Email size={14} />
 </Link>
 
 <DropdownMenuPrimitive.Root>
 <DropdownMenuPrimitive.Trigger asChild>
 <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
 <OverflowMenuHorizontal size={14} />
 </button>
 </DropdownMenuPrimitive.Trigger>
 <DropdownMenuPrimitive.Portal>
 <DropdownMenuPrimitive.Content align="end"className="z-50 min-w-[8rem] overflow-hidden border border-border bg-popover p-1 text-sm text-popover-foreground shadow-md">
 {lead.website && (
 <DropdownMenuPrimitive.Item asChild className="cursor-pointer select-none px-2 py-1.5 outline-none hover:bg-accent hover:text-accent-foreground">
 <a href={lead.website} target="_blank"rel="noreferrer"className="flex items-center justify-between">Website <Launch size={12} className="opacity-50"/></a>
 </DropdownMenuPrimitive.Item>
 )}
 {lead.mapUrl && (
 <DropdownMenuPrimitive.Item asChild className="cursor-pointer select-none px-2 py-1.5 outline-none hover:bg-accent hover:text-accent-foreground">
 <a href={lead.mapUrl} target="_blank"rel="noreferrer"className="flex items-center justify-between">Google Maps <Launch size={12} className="opacity-50"/></a>
 </DropdownMenuPrimitive.Item>
 )}
 </DropdownMenuPrimitive.Content>
 </DropdownMenuPrimitive.Portal>
 </DropdownMenuPrimitive.Root>
 </div>
 </div>
 </div>
 ))}
 
 {columnLeads.length === 0 && (
 <div className="h-24 border-2 border-dashed border-border/50 flex items-center justify-center text-xs font-medium text-muted-foreground/50 uppercase tracking-widest">
 Drop here
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 );
}
