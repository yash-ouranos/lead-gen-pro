import TemplateForm from "@/app/components/TemplateForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = await prisma.emailTemplate.findUnique({
    where: { id }
  });

  if (!template) {
    notFound();
  }

  return (
    <div className="w-full h-full flex flex-col bg-card animate-in fade-in duration-500 overflow-y-auto">
      <div className="flex-1 p-6 md:p-8">
        <div className="w-full">
          <TemplateForm initialData={template} />
        </div>
      </div>
    </div>
  );
}
