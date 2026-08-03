import { prisma } from './lib/prisma';
prisma.emailLog.findMany().then(r => console.log(JSON.stringify(r, null, 2))).finally(() => prisma.$disconnect());
