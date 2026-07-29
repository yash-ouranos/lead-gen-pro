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
 userId: session.user.tenantId
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
 select: { openCount: true, openedAt: true, sentAt: true }
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

 return (
 <div className="w-full space-y-6">
  <LeadsViewToggle leads={leads} />
 </div>
 );
}
