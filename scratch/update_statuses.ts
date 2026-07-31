import { prisma } from '../lib/prisma';

async function main() {
  const adminUser = await prisma.user.findFirst();
  if (!adminUser) return;
  
  // Remove OPEN and ENGAGED
  await prisma.leadStatus.deleteMany({
    where: { name: { in: ['OPEN', 'ENGAGED'] } }
  });

  const statusesToAdd = [
    'Attempted to Contact',
    'Contact in future',
    'Junk Lead',
    'Lost Lead',
    'Not Contacted',
    'Not Qualified'
  ];

  for (const s of statusesToAdd) {
    const exists = await prisma.leadStatus.findFirst({ where: { name: s } });
    if (!exists) {
      await prisma.leadStatus.create({
        data: {
          name: s,
          status: 'Active',
          userId: adminUser.id
        }
      });
    }
  }

  console.log('Statuses updated');
}

main().finally(() => prisma.$disconnect());
