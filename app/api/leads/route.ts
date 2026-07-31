import { NextResponse } from"next/server";
import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { prisma } from"@/lib/prisma";

export async function POST(request: Request) {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 try {
 const data = await request.json();

 const lead = await prisma.lead.create({
 data: {
 userId: session.user.tenantId,
 leadName: data.leadName || null,
 leadType: data.leadType || [],
 promotions: data.promotionIds?.length > 0 ? {
 connect: data.promotionIds.map((id: string) => ({ id }))
 } : undefined,
 referralId: data.referralId || null,
 preferredMethodOfContact: data.preferredMethodOfContact || null,
 designation: data.designation || null,
 industry: data.industry || null,
 annualRevenue: data.annualRevenue || null,
 temperature: data.temperature || null,
 
 name: data.name || null,
 businessName: data.businessName ||"Unknown",
 phone: data.phone || null,
 email: data.email || null,
 website: data.website || null,
 assignStaffId: data.assignStaffId || null,
 followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
 status: data.status ||"NEW",
 
 streetNo: data.streetNo || null,
 city: data.city || null,
 state: data.state || null,
 country: data.country || null,
 pinCode: data.pinCode || null,
 products: data.products || [],
 services: data.services || [],
 
 remarks: data.remarks || null,
 },
 });

 // Create a lead activity for manual creation
 await prisma.leadActivity.create({
 data: {
 leadId: lead.id,
 type:"CREATED",
 description:"Lead created manually",
 }
 });

 return NextResponse.json(lead);
 } catch (error) {
 console.error("Error creating lead:", error);
 return NextResponse.json({ error:"Failed to create lead"}, { status: 500 });
 }
}
