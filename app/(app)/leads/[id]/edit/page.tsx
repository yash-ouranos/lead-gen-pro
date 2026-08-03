"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import MultiSelectDropdown from "@/app/components/MultiSelectDropdown";
import SearchableCreatableSelect from "@/app/components/SearchableCreatableSelect";
import { DocumentAdd, Building, Phone, Earth, Information, Attachment, ArrowRight } from "@carbon/icons-react";
import toast from "react-hot-toast";
import { UserFollow, Save, CheckmarkOutline, ArrowLeft, Add } from "@carbon/icons-react";
import { formatStatus, sortStatuses } from "@/lib/utils";

type LocationData = {
  [country: string]: {
    [state: string]: string[];
  };
};

const locationData: LocationData = {
  USA: {
    California: ["Los Angeles", "San Francisco", "San Diego"],
    Texas: ["Austin", "Houston", "Dallas"],
    "New York": ["New York City", "Buffalo"],
    Florida: ["Miami", "Orlando", "Tampa"],
    Illinois: ["Chicago", "Springfield"],
  },
  Canada: {
    Ontario: ["Toronto", "Ottawa"],
    "British Columbia": ["Vancouver", "Victoria"],
  },
  UK: {
    England: ["London", "Manchester", "Birmingham"],
  },
  Australia: {
    "New South Wales": ["Sydney", "Newcastle"],
  },
  India: {
    Maharashtra: ["Mumbai", "Pune", "Nagpur"],
    Karnataka: ["Bangalore", "Mysore"],
    Delhi: ["New Delhi"],
    Gujarat: ["Ahmedabad", "Surat"],
  },
};

export default function EditLeadPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [promotions, setPromotions] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [methodOfContacts, setMethodOfContacts] = useState<any[]>([]);
  const [leadStatuses, setLeadStatuses] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
    remarks: "",
    leadName: "",
    designation: "",
    industry: "",
    annualRevenue: "",
    temperature: ""
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/promotions").then(r => r.json()),
      fetch("/api/staffs").then(r => r.json()),
      fetch(`/api/leads/${id}`).then(r => r.json()),
      fetch("/api/method-of-contact").then(r => r.json()),
      fetch("/api/lead-status").then(r => r.json()),
      fetch("/api/designations").then(r => r.json()),
      fetch("/api/industries").then(r => r.json())
    ]).then(([proms, stfs, leadData, mocs, lses, desgs, indss]) => {
      setPromotions(proms);
      setStaffs(stfs);
      setMethodOfContacts(mocs);
      setLeadStatuses(lses);
      setDesignations(desgs);
      setIndustries(indss);
      
      if (leadData && !leadData.error) {
        setFormData({
          leadName: leadData.leadName || "",
          leadType: leadData.leadType || [],
          promotionIds: leadData.promotionIds || [],
          referralId: leadData.referralId || "",
          preferredMethodOfContact: leadData.preferredMethodOfContact || "",
          name: leadData.name || "",
          businessName: leadData.businessName || "",
          phone: leadData.phone || "",
          email: leadData.email || "",
          website: leadData.website || "",
          assignStaffId: leadData.assignStaffId || "",
          followUpDate: leadData.followUpDate ? new Date(leadData.followUpDate).toISOString().split('T')[0] : "",
          status: leadData.status || "NEW",
          streetNo: leadData.streetNo || "",
          city: leadData.city || "",
          state: leadData.state || "",
          country: leadData.country || "",
          pinCode: leadData.pinCode || "",
          products: leadData.products || [],
          services: leadData.services || [],
          remarks: leadData.remarks || "",
          designation: leadData.designation || "",
          industry: leadData.industry || "",
          annualRevenue: leadData.annualRevenue || "",
          temperature: leadData.temperature || ""
        });
      }
      setLoading(false);
    });
  }, [id]);

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

  const availableStates = formData.country ? Object.keys(locationData[formData.country] || {}) : [];
  const availableCities = formData.state && formData.country ? (locationData[formData.country] as any)[formData.state] || [] : [];

  const handleCreateDesignation = async (name: string) => {
    const res = await fetch("/api/designations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, status: "Active" })
    });
    if (res.ok) {
      const newItem = await res.json();
      setDesignations([newItem, ...designations]);
      setFormData({ ...formData, designation: newItem.name });
    }
  };

  const handleCreateIndustry = async (name: string) => {
    const res = await fetch("/api/industries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, status: "Active" })
    });
    if (res.ok) {
      const newItem = await res.json();
      setIndustries([newItem, ...industries]);
      setFormData({ ...formData, industry: newItem.name });
    }
  };

  const handleCreatePromotion = async (name: string) => {
    const res = await fetch("/api/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    if (res.ok) {
      const newItem = await res.json();
      setPromotions([newItem, ...promotions]);
      setFormData({ ...formData, promotionIds: [...formData.promotionIds, newItem.id] });
    } else {
      toast.error("Failed to create promotion");
    }
  };

  const handleCreateReferral = async (name: string) => {
    if (formData.promotionIds.length === 0) {
      toast.error("Please select a Promotion first");
      return;
    }
    const res = await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, promotionId: formData.promotionIds[0] })
    });
    if (res.ok) {
      const newItem = await res.json();
      setReferrals([newItem, ...referrals]);
      setFormData({ ...formData, referralId: newItem.id });
    } else {
      toast.error("Failed to create referral");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const newErrors: Record<string, string> = {};
    if (formData.leadType.length === 0) newErrors.leadType = "Lead Type is required.";
    if (!formData.preferredMethodOfContact) newErrors.preferredMethodOfContact = "Method of Contact is required.";
    if (!formData.leadName.trim()) newErrors.leadName = "Lead Name is required.";
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.status) newErrors.status = "Lead Status is required.";

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    const res = await fetch(`/api/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      toast.success("Lead updated successfully");
      router.push("/dashboard");
    } else {
      toast.error("Failed to update lead");
    }
  };

  const getInputClasses = (field: string) => {
    return `w-full px-4 py-2.5 bg-muted border-0 border-b outline-none focus:outline-none focus:ring-2 focus:ring-inset focus:outline-none transition-all text-foreground text-sm shadow-sm placeholder:text-muted-foreground/60 ${
      formErrors[field] ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-border focus:border-primary focus:ring-primary"
    }`;
  };

  const labelClasses = "block text-[13px] text-foreground mb-1.5";

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading lead data...</div>;

  return (
    <div className="w-full h-full flex flex-col bg-card animate-in fade-in duration-500 overflow-y-auto">

      <form onSubmit={handleSubmit} className="flex-1 p-6 md:p-8" noValidate>
        {/* Lead Information */}
        <div className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-border pb-3 text-foreground">Lead Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-6">
            <div>
              <label className={labelClasses}>Lead Name *</label>
              <input type="text" value={formData.leadName} onChange={e => setFormData({...formData, leadName: e.target.value})} className={getInputClasses('leadName')} placeholder="Enter Lead Name"/>
              {formErrors.leadName && <p className="text-red-500 text-xs mt-1.5">{formErrors.leadName}</p>}
            </div>
            
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
              <SearchableCreatableSelect
                options={promotions}
                value={formData.promotionIds[0] || ""}
                onChange={(val) => setFormData({ ...formData, promotionIds: val ? [val] : [] })}
                onCreate={handleCreatePromotion}
                placeholder="Select or add..."
                valueKey="id"
              />
            </div>

            <div>
              <label className={labelClasses}>Referral</label>
              <SearchableCreatableSelect
                options={referrals}
                value={formData.referralId}
                onChange={(val) => setFormData({ ...formData, referralId: val })}
                onCreate={handleCreateReferral}
                placeholder={formData.promotionIds.length > 0 ? "Select or add..." : "Select a promotion first"}
                disabled={formData.promotionIds.length === 0}
                valueKey="id"
              />
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
                {methodOfContacts.filter(m => m.status === 'Active' || m.name === formData.preferredMethodOfContact).map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
              {formErrors.preferredMethodOfContact && <p className="text-red-500 text-xs mt-1.5">{formErrors.preferredMethodOfContact}</p>}
            </div>
            
            <div>
              <label className={labelClasses}>Lead Status *</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className={`${getInputClasses('status')} appearance-none`}
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23737373%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
              >
                <option value="" disabled>Select Status</option>
                {sortStatuses(leadStatuses.filter(s => s.status === 'Active' || s.name === formData.status)).map(s => (
                  <option key={s.id} value={s.name}>{formatStatus(s.name)}</option>
                ))}
              </select>
              {formErrors.status && <p className="text-red-500 text-xs mt-1.5">{formErrors.status}</p>}
            </div>
            
            <div>
              <label className={labelClasses}>Lead Temperature</label>
              <select value={formData.temperature} onChange={e => setFormData({...formData, temperature: e.target.value})} className={`${getInputClasses('temperature')} appearance-none`}
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23737373%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
              >
                <option value="">Select Temperature</option>
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
              </select>
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
              <label className={labelClasses}>Mobile No.1</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={getInputClasses('phone')} placeholder="Enter Mobile Number"/>
            </div>
            <div>
              <label className={labelClasses}>Email</label>
              <input suppressHydrationWarning type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={getInputClasses('email')} placeholder="Enter Email"/>
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
              <label className={labelClasses}>Designation</label>
              <SearchableCreatableSelect
                options={designations.filter(d => d.status === 'Active' || d.name === formData.designation)}
                value={formData.designation}
                onChange={(val) => setFormData({ ...formData, designation: val })}
                onCreate={handleCreateDesignation}
                placeholder="Select or add..."
              />
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-border pb-3 text-foreground">Company Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-6">
            <div>
              <label className={labelClasses}>Company Name</label>
              <input type="text" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} className={getInputClasses('businessName')} placeholder="Enter Company Name"/>
            </div>
            <div>
              <label className={labelClasses}>Industry</label>
              <SearchableCreatableSelect
                options={industries.filter(i => i.status === 'Active' || i.name === formData.industry)}
                value={formData.industry}
                onChange={(val) => setFormData({ ...formData, industry: val })}
                onCreate={handleCreateIndustry}
                placeholder="Select or add..."
              />
            </div>
            <div>
              <label className={labelClasses}>Annual Revenue</label>
              <input type="text" value={formData.annualRevenue} onChange={e => setFormData({...formData, annualRevenue: e.target.value})} className={getInputClasses('annualRevenue')} placeholder="e.g. $1M - $5M"/>
            </div>
            <div>
              <label className={labelClasses}>Website</label>
              <input type="text" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className={getInputClasses('website')} placeholder="Enter Website"/>
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
              <label className={labelClasses}>Country</label>
              <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value, state: '', city: ''})} className={getInputClasses('country')}>
                <option value="" disabled>Select Country</option>
                {Object.keys(locationData).map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClasses}>State</label>
              <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value, city: ''})} className={getInputClasses('state')} disabled={!formData.country}>
                <option value="" disabled>Select State</option>
                {availableStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClasses}>City</label>
              <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className={getInputClasses('city')} disabled={!formData.state}>
                <option value="" disabled>Select City</option>
                {availableCities.map((city: string) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
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
          <button type="button" onClick={() => router.push("/dashboard")} className="cursor-pointer px-6 py-2.5 bg-card text-foreground hover:bg-muted font-semibold transition-all">
            Cancel
          </button>
          <button type="submit" className="cursor-pointer px-6 py-2.5 bg-primary text-primary-foreground flex items-center gap-2 hover:bg-primary/90 font-semibold transition-all shadow-sm">
            <Save size={16} />
            Update Lead
          </button>
        </div>
      </form>
    </div>
  );
}
