import { NextResponse } from"next/server";
import { getServerSession } from"next-auth/next";
import { authOptions } from"@/lib/auth";
import { prisma } from"@/lib/prisma";
import { google } from "googleapis";

function getMessageBody(payload: any): string {
  if (!payload) return "";
  
  if (payload.body && payload.body.data) {
    return Buffer.from(payload.body.data, "base64url").toString("utf-8");
  }
  
  if (payload.parts) {
    let htmlPart: any = null;
    let textPart: any = null;

    const findParts = (parts: any[]) => {
      for (const part of parts) {
        if (part.mimeType === "text/html" && part.body && part.body.data) {
          htmlPart = part;
        } else if (part.mimeType === "text/plain" && part.body && part.body.data) {
          textPart = part;
        } else if (part.parts) {
          findParts(part.parts);
        }
      }
    };

    findParts(payload.parts);

    if (htmlPart) {
      return Buffer.from(htmlPart.body.data, "base64url").toString("utf-8");
    } else if (textPart) {
      return Buffer.from(textPart.body.data, "base64url").toString("utf-8");
    }
  }
  
  return "";
}

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
 const oauth2Client = new google.auth.OAuth2(
   process.env.GOOGLE_CLIENT_ID,
   process.env.GOOGLE_CLIENT_SECRET
 );
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
 q:"in:inbox",
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

    // Fetch message details (full format to get the body)
    const msgDetails = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
      format: "full",
    });

 const headers = msgDetails.data.payload?.headers || [];
 const fromHeader = headers.find((h) => h.name?.toLowerCase() === "from")?.value || "";
 const subject = headers.find((h) => h.name?.toLowerCase() === "subject")?.value || "";
 const messageId = headers.find((h) => h.name?.toLowerCase() === "message-id")?.value || "";
 const threadId = msgDetails.data.threadId || null;
 
 // Extract email address from format"Name <email@domain.com>"or"email@domain.com"
 const emailMatch = fromHeader.match(/<([^>]+)>/);
 const senderEmail = emailMatch ? emailMatch[1].toLowerCase() : fromHeader.trim().toLowerCase();

  if (!senderEmail) continue;

  // 1. Try to find the lead by checking if we already have an EmailLog for this thread
  let matchingLeads: any[] = [];
  if (threadId) {
    const existingLog = await prisma.emailLog.findFirst({
      where: { threadId: threadId },
      include: { lead: true }
    });
    
    // Make sure the lead belongs to the current user's tenant
    if (existingLog && existingLog.lead) {
      let isOwner = existingLog.lead.userId === session.user.tenantId;
      if (!isOwner && existingLog.lead.campaignId) {
        const leadCampaign = await prisma.campaign.findUnique({
          where: { id: existingLog.lead.campaignId }
        });
        isOwner = leadCampaign?.userId === session.user.tenantId;
      }
      
      if (isOwner) {
        matchingLeads.push(existingLog.lead);
      }
    }
  }

  // 2. If no lead found by threadId, fallback to matching by sender email
  if (matchingLeads.length === 0) {
    matchingLeads = await prisma.lead.findMany({
      where: {
        email: { equals: senderEmail, mode: "insensitive" },
        OR: [
          { userId: session.user.tenantId },
          { campaign: { userId: session.user.tenantId } }
        ]
      },
    });
  }

  // To prevent processing the same lead multiple times if duplicates exist
  const processedLeadIds = new Set();

  for (const lead of matchingLeads) {
      if (processedLeadIds.has(lead.id)) continue;
      processedLeadIds.add(lead.id);
      // Extract the body
      let bodyText = getMessageBody(msgDetails.data.payload);
      if (!bodyText) {
        bodyText = msgDetails.data.snippet || "No content.";
      }

      // Record the reply activity
      const snippet = msgDetails.data.snippet ? ` - "${msgDetails.data.snippet}"` : "";
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          type: "EMAIL_RECEIVED",
          description: `[Msg:${msg.id}] Received reply: ${subject}${snippet}`,
        },
      });

      await prisma.emailLog.create({
        data: {
          leadId: lead.id,
          subject: subject,
          body: bodyText,
          type: "RECEIVED",
          messageId: messageId,
          threadId: threadId,
          sentAt: new Date(Number(msgDetails.data.internalDate || Date.now())),
        }
      });

 // Update lead status to CONTACTED if it's currently NEW or Not Contacted
 if (['NEW', 'Not Contacted'].includes(lead.status)) {
 await prisma.lead.update({
 where: { id: lead.id },
 data: { status: "CONTACTED" },
 });

 await prisma.leadActivity.create({
 data: {
 leadId: lead.id,
 userId: session.user.id,
 type: "NOTE_ADDED",
 description: `Status changed to CONTACTED due to incoming email reply.`,
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
