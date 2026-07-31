import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { leads } = await req.json();

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: "Invalid payload: 'leads' must be a non-empty array." }, { status: 400 });
    }

    // Map CSV rows to Prisma structure
    const dataToInsert = leads.map((lead: any) => ({
      userId: user.id,
      businessName: lead["Company Name"] || "Unknown Business",
      leadName: lead["Lead Name"] || null,
      name: lead["Contact Name"] || null,
      email: lead["Contact Email"] || null,
      phone: lead["Contact Mobile No.1"] || null,
      website: lead["Website"] || null,
      preferredMethodOfContact: lead["Method of Contact"] || null,
      designation: lead["Contact Designation"] || null,
      industry: lead["Industry"] || null,
      annualRevenue: lead["Annual Revenue"] || null,
      temperature: lead["Lead Temperature"] || null,
      streetNo: lead["Street No."] || null,
      city: lead["City"] || null,
      state: lead["State"] || null,
      country: lead["Country"] || null,
      pinCode: lead["Pin Code"] || null,
      remarks: lead["Remarks"] || null,
      status: lead["Lead Status"] || "NEW",
      activeStatus: "Active",
      leadType: lead["Lead Type"] ? lead["Lead Type"].split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      products: lead["Products"] ? lead["Products"].split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      services: lead["Services"] ? lead["Services"].split(",").map((s: string) => s.trim()).filter(Boolean) : []
    }));

    // Perform bulk insert
    const result = await prisma.lead.createMany({
      data: dataToInsert,
      skipDuplicates: true, 
    });

    return NextResponse.json({ message: "Import successful", count: result.count });
  } catch (error: any) {
    console.error("Failed to import leads:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
