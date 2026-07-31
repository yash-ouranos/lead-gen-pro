import { prisma } from '../lib/prisma'

async function main() {
  const user = await prisma.user.findFirst()

  if (!user) {
    console.error("No user found in the database. Please create a user first.")
    process.exit(1)
  }

  const userId = user.id

  const designations = [
    "CEO", 
    "CTO", 
    "CFO", 
    "Founder", 
    "Co-founder", 
    "Sales Employee", 
    "Tech Employee", 
    "Intern"
  ]

  const industries = [
    "Healthcare", 
    "Real Estate",
    "Technology",
    "Finance",
    "Education"
  ]

  console.log("Seeding designations...")
  for (const name of designations) {
    await prisma.designation.create({
      data: {
        name,
        status: "Active",
        userId
      }
    })
  }

  console.log("Seeding industries...")
  for (const name of industries) {
    await prisma.industry.create({
      data: {
        name,
        status: "Active",
        userId
      }
    })
  }

  console.log("Seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
