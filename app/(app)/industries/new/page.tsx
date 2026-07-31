import IndustryForm from "../IndustryForm";

export default function NewIndustryPage() {
  return (
    <div className="w-full h-full flex flex-col space-y-6">
      <div className="flex-1 bg-card border border-border overflow-y-auto rounded-lg shadow-sm">
        <IndustryForm />
      </div>
    </div>
  );
}
