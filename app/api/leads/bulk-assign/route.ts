import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (!hasPermission(session, "ASSIGN_USER")) {
            return NextResponse.json({ error: "Forbidden: Only admins and authorized users can bulk assign leads" }, { status: 403 });
        }

        const body = await request.json();
        const { leadIds, staffId } = body;

        if (!Array.isArray(leadIds) || leadIds.length === 0) {
            return NextResponse.json({ error: 'leadIds array is required' }, { status: 400 });
        }

        await prisma.lead.updateMany({
            where: {
                id: {
                    in: leadIds
                }
            },
            data: {
                assignStaffId: staffId || null
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to bulk assign leads' }, { status: 500 });
    }
}
