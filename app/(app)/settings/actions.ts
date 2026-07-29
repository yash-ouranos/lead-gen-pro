"use server";

import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { prisma } from"@/lib/prisma";
import { revalidatePath } from"next/cache";

export async function updateSettings(formData: FormData) {
 const session = await getServerSession(authOptions);
 if (!session?.user?.id) {
 throw new Error("Unauthorized");
 }

 const apifyApiKey = formData.get("apifyApiKey") as string;
 const hunterApiKey = formData.get("hunterApiKey") as string;
 const apolloApiKey = formData.get("apolloApiKey") as string;
 const openaiApiKey = formData.get("openaiApiKey") as string;
 const anthropicApiKey = formData.get("anthropicApiKey") as string;
 const geminiApiKey = formData.get("geminiApiKey") as string;

 await prisma.user.update({
 where: { id: session.user.id },
 data: {
 apifyApiKey,
 hunterApiKey,
 apolloApiKey,
 openaiApiKey,
 anthropicApiKey,
 geminiApiKey,
 },
 });

 revalidatePath("/settings");
}
