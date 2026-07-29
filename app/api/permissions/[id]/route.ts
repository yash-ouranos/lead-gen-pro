import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const permission = await prisma.permission.findUnique({
      where: {
        id: resolvedParams.id,
        userId: session.user.id,
      },
    });

    if (!permission) {
      return NextResponse.json({ error: "Permission not found" }, { status: 404 });
    }

    return NextResponse.json(permission);
  } catch (error) {
    console.error("Error fetching permission:", error);
    return NextResponse.json(
      { error: "Failed to fetch permission" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, value, status } = body;

    const resolvedParams = await params;
    const permission = await prisma.permission.update({
      where: {
        id: resolvedParams.id,
        userId: session.user.id, // Ensure user owns the permission
      },
      data: {
        ...(name && { name }),
        ...(value && { value }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(permission);
  } catch (error) {
    console.error("Error updating permission:", error);
    return NextResponse.json(
      { error: "Failed to update permission" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    await prisma.permission.delete({
      where: {
        id: resolvedParams.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting permission:", error);
    return NextResponse.json(
      { error: "Failed to delete permission" },
      { status: 500 }
    );
  }
}
