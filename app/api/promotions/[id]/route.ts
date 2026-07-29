import { NextResponse } from"next/server";
import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { prisma } from"@/lib/prisma";

export async function PUT(
 request: Request,
 { params }: { params: Promise<{ id: string }> }
) {
 const { id } = await params;
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 try {
 const data = await request.json();
 const promotion = await prisma.promotion.updateMany({
 where: {
 id,
 userId: session.user.tenantId,
 },
 data: {
 name: data.name,
 status: data.status,
 },
 });

 if (promotion.count === 0) {
 return NextResponse.json({ error:"Not found or unauthorized"}, { status: 404 });
 }

 return NextResponse.json({ success: true });
 } catch (error) {
 return NextResponse.json({ error:"Failed to update promotion"}, { status: 500 });
 }
}

export async function DELETE(
 request: Request,
 { params }: { params: Promise<{ id: string }> }
) {
 const { id } = await params;
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 try {
 const promotion = await prisma.promotion.deleteMany({
 where: {
 id,
 userId: session.user.tenantId,
 },
 });

 if (promotion.count === 0) {
 return NextResponse.json({ error:"Not found or unauthorized"}, { status: 404 });
 }

 return NextResponse.json({ success: true });
 } catch (error) {
 return NextResponse.json({ error:"Failed to delete promotion"}, { status: 500 });
 }
}
