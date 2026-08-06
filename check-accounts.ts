import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const accounts = await prisma.account.findMany({
    include: { user: true }
  });
  console.log('--- ACCOUNTS ---');
  accounts.forEach(a => {
    console.log(`User: ${a.user.email} (ID: ${a.userId})`);
    console.log(`  Provider: ${a.provider}`);
    console.log(`  AccessToken: ${!!a.access_token}`);
    console.log(`  RefreshToken: ${!!a.refresh_token}`);
  });
  
  const users = await prisma.user.findMany();
  console.log('--- USERS ---');
  users.forEach(u => {
    console.log(`User: ${u.email} (ID: ${u.id})`);
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
