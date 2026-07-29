import { NextResponse } from"next/server";
import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { prisma } from"@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 if (session.user.role?.name !=="ADMIN"&& !session.user.role?.permissions.includes("MANAGE_ROLES")) {
 return NextResponse.json({ error:"Forbidden"}, { status: 403 });
 }

 const { id } = await params;

 try {
 const data = await request.json();
 const role = await prisma.role.update({
 where: { 
 id,
 userId: session.user.tenantId, // Ensure they own it
 },
 data: {
 name: data.name,
 permissions: data.permissions || [],
 },
 });
 return NextResponse.json(role);
 } catch (error) {
 return NextResponse.json({ error:"Failed to update role"}, { status: 500 });
 }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 if (session.user.role?.name !=="ADMIN"&& !session.user.role?.permissions.includes("MANAGE_ROLES")) {
 return NextResponse.json({ error:"Forbidden"}, { status: 403 });
 }

 const { id } = await params;

 try {
 await prisma.role.delete({
 where: { 
 id,
 userId: session.user.tenantId,
 }
 });
 return NextResponse.json({ success: true });
 } catch (error) {
 return NextResponse.json({ error:"Failed to delete role"}, { status: 500 });
 }
}
