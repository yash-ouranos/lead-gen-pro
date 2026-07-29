import { NextResponse } from"next/server";
import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { prisma } from"@/lib/prisma";

export async function GET() {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 try {
 const promotions = await prisma.promotion.findMany({
 where: { userId: session.user.tenantId },
 orderBy: { createdAt:"desc"},
 });
 return NextResponse.json(promotions);
 } catch (error) {
 return NextResponse.json({ error:"Failed to fetch promotions"}, { status: 500 });
 }
}

export async function POST(request: Request) {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 try {
 const data = await request.json();
 const promotion = await prisma.promotion.create({
 data: {
 name: data.name,
 status: data.status ||"Active",
 userId: session.user.tenantId,
 },
 });
 return NextResponse.json(promotion);
 } catch (error) {
 return NextResponse.json({ error:"Failed to create promotion"}, { status: 500 });
 }
}
