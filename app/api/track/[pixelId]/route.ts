import { NextResponse } from"next/server";
import { prisma } from"@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ pixelId: string }> }) {
 const resolvedParams = await params;
 // Extract pixelId which is the EmailLog ID
 // It comes in as"uuid.png", so we remove".png"
 const logId = resolvedParams.pixelId.replace(".png","");

 try {
 const emailLog = await prisma.emailLog.findUnique({ where: { id: logId } });
 if (emailLog) {
 await prisma.emailLog.update({
 where: { id: logId },
 data: {
 openCount: { increment: 1 },
 openedAt: new Date(),
 },
 });

 const lead = await prisma.lead.findUnique({ where: { id: emailLog.leadId } });
 
 if (lead) {
 const activitiesToCreate = [
 {
 type:"EMAIL_OPENED",
 description:`Email opened:"${emailLog.subject}"`
 }
 ];

 // If the lead was just CONTACTED or NEW, bump them to ENGAGED
 let newStatus = lead.status;
 if (lead.status ==="CONTACTED"|| lead.status ==="NEW") {
 newStatus ="ENGAGED";
 activitiesToCreate.push({
 type:"STATUS_CHANGE",
 description:`Status changed from ${lead.status} to ENGAGED`
 });
 }

 await prisma.lead.update({
 where: { id: lead.id },
 data: { 
 status: newStatus,
 activities: {
 create: activitiesToCreate
 }
 }
 });
 }
 }
 } catch (error) {
 console.error("Tracking pixel error:", error);
 }

 // Return a 1x1 transparent PNG
 const transparentPixel = Buffer.from(
"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
"base64"
 );

 return new NextResponse(transparentPixel, {
 headers: {
"Content-Type":"image/png",
"Cache-Control":"no-store, max-age=0",
 },
 });
}
