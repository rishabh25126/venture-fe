"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ScreenLoader } from "@/components/app-loader"
import { NotFoundContent } from "@/components/not-found-content"
import { useAppSelector } from "@/lib/store/hooks"

export default function AdminAnalyticsPage() {
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth)
  const isAdmin = user?.baseRole === "admin" || user?.baseRole === "super_admin"
  const isOwner = user?.baseRole === "owner"
  const isManager = isAdmin || isOwner

  if (authLoading) {
    return (
      <DashboardLayout type="admin">
        <ScreenLoader
          title="Restoring session"
          description="Loading your management workspace."
          className="min-h-[70vh] bg-transparent"
        />
      </DashboardLayout>
    )
  }

  if (!isManager) {
    return <NotFoundContent />
  }

  return (
    <DashboardLayout
      type="admin"
      title="Analytics"
      subtitle="Performance and platform insights will live here."
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Analytics" },
      ]}
    >
      <div className="p-6 lg:p-8">
        <div className="gradient-card rounded-xl border border-border p-8">
          <h2 className="text-lg font-semibold text-foreground">
            Analytics workspace
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This section is reserved for performance, funnel, and business-group
            analytics once the reporting layer is expanded.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
