import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import LeadsViewToggle from "@/app/components/LeadsViewToggle";
import ScoreLeadsButton from "@/app/components/ScoreLeadsButton";
import AutoRefresh from "@/app/components/AutoRefresh";
import ActiveCampaigns from "@/app/components/ActiveCampaigns";
import { UserFollow, ChartLine, UserSpeaker, UserSimulation, Add } from "@carbon/icons-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch campaigns for the user
  const campaigns = await prisma.campaign.findMany({
    where: { userId: session.user.tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { leads: true } },
    }
  });

  const isStaff = session.user.role?.name !== "ADMIN" && session.user.staffId;

  // Fetch all leads for this user (both manual and campaign-based)
  const leads = await prisma.lead.findMany({
    where: {
      AND: [
        {
          OR: [
            { userId: session.user.tenantId },
            { campaign: { userId: session.user.tenantId } }
          ]
        },
        isStaff ? { assignStaffId: session.user.staffId } : {}
      ]
    },
    orderBy: [
      { aiScore: "desc" },
      { createdAt: "desc" }
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
        orderBy: { createdAt: 'desc' }
      },
      staff: true
    }
  });

  const activeCampaigns = campaigns.filter(c => c.status !== "COMPLETED" && c.status !== "FAILED");

  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-500 pb-6">
      <AutoRefresh isActive={activeCampaigns.length > 0} />



      <ActiveCampaigns campaigns={activeCampaigns} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Open Leads */}
        <div className="bg-white border border-[#00B14F] p-4 flex items-center justify-between shadow-sm">
          <div className="w-14 h-14 bg-[#00B14F] flex items-center justify-center">
            <UserFollow className="w-8 h-8 text-white" />
          </div>
          <div className="flex flex-col items-end">
            <h3 className="text-xs text-muted-foreground font-medium">Open Leads</h3>
            <p className="text-xl font-bold text-foreground mt-0.5">{leads.filter(l => ['NEW', 'Not Contacted'].includes(l.status)).length}</p>
          </div>
        </div>

        {/* In Progress Deals */}
        <div className="bg-white border border-[#FF7A00] p-4 flex items-center justify-between shadow-sm">
          <div className="w-14 h-14 bg-[#FF7A00] flex items-center justify-center">
            <ChartLine className="w-8 h-8 text-white" />
          </div>
          <div className="flex flex-col items-end">
            <h3 className="text-xs text-muted-foreground font-medium">In Progress Deals</h3>
            <p className="text-xl font-bold text-foreground mt-0.5">{leads.filter(l => ['EMAIL_SENT', 'Attempted to Contact', 'Contact in future', 'MEETING_BOOKED'].includes(l.status)).length}</p>
          </div>
        </div>

        {/* Contacted Clients */}
        <div className="bg-white border border-[#B000F5] p-4 flex items-center justify-between shadow-sm">
          <div className="w-14 h-14 bg-[#B000F5] flex items-center justify-center">
            <UserSpeaker className="w-8 h-8 text-white" />
          </div>
          <div className="flex flex-col items-end">
            <h3 className="text-xs text-muted-foreground font-medium">Email Sent Clients</h3>
            <p className="text-xl font-bold text-foreground mt-0.5">{leads.filter(l => l.status === 'EMAIL_SENT').length}</p>
          </div>
        </div>

        {/* Hold */}
        <div className="bg-white border border-[#00A344] p-4 flex items-center justify-between shadow-sm">
          <div className="w-14 h-14 bg-[#00A344] flex items-center justify-center">
            <UserSimulation className="w-8 h-8 text-white" />
          </div>
          <div className="flex flex-col items-end">
            <h3 className="text-xs text-muted-foreground font-medium">Hold</h3>
            <p className="text-xl font-bold text-foreground mt-0.5">{leads.filter(l => l.status === 'HOLD').length}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 mt-8">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Leads</h2>
      </div>

      <div className="bg-card flex-1 flex flex-col overflow-hidden">
        <LeadsViewToggle leads={leads} variant="dashboard" />
      </div>
    </div>
  );
}
