"use server";

import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { prisma } from"@/lib/prisma";
import { revalidatePath } from"next/cache";

export async function createTemplate(formData: FormData) {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 throw new Error("Unauthorized");
 }

 const name = formData.get("name") as string;
 const subject = formData.get("subject") as string;
 const body = formData.get("body") as string;

 await prisma.emailTemplate.create({
 data: {
 userId: session.user.tenantId,
 name,
 subject,
 body,
 },
 });

 revalidatePath("/templates");
}

export async function updateTemplate(formData: FormData) {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 throw new Error("Unauthorized");
 }

 const id = formData.get("id") as string;
 const name = formData.get("name") as string;
 const subject = formData.get("subject") as string;
 const body = formData.get("body") as string;

 // Ensure user owns the template
 const template = await prisma.emailTemplate.findUnique({ where: { id } });
 if (template?.userId !== session.user.tenantId) {
 throw new Error("Unauthorized");
 }

 await prisma.emailTemplate.update({
 where: { id },
 data: { name, subject, body },
 });

 revalidatePath("/templates");
}

export async function deleteTemplate(formData: FormData) {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 return { success: false, error: "Unauthorized" };
 }

 const id = formData.get("id") as string;

 const template = await prisma.emailTemplate.findUnique({ where: { id } });
 if (template?.userId !== session.user.tenantId) {
 return { success: false, error: "Unauthorized" };
 }

 await prisma.emailTemplate.delete({
 where: { id },
 });

 revalidatePath("/templates");
 return { success: true };
}
