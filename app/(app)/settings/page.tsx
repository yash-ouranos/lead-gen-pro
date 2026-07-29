import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { prisma } from"@/lib/prisma";
import { updateSettings } from"./actions";
import { redirect } from"next/navigation";
import { LoginButton } from"./login-button";

export default async function SettingsPage() {
 const session = await getServerSession(authOptions);

 if (!session?.user?.id) {
 return (
 <div className="max-w-2xl mx-auto mt-10 p-6 bg-card flex flex-col items-center justify-center min-h-[300px]">

 <LoginButton />
 </div>
 );
 }

 const user = await prisma.user.findUnique({
 where: { id: session.user.id },
 });

 return (
 <div className="w-full h-full flex flex-col bg-card animate-in fade-in duration-500 overflow-y-auto">
 <div className="flex-1 p-6 md:p-8">
 <form action={updateSettings} className="space-y-6">
 <div className="bg-slate-50 p-6 border border-slate-100">
 <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
 <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
 Data Scraping
 </h2>
 <div className="space-y-4">
 <div>
 <label htmlFor="apifyApiKey"className="block text-sm font-medium text-muted-foreground mb-1">Apify API Key</label>
 <input
 type="password"
 id="apifyApiKey"
 name="apifyApiKey"
 defaultValue={user?.apifyApiKey ||""}
 className="w-full px-4 py-2.5 bg-muted border-0 border-b border-border outline-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-inset focus:ring-primary focus:outline-none transition-all text-foreground text-sm shadow-sm"
 placeholder="apify_api_..."
 />
 <p className="mt-1 text-xs text-muted-foreground">Required to scrape Google Maps and basic details.</p>
 </div>
 
 <div>
 <label htmlFor="hunterApiKey"className="block text-sm font-medium text-muted-foreground mb-1">Hunter.io API Key (Optional)</label>
 <input
 type="password"
 id="hunterApiKey"
 name="hunterApiKey"
 defaultValue={user?.hunterApiKey ||""}
 className="w-full px-4 py-2.5 bg-muted border-0 border-b border-border outline-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-inset focus:ring-primary focus:outline-none transition-all text-foreground text-sm shadow-sm"
 placeholder="hunter_api_..."
 />
 <p className="mt-1 text-xs text-muted-foreground">Used to enrich leads with email addresses found on their domain.</p>
 </div>

 <div>
 <label htmlFor="apolloApiKey"className="block text-sm font-medium text-muted-foreground mb-1">Apollo.io API Key (Optional)</label>
 <input
 type="password"
 id="apolloApiKey"
 name="apolloApiKey"
 defaultValue={user?.apolloApiKey ||""}
 className="w-full px-4 py-2.5 bg-muted border-0 border-b border-border outline-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-inset focus:ring-primary focus:outline-none transition-all text-foreground text-sm shadow-sm"
 placeholder="apollo_api_..."
 />
 <p className="mt-1 text-xs text-muted-foreground">Fallback used to enrich leads with emails if Hunter fails.</p>
 </div>
 </div>
 </div>

 <div className="bg-slate-50 p-6 border border-slate-100">
 <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
 <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">2</span>
 AI Scoring Providers
 </h2>
 <p className="text-sm text-muted-foreground mb-4">We use a waterfall strategy (Claude &rarr; OpenAI &rarr; Gemini). Provide the keys you wish to use.</p>
 <div className="space-y-4">
 <div>
 <label htmlFor="anthropicApiKey"className="block text-sm font-medium text-muted-foreground mb-1">Anthropic API Key (Claude 3.5)</label>
 <input
 type="password"
 id="anthropicApiKey"
 name="anthropicApiKey"
 defaultValue={user?.anthropicApiKey ||""}
 className="w-full px-4 py-2.5 bg-muted border-0 border-b border-border outline-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-inset focus:ring-primary focus:outline-none transition-all text-foreground text-sm shadow-sm"
 placeholder="sk-ant-..."
 />
 </div>
 
 <div>
 <label htmlFor="openaiApiKey"className="block text-sm font-medium text-muted-foreground mb-1">OpenAI API Key (GPT-4o)</label>
 <input
 type="password"
 id="openaiApiKey"
 name="openaiApiKey"
 defaultValue={user?.openaiApiKey ||""}
 className="w-full px-4 py-2.5 bg-muted border-0 border-b border-border outline-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-inset focus:ring-primary focus:outline-none transition-all text-foreground text-sm shadow-sm"
 placeholder="sk-proj-..."
 />
 </div>

 <div>
 <label htmlFor="geminiApiKey"className="block text-sm font-medium text-muted-foreground mb-1">Google Gemini API Key</label>
 <input
 type="password"
 id="geminiApiKey"
 name="geminiApiKey"
 defaultValue={user?.geminiApiKey ||""}
 className="w-full px-4 py-2.5 bg-muted border-0 border-b border-border outline-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-inset focus:ring-primary focus:outline-none transition-all text-foreground text-sm shadow-sm"
 placeholder="AIzaSy..."
 />
 </div>
 </div>
 </div>

 <div className="pt-4 flex justify-end">
 <button
 type="submit"
 className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all shadow-sm"
 >
 Save Configuration
 </button>
 </div>
 </form>
 </div>
 </div>
 );
}
