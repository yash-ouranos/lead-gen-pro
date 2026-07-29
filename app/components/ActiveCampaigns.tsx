import { Search, Renew, Flash } from"@carbon/icons-react";
import { Campaign } from"@prisma/client";

interface ActiveCampaignsProps {
 campaigns: Campaign[];
}

export default function ActiveCampaigns({ campaigns }: ActiveCampaignsProps) {
 if (campaigns.length === 0) return null;

 return (
 <div className="bg-blue-50 border border-blue-100 p-6 shadow-sm">
 <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
 <Renew className="w-5 h-5 animate-spin text-blue-600"/>
 Active Campaigns ({campaigns.length})
 </h2>
 <div className="space-y-3">
 {campaigns.map((campaign) => (
 <div key={campaign.id} className="bg-white p-4 border border-blue-100 flex items-center justify-between shadow-sm transition-all hover:shadow-md">
 <div>
 <p className="font-medium text-gray-900">{campaign.niche}</p>
 <p className="text-sm text-gray-500">{campaign.location}</p>
 </div>
 
 <div className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50/50 px-4 py-2 rounded-full border border-blue-100">
 {campaign.status ==="SCRAPING"&& (
 <>
 <Search className="w-4 h-4 animate-pulse"/>
 Scraping Google Maps...
 </>
 )}
 {campaign.status ==="SCORING"&& (
 <>
 <Flash className="w-4 h-4 animate-pulse"/>
 Scoring & Enriching Leads...
 </>
 )}
 {campaign.status ==="PENDING"&& (
 <>
 <Renew className="w-4 h-4 animate-spin"/>
 Starting up...
 </>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}
