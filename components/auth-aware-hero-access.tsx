"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/lib/store/hooks";
import { getDashboardHref } from "@/lib/auth/route-access";

export function AuthAwareHeroAccess() {
  const { user, isLoading } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return <div className="h-12 w-full rounded-md border border-border sm:w-[160px]" aria-hidden="true" />;
  }

  if (user) {
    return (
      <Button size="lg" variant="outline" className="h-12 px-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
        <Link href={getDashboardHref(user.role)}>Open Dashboard</Link>
      </Button>
    );
  }

  return (
    <Button size="lg" variant="outline" className="h-12 px-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
      <Link href="/login">Investor Login</Link>
    </Button>
  );
}
