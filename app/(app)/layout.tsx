import Sidebar from"@/app/components/Sidebar";
import Header from"@/app/components/Header";
import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { redirect } from"next/navigation";

export default async function AppLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const session = await getServerSession(authOptions);

 if (!session?.user) {
 redirect("/login");
 }

 return (
 <div className="flex h-screen bg-background text-foreground overflow-hidden">
 <Sidebar />
 <div className="flex flex-col flex-1 overflow-hidden">
 <Header />
 <main className="flex-1 overflow-y-auto p-4 md:p-6">
 {children}
 </main>
 </div>
 </div>
 );
}
