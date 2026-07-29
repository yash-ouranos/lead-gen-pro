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

 if (session.user.role?.name !=="ADMIN"&& !session.user.role?.permissions.includes("MANAGE_STAFF")) {
 return NextResponse.json({ error:"Forbidden"}, { status: 403 });
 }

 try {
 const data = await request.json();
 const staff = await prisma.staff.updateMany({
 where: {
 id,
 userId: session.user.tenantId,
 },
 data: {
 name: data.name,
 email: data.email,
 phone: data.phone,
 status: data.status,
 roleId: data.roleId || null,
 },
 });

 if (staff.count === 0) {
 return NextResponse.json({ error:"Not found or unauthorized"}, { status: 404 });
 }

 return NextResponse.json({ success: true });
 } catch (error) {
 return NextResponse.json({ error:"Failed to update staff"}, { status: 500 });
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

 if (session.user.role?.name !=="ADMIN"&& !session.user.role?.permissions.includes("MANAGE_STAFF")) {
 return NextResponse.json({ error:"Forbidden"}, { status: 403 });
 }

 try {
 const staff = await prisma.staff.deleteMany({
 where: {
 id,
 userId: session.user.tenantId,
 },
 });

 if (staff.count === 0) {
 return NextResponse.json({ error:"Not found or unauthorized"}, { status: 404 });
 }

 return NextResponse.json({ success: true });
 } catch (error) {
 return NextResponse.json({ error:"Failed to delete staff"}, { status: 500 });
 }
}
