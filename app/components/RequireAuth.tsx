"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If the user navigates back to a private page after logging out, 
    // the client-side session will evaluate to "unauthenticated"
    // and force them back to the login page.
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  return <>{children}</>;
}
