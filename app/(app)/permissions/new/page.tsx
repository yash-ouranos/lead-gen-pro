import PermissionForm from "../PermissionForm";

export default function NewPermissionPage() {
  return (
    <div className="w-full h-full flex flex-col space-y-6">
      <div className="flex-1 bg-card border border-border overflow-y-auto rounded-lg shadow-sm">
        <PermissionForm />
      </div>
    </div>
  );
}
