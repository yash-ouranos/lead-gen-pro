import { NextResponse } from"next/server";
import { prisma } from"@/lib/prisma";
import bcrypt from"bcryptjs";

export async function POST(request: Request) {
 try {
 const userCount = await prisma.user.count();
 
 if (userCount > 0) {
 return NextResponse.json({ error:"Setup already completed"}, { status: 400 });
 }

 const data = await request.json();
 
 if (!data.email || !data.password || !data.name) {
 return NextResponse.json({ error:"Missing required fields"}, { status: 400 });
 }

 const hashedPassword = await bcrypt.hash(data.password, 10);

 const user = await prisma.user.create({
 data: {
 name: data.name,
 email: data.email,
 password: hashedPassword,
 },
 });

 return NextResponse.json({ success: true, message:"Admin user created successfully."});
 } catch (error) {
 console.error("Setup error:", error);
 return NextResponse.json({ error:"Failed to run setup"}, { status: 500 });
 }
}
