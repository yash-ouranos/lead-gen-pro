"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createCampaign } from "./actions";
import { Earth, Renew, Portfolio, CloudDataOps, Search, Information, ArrowLeft, CharacterPatterns } from "@carbon/icons-react";
import toast from "react-hot-toast";

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

export default function NewCampaignPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [maxLeads, setMaxLeads] = useState("50");

  const availableStates = selectedCountry ? Object.keys(locationData[selectedCountry] || {}) : [];
  const availableCities = selectedState && selectedCountry ? locationData[selectedCountry][selectedState] || [] : [];

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const newErrors: Record<string, string> = {};

    if (!formData.get("niche")) newErrors.niche = "Business Niche / Field is required.";
    if (!formData.get("country")) newErrors.country = "Country is required.";
    if (!formData.get("state")) newErrors.state = "State / Province is required.";
    if (!formData.get("city")) newErrors.city = "City is required.";
    if (!formData.get("maxLeads")) newErrors.maxLeads = "Maximum Leads is required.";

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    const result = await createCampaign(formData);

    if (result.error) {
      toast.error(result.error);
      setError(result.error);
      setIsSubmitting(false);
    } else {
      toast.success("Scraping campaign launched!");
      router.push("/campaigns");
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-card animate-in fade-in duration-500 overflow-y-auto">
      <div className="flex-none p-6 md:p-8 border-b border-border flex justify-between items-center bg-card sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Launch Scraping Campaign</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure AI to search the web for your ideal leads.</p>
        </div>
        <Link 
          href="/campaigns"
          className="flex items-center px-4 py-2 border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Link>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 border-b border-destructive/20 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex-1 p-6 md:p-8 max-w-4xl mx-auto w-full" noValidate>
        <div className="space-y-8">
          
          {/* Target Audience */}
          <div>
            <h2 className="text-lg font-semibold border-b border-border pb-2 mb-6 flex items-center gap-2 text-foreground">
              <Portfolio className="text-primary" size={20} /> 
              Target Audience
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="niche" className="block text-[13px] text-foreground mb-1.5 flex items-center gap-1.5">
                  Business Niche / Field
                </label>
                <select
                  id="niche"
                  name="niche"
                  defaultValue=""
                  className={`w-full px-4 py-2.5 bg-muted border-0 border-b outline-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:outline-none transition-colors text-foreground text-sm shadow-sm appearance-none ${fieldErrors.niche ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23737373%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                >
                  <option value="" disabled>Select a niche...</option>
                  <option value="Dental Clinics">Dental Clinics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Plumbers">Plumbers</option>
                  <option value="Roofers">Roofers</option>
                  <option value="Real Estate Agents">Real Estate Agents</option>
                  <option value="Restaurants">Restaurants</option>
                  <option value="Gyms">Gyms</option>
                  <option value="Law Firms">Law Firms</option>
                  <option value="Accountants">Accountants</option>
                  <option value="Salons">Salons</option>
                </select>
                {fieldErrors.niche && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.niche}</p>}
              </div>
            </div>
          </div>

          {/* Location Targeting */}
          <div>
            <h2 className="text-lg font-semibold border-b border-border pb-2 mb-6 flex items-center gap-2 text-foreground">
              <Earth className="text-primary" size={20} /> 
              Location Targeting
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="country" className="block text-[13px] text-foreground mb-1.5 flex items-center gap-1.5">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setSelectedState("");
                    setSelectedCity("");
                  }}
                  className={`w-full px-4 py-2.5 bg-muted border-0 border-b outline-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:outline-none transition-colors text-foreground text-sm shadow-sm appearance-none ${fieldErrors.country ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23737373%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                >
                  <option value="" disabled>Select a country...</option>
                  {Object.keys(locationData).map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                {fieldErrors.country && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.country}</p>}
              </div>

              <div>
                <label htmlFor="state" className="block text-[13px] text-foreground mb-1.5 flex items-center gap-1.5">
                  State / Province
                </label>
                <select
                  id="state"
                  name="state"
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedCity("");
                  }}
                  disabled={!selectedCountry}
                  className={`w-full px-4 py-2.5 bg-muted border-0 border-b outline-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:outline-none transition-colors text-foreground text-sm shadow-sm appearance-none disabled:opacity-50 disabled:bg-muted ${fieldErrors.state ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23737373%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                >
                  <option value="" disabled>Select a state/province...</option>
                  {availableStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {fieldErrors.state && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.state}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="city" className="block text-[13px] text-foreground mb-1.5 flex items-center gap-1.5">
                  City
                </label>
                <select
                  id="city"
                  name="city"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedState}
                  className={`w-full px-4 py-2.5 bg-muted border-0 border-b outline-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:outline-none transition-colors text-foreground text-sm shadow-sm appearance-none disabled:opacity-50 disabled:bg-muted ${fieldErrors.city ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23737373%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                >
                  <option value="" disabled>Select a city...</option>
                  {availableCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {fieldErrors.city && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.city}</p>}
              </div>
            </div>
          </div>

          {/* Scraping Limits */}
          <div>
            <h2 className="text-lg font-semibold border-b border-border pb-2 mb-6 flex items-center gap-2 text-foreground">
              <CharacterPatterns className="text-primary" size={20} /> 
              Scraping Limits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="maxLeads" className="block text-[13px] text-foreground mb-1.5 flex items-center gap-1.5">
                  Maximum Leads to Scrape
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="maxLeads"
                    name="maxLeads"
                    value={maxLeads}
                    onChange={(e) => setMaxLeads(e.target.value)}
                    min="1"
                    max="500"
                    className={`w-full px-4 py-2.5 bg-muted border-0 border-b outline-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:outline-none transition-colors text-foreground text-sm shadow-sm ${fieldErrors.maxLeads ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                    placeholder="e.g. 50"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-muted-foreground text-sm font-medium">
                    Leads
                  </div>
                </div>
                {fieldErrors.maxLeads && <p className="text-red-500 text-xs mt-1.5">{fieldErrors.maxLeads}</p>}
                {!fieldErrors.maxLeads && <p className="text-xs text-muted-foreground mt-2">Maximum number of businesses Apify will crawl. Recommended: 50-100 per campaign.</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Renew className="animate-spin" size={16} />
                Deploying AI Agents...
              </>
            ) : (
              <>
                <Search size={16} />
                Launch Scraping Campaign
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
