export const AVAILABLE_PERMISSIONS = [
  // Leads & Campaigns
  { id: "VIEW_LEADS", label: "View Leads" },
  { id: "MANAGE_LEADS", label: "Manage Leads" },
  { id: "ASSIGN_USER", label: "Assign User" },
  { id: "VIEW_AI_LEADS", label: "View AI Leads" },
  { id: "MANAGE_AI_LEADS", label: "Manage AI Leads" },
  { id: "RUN_AI_SCRAPING", label: "Run AI Scraping" },
  { id: "MANAGE_CAMPAIGNS", label: "Manage Campaigns" },
  
  // Communications
  { id: "SEND_EMAILS", label: "Send Emails" },
  { id: "MANAGE_TEMPLATES", label: "Manage Email Templates" },
  
  // Marketing
  { id: "MANAGE_PROMOTIONS", label: "Manage Promotions" },
  { id: "MANAGE_REFERRALS", label: "Manage Referrals" },
  
  // Administration
  { id: "MANAGE_STAFF", label: "Manage Staff" },
  { id: "MANAGE_ROLES", label: "Manage Roles" },
  { id: "MANAGE_PERMISSIONS", label: "Manage Permissions" },
  { id: "MANAGE_SETTINGS", label: "Manage Settings" },
  { id: "MANAGE_SYSTEM_DATA", label: "Manage System Data" },
  
  // Dashboard
  { id: "VIEW_DASHBOARD", label: "View Dashboard" },
];

/**
 * Check if a session user has a specific permission.
 * Admins always bypass checks.
 */
export function hasPermission(session: any, permissionId: string): boolean {
  if (!session?.user) return false;
  // Account owners (no staffId) are implicitly ADMINs and have all permissions
  if (!session.user.staffId) return true;
  
  if (session.user.role?.name === "ADMIN") return true;
  if (session.user.role?.permissions?.includes("ALL")) return true;
  return session.user.role?.permissions?.includes(permissionId) || false;
}

