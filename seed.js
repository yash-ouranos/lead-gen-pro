const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log("No users found to seed.");
    return;
  }

  const defaultMethodOfContacts = ["Email", "Phone", "WhatsApp"];
  const defaultLeadStatuses = [
    "NEW",
    "OPEN",
    "CONTACTED",
    "ENGAGED",
    "MEETING_BOOKED",
    "CLOSED_WON",
    "HOLD",
    "CLOSED_LOST",
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
