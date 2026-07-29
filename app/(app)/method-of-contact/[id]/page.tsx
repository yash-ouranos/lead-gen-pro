import MethodOfContactForm from "../MethodOfContactForm";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function EditMethodOfContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();

  const data = await prisma.methodOfContact.findUnique({
    where: { id, userId: session.user.tenantId }
  });

  if (!data) return notFound();

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      <div className="flex-1 bg-card border border-border overflow-y-auto rounded-lg shadow-sm">
        <MethodOfContactForm initialData={data} />
      </div>
    </div>
  );
}
