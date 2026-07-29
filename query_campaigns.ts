import { prisma } from "./lib/prisma";

async function main() {
  const campaigns = await prisma.campaign.findMany();
  console.log(campaigns);
}

main().catch(console.error);
