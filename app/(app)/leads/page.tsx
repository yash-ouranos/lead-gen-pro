import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { prisma } from"@/lib/prisma";
import { redirect } from"next/navigation";

import LeadsViewToggle from"@/app/components/LeadsViewToggle";

export default async function LeadsPage() {
 const session = await getServerSession(authOptions);

 if (!session?.user?.id) {
 redirect("/login");
 }

 // Fetch all leads for this user
  const leads = await prisma.lead.findMany({
    where: {
      userId: session.user.tenantId,
      isAiLead: false
    },
    orderBy: [
 { aiScore:"desc"},
 { createdAt:"desc"}
 ],
 include: {
 campaign: {
 select: { location: true, niche: true }
 },
  emailLogs: {
    orderBy: { sentAt: 'desc' }
  },
 activities: {
 include: { user: { select: { name: true } } },
 orderBy: { createdAt:'desc'}
 },
 staff: true,
 promotions: true,
 referral: true
 }
 });

  const templates = await prisma.emailTemplate.findMany({
    where: { userId: session.user.tenantId },
    orderBy: { createdAt: 'desc' }
  });

  return (
  <div className="w-full h-full flex flex-col">
   <LeadsViewToggle leads={leads} templates={templates} />
  </div>
  );
}
