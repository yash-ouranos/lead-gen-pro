import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { prisma } from"@/lib/prisma";
import TemplateList from "@/app/components/TemplateList";
import { redirect } from"next/navigation";

export default async function TemplatesPage() {
 const session = await getServerSession(authOptions);
 
 if (!session?.user?.id) {
 redirect("/api/auth/signin");
 }

 const templates = await prisma.emailTemplate.findMany({
 where: { userId: session.user.tenantId },
 orderBy: { createdAt:'desc'}
 });

  return (
    <div className="w-full h-full flex flex-col bg-card animate-in fade-in duration-500 overflow-y-auto">
      <div className="flex-1 p-6 md:p-8">
        <TemplateList templates={templates} />
      </div>
    </div>
  );
}
