import { prisma } from './lib/prisma';
import { AVAILABLE_PERMISSIONS } from './lib/permissions';

async function main() {
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    const existingPerms = await prisma.permission.findMany({
      where: { userId: user.id }
    });
    
    const validIds = new Set(AVAILABLE_PERMISSIONS.map(p => p.id));
    const existingValues = new Set(existingPerms.map(p => p.value));
    
    // Delete stale permissions
    const stalePerms = existingPerms.filter(p => !validIds.has(p.value));
    if (stalePerms.length > 0) {
      console.log(`Deleting ${stalePerms.length} stale permissions for user ${user.id}`);
      await prisma.permission.deleteMany({
        where: {
          id: { in: stalePerms.map(p => p.id) }
        }
      });
    }

    const missingPerms = AVAILABLE_PERMISSIONS.filter(p => !existingValues.has(p.id));
    
    if (missingPerms.length > 0) {
      console.log(`Adding ${missingPerms.length} missing permissions for user ${user.id}`);
      await prisma.permission.createMany({
        data: missingPerms.map(p => ({
          userId: user.id,
          name: p.label,
          value: p.id,
          status: 'Active'
        }))
      });
    }
  }
  
  console.log('Permissions synced successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
