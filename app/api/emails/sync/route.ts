import { NextResponse } from"next/server";
import { getServerSession } from"next-auth/next";
import { authOptions } from"@/lib/auth";
import { prisma } from"@/lib/prisma";
import { google } from"googleapis";

export async function POST(req: Request) {
 try {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 // Get the user's latest access token
 const account = await prisma.account.findFirst({
 where: {
 userId: session.user.tenantId,
 provider:"google",
 },
 });

 if (!account?.access_token) {
 return NextResponse.json(
 { error:"Google account not linked or missing access token. Please sign in again."},
 { status: 400 }
 );
 }

 // Initialize Gmail API client
 const oauth2Client = new google.auth.OAuth2();
 oauth2Client.setCredentials({
 access_token: account.access_token,
 refresh_token: account.refresh_token,
 });

 const gmail = google.gmail({ version:"v1", auth: oauth2Client });

 // Fetch the last 20 messages in the inbox that are not from the user
 let response;
 try {
 response = await gmail.users.messages.list({
 userId:"me",
 q:"in:inbox -from:me",
 maxResults: 20,
 });
 } catch (err: any) {
 console.error("Gmail API error:", err.message);
 if (err.message.includes("insufficient authentication scopes") || err.code === 403) {
 return NextResponse.json(
 { error:"Missing Gmail read permission. Please sign out and sign in again to grant permission."},
 { status: 403 }
 );
 }
 throw err;
 }

 const messages = response.data.messages || [];
 let syncedCount = 0;

 for (const msg of messages) {
 if (!msg.id) continue;

 // Check if we already synced this message
 const existingActivity = await prisma.leadActivity.findFirst({
 where: {
 description: { startsWith:`[Msg:${msg.id}]`},
 },
 });

 if (existingActivity) {
 continue; // Already processed
 }

 // Fetch message details
 const msgDetails = await gmail.users.messages.get({
 userId:"me",
 id: msg.id,
 format:"metadata",
 metadataHeaders: ["From","Subject"],
 });

 const headers = msgDetails.data.payload?.headers;
 const fromHeader = headers?.find((h) => h.name ==="From")?.value ||"";
 const subject = headers?.find((h) => h.name ==="Subject")?.value ||"No Subject";
 
 // Extract email address from format"Name <email@domain.com>"or"email@domain.com"
 const emailMatch = fromHeader.match(/<([^>]+)>/);
 const senderEmail = emailMatch ? emailMatch[1].toLowerCase() : fromHeader.trim().toLowerCase();

 if (!senderEmail) continue;

 // Find leads with this email for the current user
 const matchingLeads = await prisma.lead.findMany({
 where: {
 email: { equals: senderEmail, mode:"insensitive"},
 campaign: { userId: session.user.tenantId },
 },
 });

 for (const lead of matchingLeads) {
 // Record the reply activity
 const snippet = msgDetails.data.snippet ?`-"${msgDetails.data.snippet}"`:"";
 await prisma.leadActivity.create({
 data: {
 leadId: lead.id,
 type:"EMAIL_RECEIVED",
 description:`[Msg:${msg.id}] Received reply: ${subject}${snippet}`,
 },
 });

 // Update lead status to ENGAGED if it's currently NEW or CONTACTED
 if (lead.status ==="NEW"|| lead.status ==="CONTACTED") {
 await prisma.lead.update({
 where: { id: lead.id },
 data: { status:"ENGAGED"},
 });

 await prisma.leadActivity.create({
 data: {
 leadId: lead.id,
 type:"STATUS_CHANGE",
 description:`Status changed to ENGAGED due to incoming email reply.`,
 },
 });
 }
 
 syncedCount++;
 }
 }

 return NextResponse.json({ success: true, syncedCount });
 } catch (error: any) {
 console.error("Error syncing emails:", error);
 return NextResponse.json({ error: error.message ||"Failed to sync emails"}, { status: 500 });
 }
}
