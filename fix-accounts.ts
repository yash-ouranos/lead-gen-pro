import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const credentialsUser = await prisma.user.findUnique({ where: { email: 'yashkevadiya46@gmail.com' } });
  const googleUser = await prisma.user.findUnique({ where: { email: 'yash.kevadiya@ouranostech.com' } });
  
  if (credentialsUser && googleUser) {
    const account = await prisma.account.findFirst({ where: { userId: googleUser.id } });
    if (account) {
      await prisma.account.update({
        where: { id: account.id },
        data: { userId: credentialsUser.id }
      });
      console.log("Moved account to credentials user!");
    } else {
      console.log("Account not found on google user");
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
