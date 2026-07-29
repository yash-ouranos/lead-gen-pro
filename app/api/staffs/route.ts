import { NextResponse } from"next/server";
import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { prisma } from"@/lib/prisma";
import bcrypt from"bcryptjs";

export async function GET() {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 try {
 const staffs = await prisma.staff.findMany({
 where: { userId: session.user.tenantId },
 include: {
 role: true
 },
 orderBy: { createdAt:"desc"},
 });
 return NextResponse.json(staffs);
 } catch (error) {
 return NextResponse.json({ error:"Failed to fetch staff list"}, { status: 500 });
 }
}

export async function POST(request: Request) {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 return NextResponse.json({ error:"Unauthorized"}, { status: 401 });
 }

 // Check permission
 if (session.user.role?.name !=="ADMIN"&& !session.user.role?.permissions.includes("MANAGE_STAFF")) {
 return NextResponse.json({ error:"Forbidden"}, { status: 403 });
 }

 try {
 const data = await request.json();
 
 // Create User account for the staff member so they can log in
 let accountId = undefined;
 
 if (data.email && data.password) {
 const existingUser = await prisma.user.findUnique({ where: { email: data.email }});
 if (existingUser) {
 return NextResponse.json({ error:"User with this email already exists"}, { status: 400 });
 }

 const hashedPassword = await bcrypt.hash(data.password, 10);
 const newUser = await prisma.user.create({
 data: {
 name: data.name,
 email: data.email,
 password: hashedPassword,
 }
 });
 accountId = newUser.id;
 }

 const staff = await prisma.staff.create({
 data: {
 name: data.name,
 email: data.email,
 phone: data.phone,
 status: data.status ||"Active",
 userId: session.user.tenantId,
 roleId: data.roleId || null,
 accountId,
 },
 include: {
 role: true
 }
 });
 return NextResponse.json(staff);
 } catch (error) {
 return NextResponse.json({ error:"Failed to create staff"}, { status: 500 });
 }
}
