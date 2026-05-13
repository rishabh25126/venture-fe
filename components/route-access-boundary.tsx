"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ScreenLoader } from "@/components/app-loader";
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
    return <ScreenLoader title="Restoring session" description="Checking your account access." />;
  }

  if (pathname === "/login" && isAuthenticated && user) {
    return <ScreenLoader title="Redirecting" description="Taking you to your dashboard." />;
  }

  if ((routeKind === "investor" || routeKind === "manager") && isLoading) {
    return <ScreenLoader title="Restoring session" description="Checking your account access." />;
  }

  if (!allowed) {
    return <NotFoundContent />;
  }

  return <>{children}</>;
}
