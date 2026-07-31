"use client";

import { Menu } from "@carbon/icons-react";
import { useSidebar } from "@/app/contexts/SidebarContext";

export default function SidebarToggleButton() {
  const { toggleSidebar } = useSidebar();
  
  return (
    <button 
      onClick={toggleSidebar}
      className="p-2 -ml-2 rounded-md hover:bg-accent text-muted-foreground transition-colors mr-2 hidden md:block cursor-pointer"
      title="Toggle Sidebar"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
