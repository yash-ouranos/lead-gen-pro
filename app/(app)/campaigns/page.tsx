import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Add } from "@carbon/icons-react";

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) return null;

  const campaigns = await prisma.campaign.findMany({
    where: { userId: session.user.tenantId },
    include: {
      _count: {
        select: { leads: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="w-full h-full flex flex-col bg-card animate-in fade-in duration-500 overflow-y-auto">
      <div className="flex-none p-6 md:p-8 border-b border-border flex justify-between items-center bg-card sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Lead Scraping</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your AI lead scraping campaigns.</p>
        </div>
        <Link 
          href="/campaigns/new"
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Add className="w-4 h-4 mr-2" />
          Launch Scraping Campaign
        </Link>
      </div>

      <div className="flex-1 p-6 md:p-8">
        {campaigns.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 border border-border">
            <h3 className="text-lg font-medium text-foreground mb-2">No Campaigns Found</h3>
            <p className="text-muted-foreground text-sm mb-6">You haven't launched any AI lead scraping campaigns yet.</p>
            <Link 
              href="/campaigns/new"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Add className="w-4 h-4 mr-2" />
              Launch Scraping Campaign
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Niche / Keywords</th>
                    <th className="px-6 py-4 font-medium">Location</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Leads Found</th>
                    <th className="px-6 py-4 font-medium">Launched</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{campaign.niche}</td>
                      <td className="px-6 py-4 text-muted-foreground">{campaign.location}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border ${
                          campaign.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                          campaign.status === 'FAILED' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                          'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">{campaign._count.leads}</td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(campaign.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
