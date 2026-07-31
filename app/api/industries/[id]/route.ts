import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const item = await prisma.industry.findUnique({
    where: {
      id: resolvedParams.id,
      userId: session.user.tenantId,
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, status } = await req.json();

  const resolvedParams = await params;
  const item = await prisma.industry.updateMany({
    where: {
      id: resolvedParams.id,
      userId: session.user.tenantId,
    },
    data: {
      name,
      status,
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  await prisma.industry.deleteMany({
    where: {
      id: resolvedParams.id,
      userId: session.user.tenantId,
    },
  });

  return NextResponse.json({ success: true });
}
