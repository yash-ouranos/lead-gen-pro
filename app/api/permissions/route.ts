import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AVAILABLE_PERMISSIONS } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = { userId: session.user.id };
    if (status && status !== "all") {
      where.status = status;
    }

    let permissions = await prisma.permission.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Auto-seed for the user if they have 0 permissions
    if (permissions.length === 0) {
      const seedData = AVAILABLE_PERMISSIONS.map(p => ({
        userId: session.user.id,
        name: p.label,
        value: p.id,
        status: "Active"
      }));

      await prisma.permission.createMany({
        data: seedData,
        skipDuplicates: true
      });

      permissions = await prisma.permission.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(permissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, value, status } = body;

    if (!name || !value) {
      return NextResponse.json(
        { error: "Name and value are required" },
        { status: 400 }
      );
    }

    const permission = await prisma.permission.create({
      data: {
        name,
        value,
        status: status || "Active",
        userId: session.user.id,
      },
    });

    return NextResponse.json(permission);
  } catch (error) {
    console.error("Error creating permission:", error);
    return NextResponse.json(
      { error: "Failed to create permission" },
      { status: 500 }
    );
  }
}
