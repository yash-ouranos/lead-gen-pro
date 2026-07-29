"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dashboard, Gift, Group, Document, Settings, Phone, Task, UserMultiple, Bot, Connect, Security, UserRole, UserAdmin } from "@carbon/icons-react";

export default function Sidebar() {
  const pathname = usePathname();

  const mainNav = [
    { href: "/dashboard", label: "Dashboard", icon: Dashboard },
    { href: "/leads", label: "Leads", icon: UserMultiple },
    { href: "/campaigns/new", label: "AI Lead Scraping", icon: Bot },
    { href: "/templates", label: "Templates", icon: Document },
  ];

  const managementNav = [
    { href: "/staffs", label: "Staffs", icon: UserAdmin },
    { href: "/promotions", label: "Promotions", icon: Gift },
    { href: "/referrals", label: "Referrals", icon: Connect },
    { href: "/method-of-contact", label: "Method Of Contact", icon: Phone },
    { href: "/lead-status", label: "Lead Status", icon: Task },
    { href: "/permissions", label: "Permissions", icon: Security },
    { href: "/roles", label: "Roles", icon: UserRole },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const NavItem = ({ item }: { item: any }) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    return (
      <li>
        <Link 
          href={item.href}
          className={`flex items-center gap-3 px-3 py-2 text-sm transition-all group ${
            active 
              ? "bg-primary/10 text-primary font-semibold border-r-2 border-primary" 
              : "text-muted-foreground font-medium hover:text-foreground hover:bg-accent"
          }`}
        >
          <Icon className={`h-4 w-4 transition-colors ${active ? "text-primary" : "group-hover:text-primary"}`} />
          {item.label}
        </Link>
      </li>
    );
  };

  return (
    <aside className="w-64 flex-col border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:flex h-full min-h-screen sticky top-0 transition-all duration-300">
      <div className="h-14 flex items-center px-6 border-b border-border shrink-0">
        <Link href="/dashboard" className="font-bold text-xl text-primary flex items-center gap-2 group">
          <div className="w-7 h-7 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-sm shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">L</div>
          <span className="tracking-tight">LeadGen<span className="text-foreground">Pro</span></span>
        </Link>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="grid gap-1 px-3">
          {mainNav.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
          
          <li className="mt-4 mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Management
          </li>
          
          {managementNav.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </ul>
      </nav>

      <div className="mt-auto p-4 border-t border-border">
        <Link 
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 text-sm transition-all group ${
            isActive("/settings")
              ? "bg-primary/10 text-primary font-semibold border-r-2 border-primary"
              : "text-muted-foreground font-medium hover:text-foreground hover:bg-accent"
          }`}
        >
          <Settings className={`h-4 w-4 transition-colors ${isActive("/settings") ? "text-primary" : "group-hover:text-primary"}`} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
