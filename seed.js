const { prisma } = require('./lib/prisma');

async function main() {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log("No users found to seed.");
    return;
  }

  const defaultMethodOfContacts = ["Email", "Phone", "WhatsApp"];
  const defaultLeadStatuses = [
    // Top of Funnel
    "NEW",
    "OPEN",
    "QUALIFIED",
    "UNQUALIFIED",
    // Outreach
    "CONTACTED",
    "FOLLOW_UP",
    "NURTURE",
    // Engagement
    "ENGAGED",
    "MEETING_BOOKED",
    "DEMO_SCHEDULED",
    // Conversion
    "PROPOSAL_SENT",
    "NEGOTIATION",
    // Resolution
    "CLOSED_WON",
    "CLOSED_LOST",
    "HOLD",
    "BAD_TIMING",
    "REJECTED"
  ];

  let addedMoc = 0;
  let addedLs = 0;

  for (const user of users) {
    for (const moc of defaultMethodOfContacts) {
      const exists = await prisma.methodOfContact.findFirst({
        where: { userId: user.id, name: moc }
      });
      if (!exists) {
        await prisma.methodOfContact.create({
          data: { userId: user.id, name: moc, status: "Active" }
        });
        addedMoc++;
      }
    }

    for (const ls of defaultLeadStatuses) {
      const exists = await prisma.leadStatus.findFirst({
        where: { userId: user.id, name: ls }
      });
      if (!exists) {
        await prisma.leadStatus.create({
          data: { userId: user.id, name: ls, status: "Active" }
        });
        addedLs++;
      }
    }
  }

  console.log(`Seeding complete. Added ${addedMoc} Method of Contacts and ${addedLs} Lead Statuses across ${users.length} users.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
