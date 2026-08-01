const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const logs = await prisma.emailLog.findMany({
    orderBy: { sentAt: 'desc' },
    take: 10,
    select: { id: true, type: true, subject: true, threadId: true, lead: { select: { email: true } } }
  });
  console.log(JSON.stringify(logs, null, 2));
}
main().catch(e => console.error(e)).finally(() => process.exit(0));
