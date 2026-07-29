import ReferralForm from "../ReferralForm";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function EditReferralPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();

  const data = await prisma.referral.findUnique({
    where: { id, userId: session.user.tenantId }
  });

  if (!data) return notFound();

  return (
    <div className="w-full h-full flex flex-col bg-card animate-in fade-in duration-500 overflow-y-auto">
      <ReferralForm initialData={data} />
    </div>
  );
}
