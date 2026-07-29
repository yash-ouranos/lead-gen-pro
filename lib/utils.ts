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

export const STATUS_ORDER = ["NEW", "OPEN", "CONTACTED", "ENGAGED", "MEETING_BOOKED", "CLOSED_WON", "HOLD", "CLOSED_LOST"];

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

