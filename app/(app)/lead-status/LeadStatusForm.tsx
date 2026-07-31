"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LeadStatusForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    name: initialData?.name || "", 
    status: initialData?.status || "Active"
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setLoading(true);
    const url = initialData ? `/api/lead-status/${initialData.id}` : "/api/lead-status";
    const method = initialData ? "PUT" : "POST";
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      toast.success(initialData ? "Lead status updated" : "Lead status created");
      router.push("/lead-status");
      router.refresh(); // Refresh the list
    } else {
      toast.error("Failed to save lead status");
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
          onClick={() => router.push("/lead-status")}
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
