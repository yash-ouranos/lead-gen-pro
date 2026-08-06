import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    include: { accounts: true }
  });

  console.log('--- USERS AND ACCOUNTS ---');
  for (const u of users) {
    console.log(`User ID: ${u.id}, Email: ${u.email}`);
    if (u.accounts.length === 0) {
      console.log(`  [No accounts linked]`);
    }
    for (const a of u.accounts) {
      console.log(`  -> Account: ${a.provider} (Has Access Token: ${!!a.access_token}, Has Refresh Token: ${!!a.refresh_token})`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
