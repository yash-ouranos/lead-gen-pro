import { prisma } from './lib/prisma.ts';

async function main() {
  const user = await prisma.user.findFirst();
  
  if (!user) {
    console.error("No user found in database.");
    return;
  }

  const template = await prisma.emailTemplate.create({
    data: {
      userId: user.id,
      name: "Initial Outreach - Value Proposition",
      subject: "Quick question about {businessName}'s digital presence",
      body: `
<p>Hi there,</p>
<p>I was doing some research on businesses in <strong>{location}</strong> and came across <strong>{businessName}</strong>. I love what you guys are doing in the <em>{niche}</em> space!</p>
<p>However, while taking a look at <strong><a href="{website}">{website}</a></strong>, I noticed a couple of areas where you might be losing potential customers. We specialize in helping businesses like yours plug those leaks and capture more leads.</p>
<p>Here is what we typically focus on:</p>
<ul>
    <li>Improving conversion rates on your main landing pages</li>
    <li>Setting up automated follow-ups so no lead falls through the cracks</li>
    <li>Enhancing your local SEO visibility in {location}</li>
</ul>
<p>Would you be open to a quick 10-minute chat next week to see if we'd be a good fit to help you grow?</p>
<p>Best regards,<br>
Your Name</p>
      `
    }
  });

  console.log("Template created:", template.name);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
