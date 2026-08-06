import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { campaign: true }
    });

    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    
    const isOwner = lead.userId === session.user.tenantId || lead.campaign?.userId === session.user.tenantId;
    if (!isOwner) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Failed to fetch lead:", error);
    return NextResponse.json({ error: "Failed to fetch lead" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { campaign: true }
    });

    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const isOwner = lead.userId === session.user.tenantId || lead.campaign?.userId === session.user.tenantId;
    if (!isOwner) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const data = await request.json();
    const canAssignUser = hasPermission(session, "ASSIGN_USER");
    const activities: any[] = [];

    if (data.status && data.status !== lead.status) {
      activities.push({
        type: "STATUS_CHANGE",
        description: `Status changed from ${lead.status || 'None'} to ${data.status}`,
        userId: session.user.id
      });
    }

    const finalAssignStaffId = canAssignUser && data.assignStaffId !== undefined ? (data.assignStaffId || null) : lead.assignStaffId;

    if (finalAssignStaffId !== lead.assignStaffId) {
      activities.push({
        type: "SYSTEM",
        description: finalAssignStaffId ? `Assigned to staff ID: ${finalAssignStaffId}` : `Unassigned from staff`,
        userId: session.user.id
      });
    }
    
    // We only allow updating certain fields
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        leadName: data.leadName,
        leadType: data.leadType,
        promotions: data.promotionIds ? { set: data.promotionIds.map((id: string) => ({ id })) } : undefined,
        referralId: data.referralId || null,
        preferredMethodOfContact: data.preferredMethodOfContact,
        designation: data.designation,
        industry: data.industry,
        annualRevenue: data.annualRevenue,
        temperature: data.temperature,
        name: data.name,
        businessName: data.businessName,
        phone: data.phone,
        email: data.email,
        website: data.website,
        assignStaffId: finalAssignStaffId,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        status: data.status,
        streetNo: data.streetNo,
        city: data.city,
        state: data.state,
        country: data.country,
        pinCode: data.pinCode,
        products: data.products,
        services: data.services,
        remarks: data.remarks,
        activities: activities.length > 0 ? { create: activities } : undefined
      }
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error("Failed to update lead:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    if (!('status' in data) && !('assignStaffId' in data)) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { campaign: true }
    });

    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const isOwner = lead.userId === session.user.tenantId || lead.campaign?.userId === session.user.tenantId;
    if (!isOwner) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const updateData: any = {};
    const activities: any[] = [];
    const canAssignUser = hasPermission(session, "ASSIGN_USER");

    if ('status' in data && data.status !== lead.status) {
      updateData.status = data.status;
      activities.push({
        type: "STATUS_CHANGE",
        description: `Status changed from ${lead.status} to ${data.status}`,
        userId: session.user.id
      });
    }

    if ('assignStaffId' in data && data.assignStaffId !== lead.assignStaffId) {
      if (!canAssignUser) {
        return NextResponse.json({ error: "Only admins and authorized users can reassign leads" }, { status: 403 });
      }
      updateData.assignStaffId = data.assignStaffId;
      activities.push({
        type: "SYSTEM",
        description: data.assignStaffId ? `Assigned to staff ID: ${data.assignStaffId}` : `Unassigned from staff`,
        userId: session.user.id
      });
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(lead);
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { 
        ...updateData,
        activities: activities.length > 0 ? { create: activities } : undefined
      }
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error("Failed to update lead status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { campaign: true }
    });

    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const isOwner = lead.userId === session.user.tenantId || lead.campaign?.userId === session.user.tenantId;
    if (!isOwner) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    await prisma.lead.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete lead:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
