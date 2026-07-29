import RoleForm from "../RoleForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const resolvedParams = await params;
  const data = await prisma.role.findUnique({
    where: {
      id: resolvedParams.id,
      userId: session.user.id,
    },
  });

  if (!data) {
    redirect("/roles");
  }

  const permissions = await prisma.permission.findMany({
    where: { userId: session.user.id, status: "Active" },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      <div className="flex-1 bg-card border border-border overflow-y-auto rounded-lg shadow-sm">
        <RoleForm initialData={data} availablePermissions={permissions} />
      </div>
    </div>
  );
}
