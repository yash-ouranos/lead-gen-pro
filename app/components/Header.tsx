import { UserDropdown } from"./UserDropdown";
import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/auth";
import { Search, Menu, Notification } from"@carbon/icons-react";
import HeaderTitle from "./HeaderTitle";

export default async function Header() {
  const session = await getServerSession(authOptions);

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-6 shrink-0 z-10 sticky top-0 transition-all duration-300">
      <button className="md:hidden p-2 -ml-2 hover:bg-accent text-muted-foreground transition-colors">
        <Menu className="h-5 w-5"/>
      </button>
      
      <HeaderTitle />
 
 <div className="flex items-center gap-4 ml-auto">
 <button className="relative p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors group">
 <Notification className="h-5 w-5 group-hover:text-foreground transition-colors"/>
 <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
 <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
 </span>
 </button>
 <div className="h-5 w-[1px] bg-border mx-1"></div>
 {session?.user && (
 <UserDropdown user={session.user} />
 )}
 </div>
 </header>
 );
}
