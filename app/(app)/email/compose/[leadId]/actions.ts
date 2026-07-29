"use server";

import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { prisma } from"@/lib/prisma";
import { google } from"googleapis";

export async function sendEmail(leadId: string, subject: string, body: string) {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id || !session?.user?.email) return { error:"Unauthorized"};

 const lead = await prisma.lead.findUnique({ where: { id: leadId } });
 if (!lead || !lead.email) return { error:"Lead not found or has no email"};

 const account = await prisma.account.findFirst({
 where: { userId: session.user.tenantId, provider:"google"}
 });

 if (!account || !account.refresh_token) {
 return { error:"No Google account connected for sending emails. Please log out and log back in."};
 }

 try {
 const auth = new google.auth.OAuth2(
 process.env.GOOGLE_CLIENT_ID,
 process.env.GOOGLE_CLIENT_SECRET
 );
 auth.setCredentials({ refresh_token: account.refresh_token });

 const gmail = google.gmail({ version:"v1", auth });

 // Create the EmailLog first to get its ID for the tracking pixel
 const emailLog = await prisma.emailLog.create({
 data: {
 leadId,
 subject,
 body,
 }
 });

 const trackingPixelUrl =`${process.env.NEXTAUTH_URL ||'http://localhost:3000'}/api/track/${emailLog.id}.png`;
 
 // We already have HTML from CKEditor, just append tracking pixel
 const htmlBody = body +`<br><br><img src="${trackingPixelUrl}"width="1"height="1"alt=""/>`;

 // Construct raw email RFC 2822 formatted string
 const messageParts = [
`From: ${session.user.email}`,
`To: ${lead.email}`,
`Subject: =?utf-8?B?${Buffer.from(subject).toString("base64")}?=`,
"MIME-Version: 1.0",
"Content-Type: text/html; charset=utf-8",
"",
 htmlBody,
 ];
 const message = messageParts.join("\n");
 const encodedMessage = Buffer.from(message)
 .toString("base64")
 .replace(/\+/g,"-")
 .replace(/\//g,"_")
 .replace(/=+$/,"");

 await gmail.users.messages.send({
 userId:"me",
 requestBody: {
 raw: encodedMessage,
 },
 });

 const activitiesToCreate = [
 {
 type:"EMAIL_SENT",
 description:`Email sent:"${subject}"`
 }
 ];

 if (lead.status !=="CONTACTED") {
 activitiesToCreate.push({
 type:"STATUS_CHANGE",
 description:`Status changed from ${lead.status} to CONTACTED`
 });
 }

 await prisma.lead.update({
 where: { id: leadId },
 data: { 
 status:"CONTACTED",
 activities: {
 create: activitiesToCreate
 }
 }
 });

 return { success: true };
 } catch (error: any) {
 console.error("Email send error:", error);
 return { error: error.message ||"Failed to send email"};
 }
}
