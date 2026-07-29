"use client";

import Link from"next/link";
import { ChevronLeft } from"@carbon/icons-react";

interface PageHeaderProps {
 title: string;
 backUrl: string;
 backLabel?: string;
}

export default function PageHeader({ title, backUrl, backLabel ="Back"}: PageHeaderProps) {
 return (
 <div className="flex flex-col gap-2 mb-6">
 <Link 
 href={backUrl} 
 className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit group"
 >
 <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
 {backLabel}
 </Link>
 <div className="flex justify-between items-center bg-card p-6">
 <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
 {title}
 </h1>
 </div>
 </div>
 );
}
