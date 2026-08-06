import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.lead.updateMany({
    where: { status: 'CONTACTED' },
    data: { status: 'EMAIL_SENT' }
  })
  console.log(`Updated ${result.count} leads from CONTACTED to EMAIL_SENT`)

  const statusResult = await prisma.leadStatus.updateMany({
    where: { name: 'CONTACTED' },
    data: { name: 'EMAIL_SENT' }
  })
  console.log(`Updated ${statusResult.count} lead statuses from CONTACTED to EMAIL_SENT`)
  
  const statusResult2 = await prisma.leadStatus.updateMany({
    where: { name: 'Contacted' },
    data: { name: 'EMAIL_SENT' }
  })
  console.log(`Updated ${statusResult2.count} lead statuses from Contacted to EMAIL_SENT`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
