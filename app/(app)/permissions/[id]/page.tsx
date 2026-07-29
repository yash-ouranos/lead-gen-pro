import PermissionForm from "../PermissionForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function EditPermissionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const resolvedParams = await params;
  const permission = await prisma.permission.findUnique({
    where: {
      id: resolvedParams.id,
      userId: session.user.id,
    },
  });

  if (!permission) {
    redirect("/permissions");
  }

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      <div className="flex-1 bg-card border border-border overflow-y-auto rounded-lg shadow-sm">
        <PermissionForm initialData={permission} />
      </div>
    </div>
  );
}
