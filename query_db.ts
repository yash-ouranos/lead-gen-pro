import { prisma } from "./lib/prisma";

async function main() {
  const campaigns = await prisma.campaign.findMany();
  console.log("Campaigns:", campaigns);

  const leads = await prisma.lead.findMany();
  console.log("Leads count:", leads.length);
  if (leads.length > 0) {
    console.log("Sample lead:", leads[0]);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
