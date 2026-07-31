"use server";

import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { prisma } from"@/lib/prisma";
import { ApifyClient } from"apify-client";

export async function createCampaign(formData: FormData) {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 return { error:"Unauthorized"};
 }

 const user = await prisma.user.findUnique({
 where: { id: session.user.tenantId },
 });

 if (!user?.apifyApiKey) {
 return { error:"Apify API key is missing. Please add it in Settings."};
 }

 const niche = formData.get("niche") as string;
 const country = formData.get("country") as string;
 const state = formData.get("state") as string;
 const city = formData.get("city") as string;
 const maxLeads = parseInt((formData.get("maxLeads") as string) || "5", 10);

 const location =`${city}, ${state}, ${country}`;
 const searchQuery =`${niche} in ${location}`;

 const campaign = await prisma.campaign.create({
 data: {
 userId: user.id,
 location,
 niche,
 status:"SCRAPING",
 },
 });

 // Fire and forget the scraping process
 runScrapingJob(campaign.id, searchQuery, user, maxLeads).catch(console.error);

 return { success: true, campaignId: campaign.id };
}

async function findEmail(website: string | null, hunterKey?: string | null, apolloKey?: string | null): Promise<string | null> {
 if (!website) return null;
 
 try {
 const url = new URL(website);
 const domain = url.hostname.replace(/^www\./,'');

 // 1. Try Hunter.io
 if (hunterKey) {
 try {
 const response = await fetch(`https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${hunterKey}`);
 if (response.ok) {
 const data = await response.json();
 if (data?.data?.emails?.length > 0) {
 return data.data.emails[0].value;
 }
 }
 } catch (err) {
 console.error("Hunter.io error:", err);
 }
 }

 // 2. Fallback to Apollo.io
 if (apolloKey) {
 try {
 const response = await fetch(`https://api.apollo.io/v1/organizations/enrich?domain=${domain}`, {
 method:'GET',
 headers: {
'Cache-Control':'no-cache',
'Content-Type':'application/json',
'X-Api-Key': apolloKey
 }
 });
 if (response.ok) {
 const data = await response.json();
 if (data?.organization?.primary_email) {
 return data.organization.primary_email;
 }
 }
 } catch (err) {
 console.error("Apollo.io error:", err);
 }
 }

 // 3. Ultimate Fallback: Scrape website homepage directly
 try {
 const response = await fetch(website, {
 method:'GET',
 headers: {
'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
 },
 signal: AbortSignal.timeout(5000)
 });
 if (response.ok) {
 const text = await response.text();
 const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
 if (emails) {
 const validEmails = [...new Set(emails)].filter(e => 
 !e.toLowerCase().endsWith('.png') && 
 !e.toLowerCase().endsWith('.jpg') && 
 !e.toLowerCase().endsWith('.jpeg') && 
 !e.toLowerCase().endsWith('.webp') && 
 !e.toLowerCase().endsWith('.gif') && 
 !e.includes('@100') &&
 !e.includes('sentry')
 );
 if (validEmails.length > 0) {
 return validEmails[0]; // Return the first valid email found!
 }
 }
 }
    } catch (err: any) {
      if (err.name !== 'TimeoutError' && err.code !== 'ENOTFOUND' && err.cause?.code !== 'ENOTFOUND') {
        console.error("Website scraping error:", err);
      }
    }
  } catch (err) {
 // Ignore URL parsing errors
 }
 return null;
}

async function runScrapingJob(campaignId: string, searchQuery: string, user: any, maxLeads: number) {
  const client = new ApifyClient({ token: user.apifyApiKey });

  try {
    // 1. Run Google Maps Scraper (apify/google-maps-extractor is a popular one)
    const run = await client.actor("compass/crawler-google-places").call({
      searchStringsArray: [searchQuery],
      maxCrawledPlaces: maxLeads, // Configurable limit
      language: "en",
    });

 const { items } = await client.dataset(run.defaultDatasetId).listItems();

 // Ensure"Google Map"promotion exists
 let promotion = await prisma.promotion.findFirst({
 where: { userId: user.id, name:"Google Map"}
 });
 if (!promotion) {
 promotion = await prisma.promotion.create({
 data: { userId: user.id, name:"Google Map"}
 });
 }

 // Ensure referral exists for the user
 const referralName = user.name || user.email ||"System";
 let referral = await prisma.referral.findFirst({
 where: { userId: user.id, name: referralName, promotionId: promotion.id }
 });
 if (!referral) {
 referral = await prisma.referral.create({
 data: { userId: user.id, name: referralName, promotionId: promotion.id }
 });
 }

 // 2. Save results to DB
 for (const item of items) {
 // Basic mapping from Google Maps Extractor output
 const businessName = (item.title as string) ||"Unknown Business";
 const website = (item.website as string) || null;
 const phone = ((item.phone || item.phoneUnformatted) as string) || null;
 const address = ((item.address || item.street) as string) || null;
 const rating = (item.totalScore as number) || null;
 const reviewCount = (item.reviewsCount as number) || null;
 const mapUrl = (item.url as string) || null;

 // Deduplication check
 const existingLead = await prisma.lead.findFirst({
 where: {
 businessName,
 campaign: { userId: user.id }
 }
 });

 if (existingLead) {
 continue; // Skip duplicates
 }

 const email = await findEmail(website, user.hunterApiKey, user.apolloApiKey);

 await prisma.lead.create({
 data: {
        userId: user.id,
        campaignId,
        businessName,
        leadName: businessName,
        email,
 website,
 phone,
 address,
 mapUrl,
 rating,
 reviewCount,
 status: "NEW",
 isAiLead: true,
 promotions: {
 connect: { id: promotion.id }
 },
 referralId: referral.id,
 activities: {
 create: {
 type:"CREATED",
 description:"Lead generated via web scraping campaign."
 }
 }
 },
 });
 }

 await prisma.campaign.update({
 where: { id: campaignId },
 data: { status:"COMPLETED"},
 });

 } catch (error) {
 console.error("Scraping failed:", error);
 await prisma.campaign.update({
 where: { id: campaignId },
 data: { status:"FAILED"},
 });
 }
}
