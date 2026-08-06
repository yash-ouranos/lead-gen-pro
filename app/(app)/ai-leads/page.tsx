import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AiLeadsTable from "@/app/components/AiLeadsTable";

export default async function AiLeadsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) return null;

  const { hasPermission } = await import("@/lib/permissions");
  if (!hasPermission(session, "VIEW_AI_LEADS")) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p>You do not have permission to view AI Leads.</p>
      </div>
    );
  }

  const isStaff = session.user.role?.name !== "ADMIN" && session.user.staffId;

  const aiLeads = await prisma.lead.findMany({
    where: { 
      userId: session.user.tenantId,
      isAiLead: true,
      ...(isStaff ? { assignStaffId: session.user.staffId } : {})
    },
    include: {
      campaign: {
        select: { location: true, niche: true }
      },
      emailLogs: {
        orderBy: { sentAt: 'desc' }
      },
      activities: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      },
      staff: true,
      promotions: true,
      referral: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const templates = await prisma.emailTemplate.findMany({
    where: { userId: session.user.tenantId },
    orderBy: { createdAt: 'desc' }
  });

  return <AiLeadsTable leads={aiLeads} templates={templates} />;
}
