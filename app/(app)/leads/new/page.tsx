"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatStatus, sortStatuses } from "@/lib/utils";
import MultiSelectDropdown from "@/app/components/MultiSelectDropdown";
import { UserFollow, Save, CheckmarkOutline, ArrowLeft } from "@carbon/icons-react";

export default function NewLeadPage() {
  const router = useRouter();
  
  const [promotions, setPromotions] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [methodOfContacts, setMethodOfContacts] = useState<any[]>([]);
  const [leadStatuses, setLeadStatuses] = useState<any[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    leadType: [] as string[],
    promotionIds: [] as string[],
    referralId: "",
    preferredMethodOfContact: "",
    name: "",
    businessName: "",
    phone: "",
    email: "",
    website: "",
    assignStaffId: "",
    followUpDate: "",
    status: "NEW",
    streetNo: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
    products: [] as string[],
    services: [] as string[],
    remarks: ""
  });

  useEffect(() => {
    fetch("/api/promotions").then(r => r.json()).then(setPromotions);
    fetch("/api/staffs").then(r => r.json()).then(setStaffs);
    fetch("/api/method-of-contact").then(r => r.json()).then(setMethodOfContacts);
    fetch("/api/lead-status").then(r => r.json()).then(setLeadStatuses);
  }, []);

  // Fetch referrals when promotion changes
  useEffect(() => {
    if (formData.promotionIds.length > 0) {
      fetch(`/api/referrals?promotionId=${formData.promotionIds[0]}`)
        .then(r => r.json())
        .then(setReferrals);
    } else {
      setReferrals([]);
    }
  }, [formData.promotionIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const newErrors: Record<string, string> = {};
    if (formData.leadType.length === 0) newErrors.leadType = "Lead Type is required.";
    if (!formData.preferredMethodOfContact) newErrors.preferredMethodOfContact = "Method of Contact is required.";
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.status) newErrors.status = "Lead Status is required.";

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Failed to create lead");
    }
  };

  const getInputClasses = (field: string) => {
    return `w-full px-4 py-2.5 bg-muted border-0 border-b outline-none focus:outline-none focus:ring-2 focus:ring-inset focus:outline-none transition-all text-foreground text-sm shadow-sm placeholder:text-muted-foreground/60 ${
      formErrors[field] ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-border focus:border-primary focus:ring-primary"
    }`;
  };

  const labelClasses = "block text-[13px] text-foreground mb-1.5";

  return (
    <div className="w-full h-full flex flex-col bg-card animate-in fade-in duration-500 overflow-y-auto">

      <form onSubmit={handleSubmit} className="flex-1 p-6 md:p-8" noValidate>
        {/* Lead Information */}
        <div className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-border pb-3 text-foreground">Lead Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-6">
            <div>
              <label className={labelClasses}>Lead Type *</label>
              <div className={`relative ${formErrors.leadType ? 'border-b border-red-500' : ''}`}>
                <MultiSelectDropdown 
                  options={[{ id: "B2B", name: "B2B" }, { id: "B2C", name: "B2C" }]}
                  selectedIds={formData.leadType}
                  onChange={(ids) => setFormData({...formData, leadType: ids})}
                  placeholder="Select Lead Type"
                />
              </div>
              {formErrors.leadType && <p className="text-red-500 text-xs mt-1.5">{formErrors.leadType}</p>}
            </div>
            
            <div>
              <label className={labelClasses}>Promotion</label>
              <div className="relative">
                <MultiSelectDropdown 
                  options={promotions}
                  selectedIds={formData.promotionIds}
                  onChange={(ids) => setFormData({...formData, promotionIds: ids})}
                  placeholder="Select Promotions"
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Referral</label>
              <select 
                value={formData.referralId}
                onChange={e => setFormData({...formData, referralId: e.target.value})}
                className={`${getInputClasses('referralId')} appearance-none`}
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23737373%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
              >
                <option value="">Select Referral</option>
                {referrals.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClasses}>Method of Contact *</label>
              <select 
                value={formData.preferredMethodOfContact}
                onChange={e => setFormData({...formData, preferredMethodOfContact: e.target.value})}
                className={`${getInputClasses('preferredMethodOfContact')} appearance-none`}
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23737373%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
              >
                <option value="" disabled>Select Options</option>
                {methodOfContacts.filter(m => m.status === 'Active').map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
              {formErrors.preferredMethodOfContact && <p className="text-red-500 text-xs mt-1.5">{formErrors.preferredMethodOfContact}</p>}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-border pb-3 text-foreground">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-6">
            <div>
              <label className={labelClasses}>Name *</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={getInputClasses('name')} placeholder="Enter Name"/>
              {formErrors.name && <p className="text-red-500 text-xs mt-1.5">{formErrors.name}</p>}
            </div>
            <div>
              <label className={labelClasses}>Company Name</label>
              <input type="text" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} className={getInputClasses('businessName')} placeholder="Enter Company Name"/>
            </div>
            <div>
              <label className={labelClasses}>Mobile No.1</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={getInputClasses('phone')} placeholder="Enter Mobile Number"/>
            </div>
            <div>
              <label className={labelClasses}>Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={getInputClasses('email')} placeholder="Enter Email"/>
            </div>

            <div>
              <label className={labelClasses}>Website</label>
              <input type="text" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className={getInputClasses('website')} placeholder="Enter Website"/>
            </div>
            <div>
              <label className={labelClasses}>Assign User</label>
              <select value={formData.assignStaffId} onChange={e => setFormData({...formData, assignStaffId: e.target.value})} className={`${getInputClasses('assignStaffId')} appearance-none`}
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23737373%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
              >
                <option value="">Select Assignee</option>
                {staffs.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClasses}>Follow-Up Date</label>
              <input type="date" value={formData.followUpDate} onChange={e => setFormData({...formData, followUpDate: e.target.value})} className={getInputClasses('followUpDate')} />
            </div>
            <div>
              <label className={labelClasses}>Lead Status *</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className={`${getInputClasses('status')} appearance-none`}
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23737373%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
              >
                <option value="" disabled>Select Status</option>
                {sortStatuses(leadStatuses.filter(s => s.status === 'Active')).map(s => (
                  <option key={s.id} value={s.name}>{formatStatus(s.name)}</option>
                ))}
              </select>
              {formErrors.status && <p className="text-red-500 text-xs mt-1.5">{formErrors.status}</p>}
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-border pb-3 text-foreground">Address Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-6">
            <div>
              <label className={labelClasses}>Street No.</label>
              <input type="text" value={formData.streetNo} onChange={e => setFormData({...formData, streetNo: e.target.value})} className={getInputClasses('streetNo')} placeholder="Enter Address Line 1"/>
            </div>
            <div>
              <label className={labelClasses}>City</label>
              <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={getInputClasses('city')} placeholder="Enter City"/>
            </div>
            <div>
              <label className={labelClasses}>State</label>
              <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className={getInputClasses('state')} placeholder="Enter State"/>
            </div>
            <div>
              <label className={labelClasses}>Country</label>
              <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className={getInputClasses('country')} placeholder="Enter Country"/>
            </div>

            <div>
              <label className={labelClasses}>Pin Code</label>
              <input type="text" value={formData.pinCode} onChange={e => setFormData({...formData, pinCode: e.target.value})} className={getInputClasses('pinCode')} placeholder="Enter Pin Code"/>
            </div>
            <div className="md:col-span-1">
              <label className={labelClasses}>Products</label>
              <input type="text" placeholder="Comma separated" value={formData.products.join(", ")} onChange={e => setFormData({...formData, products: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} className={getInputClasses('products')} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClasses}>Services</label>
              <input type="text" placeholder="Comma separated" value={formData.services.join(", ")} onChange={e => setFormData({...formData, services: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} className={getInputClasses('services')} />
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-border pb-3 text-foreground">Remarks</h2>
          <textarea 
            value={formData.remarks} 
            onChange={e => setFormData({...formData, remarks: e.target.value})} 
            className={getInputClasses('remarks')} 
            rows={4} 
            placeholder="Enter Remarks"
          />
        </div>

        <div className="flex justify-end gap-4 pb-12">
          <button type="button" onClick={() => router.push("/dashboard")} className="px-6 py-2.5 bg-card text-foreground hover:bg-muted font-semibold transition-all">
            Cancel
          </button>
          <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground flex items-center gap-2 hover:bg-primary/90 font-semibold transition-all shadow-sm">
            <Save size={16} />
            Save Lead
          </button>
        </div>
      </form>
    </div>
  );
}
