import { notFound, redirect } from"next/navigation";
import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { prisma } from"@/lib/prisma";
import ComposeForm from"./ComposeForm";
import ActivityTimeline from"@/app/components/ActivityTimeline";
import EmailHistory from"@/app/components/EmailHistory";

export default async function ComposeEmailPage({ params }: { params: { leadId: string } }) {
 const { leadId } = await params;
 
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 redirect("/api/auth/signin");
 }

 const lead = await prisma.lead.findUnique({
 where: { id: leadId },
 include: { 
 campaign: true,
 activities: {
 orderBy: { createdAt:'desc'}
 },
 emailLogs: {
 orderBy: { sentAt:'desc'}
 }
 }
 });

 if (!lead) {
 notFound();
 }

 const templates = await prisma.emailTemplate.findMany({
 where: { userId: session.user.tenantId },
 orderBy: { createdAt:'desc'}
 });

 const businessName = lead.businessName;
 const niche = lead.campaign?.niche ||"your industry";
 const location = lead.campaign?.location ||"your area";

 const initialSubject =`Quick question about ${businessName}`;
 const initialBody =`Hi there,

I noticed ${businessName} on Google Maps and wanted to reach out. 

We specialize in helping businesses in ${niche} to improve their digital presence and attract more customers in ${location}. 

Would you be open to a quick 5-minute chat next week to see if we'd be a good fit to help you grow?

Best regards,
[Your Name]`;

 const emailsSent = lead.activities.filter(a => a.type ==="EMAIL_SENT").length;
 const emailsReceived = lead.activities.filter(a => a.type ==="EMAIL_RECEIVED").length;

  return (
    <div className="w-full h-full flex flex-col lg:flex-row bg-card animate-in fade-in duration-500 overflow-y-auto overflow-x-hidden">
      <div className="flex-1 flex flex-col border-r border-border">
        <ComposeForm 
          leadId={leadId} 
          leadData={{ businessName: lead.businessName, niche, location, website: lead.website || "", email: lead.email || "No email" }}
          templates={templates}
          initialSubject={initialSubject} 
          initialBody={initialBody} 
        />
        <div className="px-6 md:px-8 pb-8">
          <EmailHistory emailLogs={lead.emailLogs || []} />
        </div>
      </div>
      <div className="w-full lg:w-96 flex flex-col border-l border-border bg-muted/20">
        <div className="p-6 sticky top-0">
          <div className="flex gap-4 mb-8">
            <div className="flex-1 bg-purple-50 p-3 border border-purple-100 text-center">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Sent</p>
              <p className="text-2xl font-bold text-purple-700">{emailsSent}</p>
            </div>
            <div className="flex-1 bg-teal-50 p-3 border border-teal-100 text-center">
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Received</p>
              <p className="text-2xl font-bold text-teal-700">{emailsReceived}</p>
            </div>
          </div>
          <ActivityTimeline activities={lead.activities || []} />
        </div>
      </div>
    </div>
  );
}
