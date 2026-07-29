import TemplateForm from "@/app/components/TemplateForm";

export default function NewTemplatePage() {
  return (
    <div className="w-full h-full flex flex-col bg-card animate-in fade-in duration-500 overflow-y-auto">
      <div className="flex-1 p-6 md:p-8">
        <div className="w-full">
          <TemplateForm />
        </div>
      </div>
    </div>
  );
}
