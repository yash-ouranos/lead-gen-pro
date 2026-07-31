import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RequireAuth from "@/app/components/RequireAuth";
import { SidebarProvider } from "@/app/contexts/SidebarContext";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { Toaster } from "react-hot-toast";

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
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Toaster position="top-right" />
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/30">
            <RequireAuth>
              {children}
            </RequireAuth>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
