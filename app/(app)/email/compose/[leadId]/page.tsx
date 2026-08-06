import { notFound, redirect } from"next/navigation";
import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { prisma } from"@/lib/prisma";
import ComposeForm from"./ComposeForm";


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

 const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "google" }
  });
  const hasGoogleAccount = !!account;

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


  return (
    <div className="w-full h-full flex flex-col lg:flex-row bg-card animate-in fade-in duration-500 overflow-y-auto overflow-x-hidden">
      <div className="flex-1 flex flex-col border-r border-border">
        <div className="px-6 py-4 md:px-8 md:py-6 border-b border-border bg-white shadow-sm shrink-0">
          <h2 className="text-xl font-bold text-gray-900">{lead.businessName || lead.leadName}</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-600">
            {lead.name && (
              <div className="flex items-center gap-1.5">
                <span className="font-medium">Contact:</span> {lead.name}
              </div>
            )}
            {lead.email && (
              <div className="flex items-center gap-1.5">
                <span className="font-medium">Email:</span> {lead.email}
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-1.5">
                <span className="font-medium">Phone:</span> {lead.phone}
              </div>
            )}
            {lead.address && (
              <div className="flex items-center gap-1.5">
                <span className="font-medium">Address:</span> {lead.address}
              </div>
            )}
            {lead.website && (
              <div className="flex items-center gap-1.5 text-blue-600 hover:underline">
                <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer">
                  {lead.website}
                </a>
              </div>
            )}
          </div>
        </div>
        <ComposeForm 
          leadId={leadId} 
          leadData={{ businessName: lead.businessName, niche, location, website: lead.website || "", email: lead.email || "No email" }}
          templates={templates}
          initialSubject={initialSubject} 
          initialBody={initialBody} 
          hasGoogleAccount={hasGoogleAccount}
          userId={session.user.id}
        />

      </div>

    </div>
  );
}
