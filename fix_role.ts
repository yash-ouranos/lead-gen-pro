import { prisma } from './lib/prisma';

async function main() {
  const roles = await prisma.role.findMany();
  for (const role of roles) {
    if (!role.permissions.includes('MANAGE_LEADS') && !role.permissions.includes('ALL')) {
      await prisma.role.update({
        where: { id: role.id },
        data: {
          permissions: [...role.permissions, 'MANAGE_LEADS']
        }
      });
      console.log(`Added MANAGE_LEADS to role ${role.name}`);
    }
  }
}
main().finally(() => prisma.$disconnect());
