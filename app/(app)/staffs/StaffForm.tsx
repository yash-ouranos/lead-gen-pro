"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function StaffForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [formData, setFormData] = useState({ 
    name: initialData?.name || "", 
    email: initialData?.email || "",
    password: "",
    phone: initialData?.phone || "",
    status: initialData?.status || "Active",
    roleId: initialData?.roleId || ""
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    const res = await fetch("/api/roles");
    if (res.ok) {
      setRoles(await res.json());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!initialData && !formData.password) newErrors.password = "Password is required to create a staff login.";

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setLoading(true);
    
    // We only send password when creating, not updating for now.
    const { password, ...rest } = formData;
    const payload: any = initialData ? rest : { ...rest, password };

    const url = initialData ? `/api/staffs/${initialData.id}` : "/api/staffs";
    const method = initialData ? "PUT" : "POST";
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/staffs");
    } else {
      try {
        const errorData = await res.json();
        if (errorData.error && errorData.error.toLowerCase().includes("email")) {
          setFieldErrors({ email: errorData.error });
        } else {
          alert(errorData.error || "Failed to save staff");
        }
      } catch (e) {
        alert("Failed to save staff");
      }
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
        <label className="block text-[13px] text-foreground mb-1.5">Name *</label>
        <input 
          type="text"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          className={getInputClasses("name")}
        />
        {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
      </div>
      <div>
        <label className="block text-[13px] text-foreground mb-1.5">Email * (Login Email)</label>
        <input 
          type="email"
          disabled={!!initialData}
          value={formData.email}
          onChange={e => setFormData({...formData, email: e.target.value})}
          className={`${getInputClasses("email")} disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
      </div>
      {!initialData && (
        <div>
          <label className="block text-[13px] text-foreground mb-1.5">Password *</label>
          <input 
            type="password"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
            className={getInputClasses("password")}
          />
          {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
        </div>
      )}
      <div>
        <label className="block text-[13px] text-foreground mb-1.5">Role</label>
        <select 
          value={formData.roleId}
          onChange={e => setFormData({...formData, roleId: e.target.value})}
          className="w-full px-4 py-2.5 bg-muted border-0 border-b border-border outline-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-inset focus:ring-primary focus:outline-none transition-all text-foreground text-sm"
        >
          <option value="">-- No Role --</option>
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[13px] text-foreground mb-1.5">Phone</label>
        <input 
          type="text"
          value={formData.phone}
          onChange={e => setFormData({...formData, phone: e.target.value})}
          className="w-full px-4 py-2.5 bg-muted border-0 border-b border-border outline-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-inset focus:ring-primary focus:outline-none transition-all text-foreground text-sm"
        />
      </div>
      <div>
        <label className="block text-[13px] text-foreground mb-1.5">Status</label>
        <select 
          value={formData.status}
          onChange={e => setFormData({...formData, status: e.target.value})}
          className="w-full px-4 py-2.5 bg-muted border-0 border-b border-border outline-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-inset focus:ring-primary focus:outline-none transition-all text-foreground text-sm"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-6">
        <button 
          type="button"
          onClick={() => router.push("/staffs")}
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
