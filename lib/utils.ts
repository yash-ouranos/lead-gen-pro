import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatStatus(status: string | null | undefined) {
  if (!status) return "";
  const spaced = status.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

export const STATUS_ORDER = ["NEW", "OPEN", "EMAIL_SENT", "ENGAGED", "MEETING_BOOKED", "CLOSED_WON", "HOLD", "CLOSED_LOST"];

export function getStatusColorClass(status: string | null | undefined) {
  if (!status) return 'bg-muted text-muted-foreground border-border hover:border-muted-foreground/50';
  
  // Specific overrides for standard statuses
  const overrides: Record<string, string> = {
    'NEW': 'bg-primary/10 text-primary border-primary/20 hover:border-primary/50',
    'CLOSED_WON': 'bg-green-500/20 text-green-600 border-green-500/30 hover:border-green-500/50',
    'CLOSED_LOST': 'bg-muted text-muted-foreground border-border hover:border-muted-foreground/50',
    'HOLD': 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:border-amber-500/50',
  };

  if (overrides[status]) return overrides[status];
  if (overrides[status.toUpperCase()]) return overrides[status.toUpperCase()];

  // Hash string to pick a color
  let hash = 0;
  for (let i = 0; i < status.length; i++) {
    hash = status.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  
  const palettes = [
    'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:border-blue-500/50',
    'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:border-indigo-500/50',
    'bg-violet-500/10 text-violet-500 border-violet-500/20 hover:border-violet-500/50',
    'bg-pink-500/10 text-pink-500 border-pink-500/20 hover:border-pink-500/50',
    'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:border-rose-500/50',
    'bg-orange-500/10 text-orange-500 border-orange-500/20 hover:border-orange-500/50',
    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:border-emerald-500/50',
    'bg-teal-500/10 text-teal-500 border-teal-500/20 hover:border-teal-500/50',
    'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 hover:border-cyan-500/50',
    'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20 hover:border-fuchsia-500/50',
  ];

  return palettes[hash % palettes.length];
}

export function sortStatuses<T>(statuses: T[], getName: (s: T) => string = (s) => (s as any).name || String(s)): T[] {
  return [...statuses].sort((a, b) => {
    const nameA = getName(a);
    const nameB = getName(b);
    const indexA = STATUS_ORDER.indexOf(nameA);
    const indexB = STATUS_ORDER.indexOf(nameB);
    
    if (indexA === -1 && indexB === -1) {
      return nameA.localeCompare(nameB);
    }
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

