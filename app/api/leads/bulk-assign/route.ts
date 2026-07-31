import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
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
