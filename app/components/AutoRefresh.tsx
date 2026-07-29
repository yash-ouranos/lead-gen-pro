"use client";

import { useEffect } from"react";
import { useRouter } from"next/navigation";

interface AutoRefreshProps {
 isActive: boolean;
 intervalMs?: number;
}

export default function AutoRefresh({ isActive, intervalMs = 3000 }: AutoRefreshProps) {
 const router = useRouter();

 useEffect(() => {
 if (!isActive) return;

 const interval = setInterval(() => {
 router.refresh();
 }, intervalMs);

 return () => clearInterval(interval);
 }, [isActive, intervalMs, router]);

 return null; // This component doesn't render anything
}
