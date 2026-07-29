import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, description } = await request.json();
    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { campaign: true }
    });

    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const isOwner = lead.userId === session.user.tenantId || lead.campaign?.userId === session.user.tenantId;
    if (!isOwner) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const activity = await prisma.leadActivity.create({
      data: {
        leadId: id,
        type: type || "NOTE",
        description,
        userId: session.user.id
      }
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("Failed to create activity:", error);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
