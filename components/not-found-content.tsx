"use client"

import Link from "next/link"
import { Compass, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppSelector } from "@/lib/store/hooks"
import { getDashboardHref } from "@/lib/auth/route-access"

export function NotFoundContent() {
  const { user } = useAppSelector((state) => state.auth)
  const dashboardHref = user ? getDashboardHref(user.role) : null

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-primary">
          <Compass className="h-8 w-8" />
        </div>
        <h1 className="mb-3 text-3xl font-bold text-foreground">
          Page not found
        </h1>
        <p className="mb-8 max-w-xl text-muted-foreground">
          The page you tried to open does not exist or is not available for your
          account.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Link>
          </Button>
          {dashboardHref && (
            <Button variant="outline" asChild>
              <Link href={dashboardHref}>Open Dashboard</Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}
