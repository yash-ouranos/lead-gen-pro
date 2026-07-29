"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReferralForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [formData, setFormData] = useState({ 
    name: initialData?.name || "", 
    email: initialData?.email || "", 
    phone: initialData?.phone || "",
    status: initialData?.status || "Active",
    promotionId: initialData?.promotionId || ""
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    const res = await fetch("/api/promotions");
    if (res.ok) {
      setPromotions(await res.json());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required.";
    if (!formData.promotionId) newErrors.promotionId = "Promotion is required.";

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setLoading(true);
    const url = initialData ? `/api/referrals/${initialData.id}` : "/api/referrals";
    const method = initialData ? "PUT" : "POST";
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      router.push("/referrals");
    } else {
      alert("Failed to save referral");
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
        <label className="block text-[13px] text-foreground mb-1.5">Email</label>
        <input 
          type="email"
          value={formData.email}
          onChange={e => setFormData({...formData, email: e.target.value})}
          className={getInputClasses("email")}
        />
      </div>
      <div>
        <label className="block text-[13px] text-foreground mb-1.5">Phone *</label>
        <input 
          type="tel"
          value={formData.phone}
          onChange={e => setFormData({...formData, phone: e.target.value})}
          className={getInputClasses("phone")}
        />
        {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
      </div>
      <div>
        <label className="block text-[13px] text-foreground mb-1.5">Promotion *</label>
        <select 
          value={formData.promotionId}
          onChange={e => setFormData({...formData, promotionId: e.target.value})}
          className={getInputClasses("promotionId")}
        >
          <option value="">Select Promotion</option>
          {promotions.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {fieldErrors.promotionId && <p className="text-red-500 text-xs mt-1">{fieldErrors.promotionId}</p>}
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
          onClick={() => router.push("/referrals")}
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
