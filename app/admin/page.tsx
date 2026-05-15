"use client"

import Link from "next/link"
import { Building2, Clock, FileText, TrendingUp, Users } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ScreenLoader } from "@/components/app-loader"
import { Button } from "@/components/ui/button"
import { NotFoundContent } from "@/components/not-found-content"
import { cn } from "@/lib/utils"
import { useAppSelector } from "@/lib/store/hooks"
import {
  fetchAdminRequests,
  fetchAdminUsers,
  fetchManageableBusinesses,
} from "@/lib/management-data"

const DEFAULT_REQUEST_STATUSES = ["PENDING", "REVIEWING"] as const

export default function AdminHomePage() {
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth)
  const isAdmin = user?.baseRole === "admin" || user?.baseRole === "super_admin"
  const isOwner = user?.baseRole === "owner"
  const isManager = isAdmin || isOwner

  const { data: businesses = [] } = useQuery({
    queryKey: ["admin-businesses"],
    queryFn: fetchManageableBusinesses,
    enabled: !authLoading && isManager,
  })

  const { data: usersData } = useQuery({
    queryKey: ["admin-users", isAdmin ? "all" : "investor"],
    queryFn: () => fetchAdminUsers(isAdmin ? "all" : "investor"),
    enabled: !authLoading && isManager,
  })

  const { data: requestsData } = useQuery({
    queryKey: ["admin-requests-home"],
    queryFn: () =>
      fetchAdminRequests({
        statuses: DEFAULT_REQUEST_STATUSES.join(","),
        sort: "oldest",
        page: 1,
        pageSize: 10,
      }),
    enabled: !authLoading && isManager,
  })

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

  const visibleUsers = usersData?.users || []
  const requestSummary = requestsData?.summary || {
    PENDING: 0,
    REVIEWING: 0,
    REJECTED: 0,
    ACCEPTED: 0,
  }
  const openRequests = requestSummary.PENDING + requestSummary.REVIEWING

  return (
    <DashboardLayout
      type="admin"
      title="Home"
      subtitle={
        isAdmin
          ? "Manage businesses, owners, investors, and request reviews."
          : "Manage your assigned businesses and the investor activity around them."
      }
      breadcrumbItems={[{ label: "Admin" }, { label: "Home" }]}
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href="/admin/businesses">View Businesses</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/requests">Open Requests</Link>
          </Button>
        </>
      }
    >
      <div className="space-y-8 p-6 lg:p-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "Managed Businesses",
              value: businesses.length.toString(),
              icon: Building2,
              color: "text-primary",
            },
            {
              label: "Visible Users",
              value: visibleUsers.length.toString(),
              icon: Users,
              color: "text-[#10B981]",
            },
            {
              label: "Documents",
              value: "234",
              icon: FileText,
              color: "text-[#F59E0B]",
            },
            {
              label: "Open Requests",
              value: openRequests.toString(),
              icon: Clock,
              color: "text-[#EF4444]",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="gradient-card rounded-xl border border-border p-5"
            >
              <stat.icon className={cn("mb-3 h-5 w-5", stat.color)} />
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="gradient-card rounded-xl border border-border p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Platform Summary
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Managed businesses:{" "}
                <span className="font-medium text-foreground">
                  {businesses.length}
                </span>
              </p>
              <p>
                Visible users:{" "}
                <span className="font-medium text-foreground">
                  {visibleUsers.length}
                </span>
              </p>
              <p>
                Open request reviews:{" "}
                <span className="font-medium text-foreground">{openRequests}</span>
              </p>
            </div>
          </div>

          <div className="gradient-card rounded-xl border border-border p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Current Access Model
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                {isAdmin
                  ? "Admins can create owners, investors, and businesses."
                  : "Owners can view and edit only assigned businesses."}
              </p>
              <p>Businesses must have at least one owner at creation.</p>
              <p>Investor assignment requires a positive invested amount.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
