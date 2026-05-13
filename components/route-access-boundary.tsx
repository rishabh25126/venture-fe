"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NotFoundContent } from "@/components/not-found-content";
import { getDashboardHref, isRouteAllowed } from "@/lib/auth/route-access";
import { useAppSelector } from "@/lib/store/hooks";

export function RouteAccessBoundary({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const { allowed, routeKind } = isRouteAllowed(pathname, user);

  useEffect(() => {
    if (pathname === "/login" && isAuthenticated && user) {
      router.replace(getDashboardHref(user.role));
    }
  }, [isAuthenticated, pathname, router, user]);

  if (pathname === "/login" && isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          Restoring session...
        </div>
      </main>
    );
  }

  if (pathname === "/login" && isAuthenticated && user) {
    return (
      <main className="min-h-screen bg-background">
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          Redirecting to dashboard...
        </div>
      </main>
    );
  }

  if ((routeKind === "investor" || routeKind === "manager") && isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          Restoring session...
        </div>
      </main>
    );
  }

  if (!allowed) {
    return <NotFoundContent />;
  }

  return <>{children}</>;
}
