import MethodOfContactForm from "../MethodOfContactForm";

export default function NewMethodOfContactPage() {
  return (
    <div className="w-full h-full flex flex-col space-y-6">
      <div className="flex-1 bg-card border border-border overflow-y-auto rounded-lg shadow-sm">
        <MethodOfContactForm />
      </div>
    </div>
  );
}
