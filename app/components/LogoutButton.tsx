"use client";

import { signOut } from"next-auth/react";

export default function LogoutButton() {
 return (
 <button 
 onClick={() => signOut({ callbackUrl:"/settings"})}
 className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5"
 >
 Logout
 </button>
 );
}
