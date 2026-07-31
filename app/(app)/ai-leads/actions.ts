"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function transferToMainLeads(leadIds: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    await prisma.lead.updateMany({
      where: {
        id: { in: leadIds },
        userId: session.user.tenantId,
      },
      data: {
        isAiLead: false,
      }
    });

    revalidatePath("/ai-leads");
    revalidatePath("/leads");
    return { success: true };
  } catch (error) {
    console.error("Failed to transfer leads", error);
    return { error: "Failed to transfer leads" };
  }
}

export async function deleteAiLeads(leadIds: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.tenantId) return { error: "Unauthorized" };

  try {
    await prisma.lead.deleteMany({
      where: {
        id: { in: leadIds },
        userId: session.user.tenantId,
      }
    });

    revalidatePath("/ai-leads");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete leads", error);
    return { error: "Failed to delete leads" };
  }
}
