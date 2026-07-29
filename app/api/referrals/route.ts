import { NextResponse } from"next/server";
import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { prisma } from"@/lib/prisma";

export async function GET(request: Request) {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 const { searchParams } = new URL(request.url);
 const promotionId = searchParams.get("promotionId");

 try {
 const whereClause: any = { userId: session.user.tenantId };
 if (promotionId) {
 whereClause.promotionId = promotionId;
 }

 const referrals = await prisma.referral.findMany({
 where: whereClause,
 include: {
 promotion: {
 select: { name: true }
 }
 },
 orderBy: { createdAt:"desc"},
 });
 return NextResponse.json(referrals);
 } catch (error) {
 return NextResponse.json({ error:"Failed to fetch referrals"}, { status: 500 });
 }
}

export async function POST(request: Request) {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 try {
 const data = await request.json();
 const referral = await prisma.referral.create({
 data: {
 name: data.name,
 email: data.email,
 phone: data.phone,
 promotionId: data.promotionId,
 status: data.status ||"Active",
 userId: session.user.tenantId,
 },
 include: {
 promotion: {
 select: { name: true }
 }
 }
 });
 return NextResponse.json(referral);
 } catch (error) {
 return NextResponse.json({ error:"Failed to create referral"}, { status: 500 });
 }
}
