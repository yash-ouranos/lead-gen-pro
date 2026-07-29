"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "@carbon/icons-react";

export default function HeaderTitle() {
  const pathname = usePathname();
  const router = useRouter();

  let title = "";
  let subtitle = "";
  let showBackButton = false;

  if (pathname === "/dashboard") {
    title = "Dashboard";
    subtitle = "Overview of your leads and campaigns.";
  } else if (pathname === "/leads") {
    title = "Leads";
    subtitle = "Manage all your generated and manually added leads.";
  } else if (pathname.startsWith("/leads/") && pathname.endsWith("/edit")) {
    title = "Edit Lead";
    subtitle = "Update the details for this lead.";
    showBackButton = true;
  } else if (pathname === "/leads/new") {
    title = "Create New Lead";
    subtitle = "Add a new lead to your CRM.";
    showBackButton = true;
  } else if (pathname === "/campaigns/new") {
    title = "AI Lead Scraping";
    subtitle = "Create a new AI-driven campaign.";
  } else if (pathname.startsWith("/email/compose")) {
    title = "Compose Email";
    subtitle = "Review and send an email.";
    showBackButton = true;
  } else if (pathname === "/templates") {
    title = "Templates";
    subtitle = "Manage your email templates.";
  } else if (pathname === "/staffs") {
    title = "Staffs";
    subtitle = "Manage your team members and staff.";
  } else if (pathname === "/staffs/new") {
    title = "Create New Staff";
    subtitle = "Add a new staff member.";
    showBackButton = true;
  } else if (pathname.startsWith("/staffs/")) {
    title = "Edit Staff";
    subtitle = "Update staff details.";
    showBackButton = true;
  } else if (pathname === "/promotions") {
    title = "Promotions";
    subtitle = "Manage your active promotions and offers.";
  } else if (pathname === "/promotions/new") {
    title = "Create New Promotion";
    subtitle = "Add a new promotion.";
    showBackButton = true;
  } else if (pathname.startsWith("/promotions/")) {
    title = "Edit Promotion";
    subtitle = "Update promotion details.";
    showBackButton = true;
  } else if (pathname === "/referrals") {
    title = "Referrals";
    subtitle = "Track and manage customer referrals.";
  } else if (pathname === "/referrals/new") {
    title = "Create New Referral";
    subtitle = "Add a new referral.";
    showBackButton = true;
  } else if (pathname.startsWith("/referrals/")) {
    title = "Edit Referral";
    subtitle = "Update referral details.";
    showBackButton = true;
  } else if (pathname === "/roles") {
    title = "Roles";
    subtitle = "Manage access control and roles.";
  } else if (pathname === "/roles/new") {
    title = "Create New Role";
    subtitle = "Add a new role.";
    showBackButton = true;
  } else if (pathname.startsWith("/roles/")) {
    title = "Edit Role";
    subtitle = "Update role details.";
    showBackButton = true;
  } else if (pathname === "/lead-status") {
    title = "Lead Status";
    subtitle = "Manage lead statuses available for your leads.";
  } else if (pathname === "/lead-status/new") {
    title = "Create Lead Status";
    subtitle = "Add a new lead status to the system.";
    showBackButton = true;
  } else if (pathname.startsWith("/lead-status/")) {
    title = "Edit Lead Status";
    subtitle = "Modify an existing lead status.";
    showBackButton = true;
  } else if (pathname === "/method-of-contact") {
    title = "Method Of Contact";
    subtitle = "Manage methods of contact available for your leads.";
  } else if (pathname === "/method-of-contact/new") {
    title = "Create Method Of Contact";
    subtitle = "Add a new method of contact to the system.";
    showBackButton = true;
  } else if (pathname.startsWith("/method-of-contact/")) {
    title = "Edit Method Of Contact";
    subtitle = "Modify an existing method of contact.";
    showBackButton = true;
  } else if (pathname === "/permissions") {
    title = "Permissions";
    subtitle = "Manage access permissions for the system.";
  } else if (pathname === "/permissions/new") {
    title = "Create Permission";
    subtitle = "Add a new permission to the system.";
    showBackButton = true;
  } else if (pathname.startsWith("/permissions/")) {
    title = "Edit Permission";
    subtitle = "Modify an existing permission.";
    showBackButton = true;
  } else if (pathname === "/settings") {
    title = "Settings";
    subtitle = "Configure your account and system settings.";
  }

  if (!title) return <div className="flex-1 md:flex hidden" />;

  return (
    <div className="flex-1 md:flex items-center gap-3 hidden px-3">
      {showBackButton && (
        <button 
          onClick={() => router.back()} 
          className="p-1.5 -ml-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <div className="flex flex-col justify-center">
        <h1 className="text-xl font-bold text-foreground leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>}
      </div>
    </div>
  );
}
