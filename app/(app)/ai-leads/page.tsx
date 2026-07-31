import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AiLeadsTable from "@/app/components/AiLeadsTable";

export default async function AiLeadsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) return null;

  const aiLeads = await prisma.lead.findMany({
    where: { 
      userId: session.user.tenantId,
      isAiLead: true 
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
