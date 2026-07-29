"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dashboard, Gift, Group, Document, Settings, Phone, Task, UserMultiple, Bot, Connect, Security, UserRole, UserAdmin } from "@carbon/icons-react";
import { useSidebar } from "@/app/contexts/SidebarContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

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
          className={`flex items-center gap-3 py-2 rounded-md text-sm transition-all group overflow-hidden ${
            isCollapsed ? 'justify-center px-0 mx-auto w-10 h-10' : 'px-3'
          } ${
            active 
              ? "bg-primary/10 text-primary font-semibold" 
              : "text-muted-foreground font-medium hover:text-foreground hover:bg-accent"
          }`}
          title={isCollapsed ? item.label : undefined}
        >
          <Icon className={`h-4 w-4 shrink-0 transition-colors ${active ? "text-primary" : "group-hover:text-primary"}`} />
          {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
        </Link>
      </li>
    );
  };

  return (
    <aside className={`${isCollapsed ? 'w-[72px]' : 'w-64'} flex-col border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:flex h-full min-h-screen sticky top-0 transition-all duration-300`}>
      <div className={`h-14 flex items-center border-b border-border shrink-0 ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
        <Link href="/dashboard" className="font-bold text-xl flex items-center gap-2 group" title={isCollapsed ? "LeadGenPro" : undefined}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:shadow-lg transition-all group-hover:scale-105 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" /></svg>
          </div>
          {!isCollapsed && <span className="tracking-tight text-foreground whitespace-nowrap">LeadGen<span className="text-indigo-600">Pro</span></span>}
        </Link>
      </div>
      
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-hide">
        <ul className={`grid gap-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {mainNav.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
          
          <li className={`mt-4 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 transition-all ${
            isCollapsed ? 'opacity-0 h-0 m-0 overflow-hidden' : 'px-3'
          }`}>
            Management
          </li>
          
          {managementNav.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </ul>
      </nav>

      <div className={`mt-auto border-t border-border ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <Link 
          href="/settings"
          className={`flex items-center gap-3 py-2 rounded-md text-sm transition-all group overflow-hidden ${
            isCollapsed ? 'justify-center px-0 mx-auto w-10 h-10' : 'px-3'
          } ${
            isActive("/settings")
              ? "bg-primary/10 text-primary font-semibold"
              : "text-muted-foreground font-medium hover:text-foreground hover:bg-accent"
          }`}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings className={`h-4 w-4 shrink-0 transition-colors ${isActive("/settings") ? "text-primary" : "group-hover:text-primary"}`} />
          {!isCollapsed && <span className="whitespace-nowrap">Settings</span>}
        </Link>
      </div>
    </aside>
  );
}
