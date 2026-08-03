import { useSession } from "next-auth/react";

export function usePermissions() {
  const { data: session } = useSession();

  const hasPermission = (permissionId: string) => {
    if (!session?.user) return false;
    if ((session.user as any).role?.name === "ADMIN") return true;
    if ((session.user as any).role?.permissions?.includes("ALL")) return true;
    return (session.user as any).role?.permissions?.includes(permissionId) || false;
  };

  return { hasPermission, session };
}
