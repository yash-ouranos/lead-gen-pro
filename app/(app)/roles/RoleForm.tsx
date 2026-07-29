"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RoleForm({ initialData, availablePermissions = [] }: { initialData?: any, availablePermissions?: any[] }) {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    name: initialData?.name || "", 
    permissions: initialData?.permissions || [] 
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleCheckboxChange = (permissionId: string) => {
    const list = formData.permissions;
    if (list.includes(permissionId)) {
      setFormData({ ...formData, permissions: list.filter((p: string) => p !== permissionId) });
    } else {
      setFormData({ ...formData, permissions: [...list, permissionId] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Role Name is required.";

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setLoading(true);
    const url = initialData ? `/api/roles/${initialData.id}` : "/api/roles";
    const method = initialData ? "PUT" : "POST";
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      router.push("/roles");
    } else {
      alert("Failed to save role");
      setLoading(false);
    }
  };

  const getInputClasses = (field: string) => {
    return `w-full px-4 py-2.5 bg-muted border-0 border-b outline-none focus:outline-none focus:ring-2 focus:ring-inset focus:outline-none transition-all text-foreground text-sm ${
      fieldErrors[field] ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-border focus:border-primary focus:ring-primary"
    }`;
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 p-6 md:p-8 space-y-6" noValidate>
      <div>
        <label className="block text-[13px] text-foreground mb-1.5">Role Name *</label>
        <input 
          type="text"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          className={getInputClasses("name")}
        />
        {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
      </div>
      
      <div>
        <label className="block text-[13px] text-foreground mb-1.5">Permissions</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border border-border bg-muted/50">
          {availablePermissions.length === 0 && (
            <p className="text-sm text-muted-foreground italic col-span-full">No active permissions available. Create permissions first.</p>
          )}
          {availablePermissions.map(perm => (
            <label key={perm.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                type="checkbox"
                checked={formData.permissions.includes(perm.value)}
                onChange={() => handleCheckboxChange(perm.value)}
                className="border-border text-primary focus:ring-primary"
              />
              <span className="text-foreground">{perm.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <button 
          type="button"
          onClick={() => router.push("/roles")}
          className="px-4 py-2 border border-border text-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
