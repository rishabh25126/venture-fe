"use client"

import Link from "next/link"
import { ArrowUpRight, Building2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ScreenLoader } from "@/components/app-loader"
import { Button } from "@/components/ui/button"
import { NotFoundContent } from "@/components/not-found-content"
import { useAppSelector } from "@/lib/store/hooks"
import api from "@/lib/api"

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth)

  const { data: portfolioBusinesses = [], isLoading } = useQuery({
    queryKey: ["my-businesses"],
    queryFn: async () => {
      const res = await api.get("/access/my-businesses")
      return res.data.data.businesses.map((record: any) => ({
        id: record.business._id,
        slug: record.business.slug,
        name: record.business.name,
        tagline: record.business.tagline,
        sector: record.business.sector,
        stage: record.business.stage,
        investedAmount: record.investedAmount,
        equityPercentage: record.equityPercentage,
        logo: record.business.logo || "🏢",
      }))
    },
    enabled: !authLoading && user?.baseRole === "investor",
  })

  if (authLoading) {
    return (
      <DashboardLayout type="investor">
        <ScreenLoader
          title="Restoring session"
          description="Loading your investor workspace."
          className="min-h-[70vh] bg-transparent"
        />
      </DashboardLayout>
    )
  }

  if (user?.baseRole !== "investor") {
    return <NotFoundContent />
  }

  return (
    <DashboardLayout
      type="investor"
      title="Home"
      subtitle="Review the businesses you are invested in and open each one for full details."
      breadcrumbItems={[{ label: "Investor" }, { label: "Home" }]}
    >
      <div className="space-y-6 p-6 lg:p-8">
        {isLoading ? (
          <ScreenLoader
            title="Loading businesses"
            description="Preparing your invested business list."
            compact
            className="bg-transparent"
          />
        ) : portfolioBusinesses.length === 0 ? (
          <div className="gradient-card rounded-xl border border-border p-12 text-center">
            <h2 className="text-lg font-semibold text-foreground">
              No invested businesses yet
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Once an investment is assigned, it will appear here as your signed-in
              home view.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            {portfolioBusinesses.map((business: any) => (
              <div
                key={business.id}
                className="gradient-card rounded-xl border border-border p-6"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-2xl">
                      {business.logo}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        {business.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {business.tagline}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase text-primary">
                    {business.stage}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Business Group
                    </p>
                    <p className="mt-1 font-medium text-foreground">
                      {business.sector}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Invested Amount
                    </p>
                    <p className="mt-1 font-medium text-foreground">
                      ₹{Number(business.investedAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Equity
                    </p>
                    <p className="mt-1 font-medium text-foreground">
                      {business.equityPercentage || 0}%
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <Button className="w-full" asChild>
                    <Link href={`/dashboard/businesses/${business.slug}`}>
                      View Business Details
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
