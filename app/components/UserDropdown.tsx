"use client";

import * as React from"react";
import * as DropdownMenuPrimitive from"@radix-ui/react-dropdown-menu";
import { Logout, User as UserIcon } from"@carbon/icons-react";
import { signOut } from"next-auth/react";
import { cn } from"@/lib/utils";

export function UserDropdown({ user }: { user: { name?: string | null, email?: string | null, image?: string | null } }) {
 const [imageError, setImageError] = React.useState(false);
 const initials = user.name ? user.name.substring(0, 2).toUpperCase() : <UserIcon size={16} />;

 return (
 <DropdownMenuPrimitive.Root>
 <DropdownMenuPrimitive.Trigger asChild>
 <button className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 overflow-hidden border border-purple-200">
 {user.image && !imageError ? (
 <img 
 src={user.image} 
 alt={user.name ||"User"} 
 className="h-full w-full object-cover"
 onError={() => setImageError(true)}
 referrerPolicy="no-referrer"
 />
 ) : (
 initials
 )}
 </button>
 </DropdownMenuPrimitive.Trigger>

 <DropdownMenuPrimitive.Portal>
 <DropdownMenuPrimitive.Content
 align="end"
 sideOffset={8}
 className={cn(
"z-50 min-w-[8rem] overflow-hidden border bg-white p-1 text-gray-700 shadow-md animate-in fade-in-80 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
 )}
 >
 <div className="px-2 py-1.5 text-sm font-medium border-b mb-1">
 <p className="truncate text-gray-900">{user.name}</p>
 <p className="truncate text-xs text-gray-500 font-normal">{user.email}</p>
 </div>
 
 <DropdownMenuPrimitive.Item
 onClick={() => signOut({ callbackUrl:"/"})}
 className="flex cursor-pointer select-none items-center px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-red-600 hover:text-red-700"
 >
 <Logout className="mr-2 h-4 w-4"/>
 <span>Log out</span>
 </DropdownMenuPrimitive.Item>
 </DropdownMenuPrimitive.Content>
 </DropdownMenuPrimitive.Portal>
 </DropdownMenuPrimitive.Root>
 );
}
