import { NextResponse } from"next/server";
import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { prisma } from"@/lib/prisma";

export async function GET(request: Request) {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 const tenantId = session.user.tenantId;

 try {
 const roles = await prisma.role.findMany({
 where: { userId: tenantId },
 orderBy: { createdAt:"desc"},
 });
 return NextResponse.json(roles);
 } catch (error) {
 return NextResponse.json({ error:"Failed to fetch roles"}, { status: 500 });
 }
}

export async function POST(request: Request) {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 // Only Admin should create roles (simplified for now)
 if (session.user.role?.name !=="ADMIN"&& !session.user.role?.permissions.includes("MANAGE_ROLES")) {
 return NextResponse.json({ error:"Forbidden"}, { status: 403 });
 }

 try {
 const data = await request.json();
 const role = await prisma.role.create({
 data: {
 name: data.name,
 permissions: data.permissions || [],
 userId: session.user.tenantId,
 },
 });
 return NextResponse.json(role);
 } catch (error) {
 return NextResponse.json({ error:"Failed to create role"}, { status: 500 });
 }
}
