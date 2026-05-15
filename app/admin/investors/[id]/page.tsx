"use client"

import Link from "next/link"
import { useState } from "react"
import { notFound, useParams } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Ban, Plus } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ScreenLoader } from "@/components/app-loader"
import { Button } from "@/components/ui/button"
import { NotFoundContent } from "@/components/not-found-content"
import { AssignEquityDialog } from "@/components/assign-equity-dialog"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { fetchAdminUserDetail } from "@/lib/management-data"
import { useAppSelector } from "@/lib/store/hooks"
import api from "@/lib/api"

export default function AdminInvestorDetailPage() {
  const params = useParams<{ id: string }>()
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth)
  const queryClient = useQueryClient()
  const [isAssignEquityOpen, setIsAssignEquityOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<{
    businessId?: string
    investedAmount?: number
    shares?: number
    equityPercentage?: number
  } | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [pendingRevoke, setPendingRevoke] = useState<{
    businessId: string
    businessName: string
  } | null>(null)
  const isAdmin = user?.baseRole === "admin" || user?.baseRole === "super_admin"
  const isOwner = user?.baseRole === "owner"
  const isManager = isAdmin || isOwner
  const investorId = params.id

  const { data, isLoading } = useQuery({
    queryKey: ["admin-user", investorId],
    queryFn: () => fetchAdminUserDetail(investorId),
    enabled: !authLoading && isManager,
  })

  const toggleUserStatusMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/admin/users/${investorId}/deactivate`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", investorId] })
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })

  const revokeAccessMutation = useMutation({
    mutationFn: async ({ businessId }: { businessId: string }) => {
      await api.delete("/access/revoke", {
        data: {
          investorId,
          businessId,
        },
      })
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", investorId] })
      queryClient.invalidateQueries({
        queryKey: ["business-investors", variables.businessId],
      })
    },
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

  if (!isLoading && (!data?.user || data.user.role !== "investor")) {
    notFound()
  }

  const investor = data?.user
  const investments = data?.investments || []

  return (
    <DashboardLayout
      type="admin"
      title={investor?.name || "Investor"}
      subtitle={investor?.email || "Investor profile"}
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Investors", href: "/admin/investors" },
        { label: investor?.name || "Investor" },
      ]}
      actions={
        <>
          <Button onClick={() => setIsAssignEquityOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Assign Equity
          </Button>
          {isAdmin ? (
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(true)}
            >
              <Ban className="mr-2 h-4 w-4" />
              {investor?.isActive ? "Deactivate" : "Reactivate"}
            </Button>
          ) : undefined}
        </>
      }
    >
      <div className="space-y-6 p-6 lg:p-8">
        <AssignEquityDialog
          isOpen={isAssignEquityOpen}
          onClose={() => {
            setIsAssignEquityOpen(false)
            setSelectedAssignment(null)
          }}
          preselectedInvestorId={investorId}
          preselectedBusinessId={selectedAssignment?.businessId}
          initialValues={selectedAssignment || undefined}
          lockInvestor
          lockBusiness={Boolean(selectedAssignment?.businessId)}
          title={selectedAssignment ? "Edit Equity" : "Assign Equity"}
          description={
            selectedAssignment
              ? "Update the investor allocation for this business."
              : "Grant this investor access and equity in a business."
          }
          submitLabel={selectedAssignment ? "Save Equity" : "Assign Equity"}
        />

        {isLoading || !investor ? (
          <ScreenLoader
            title="Loading investor details"
            description="Preparing the investor record."
            compact
            className="bg-transparent"
          />
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="gradient-card rounded-xl border border-border p-6 lg:col-span-1">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Profile
                </h2>
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    Name
                    <span className="mt-1 block font-medium text-foreground">
                      {investor.name}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    Email
                    <span className="mt-1 block font-medium text-foreground">
                      {investor.email}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    Status
                    <span className="mt-1 block font-medium text-foreground">
                      {investor.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="gradient-card rounded-xl border border-border p-6 lg:col-span-2">
                <div className="mb-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-border bg-background/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Businesses
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {investments.length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Total Invested
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      ₹
                      {investments
                        .reduce(
                          (sum: number, record: any) =>
                            sum + Number(record.investedAmount || 0),
                          0
                        )
                        .toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Access Summary
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground">
                      {investor.isActive
                        ? "Active investor with access to assigned business records."
                        : "Inactive investor. Sign-in access is currently disabled."}
                    </p>
                  </div>
                </div>
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Business Assignments
                </h2>
                <div className="space-y-3">
                  {investments.map((record: any) => (
                    <div
                      key={record._id}
                      className="rounded-lg border border-border p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <Link
                            href={`/admin/businesses/${record.businessId?._id}`}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {record.businessId?.name || "Unknown Business"}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {record.businessId?.tagline || ""}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {record.equityPercentage || 0}%
                        </p>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                        <p>
                          Invested: ₹
                          {Number(record.investedAmount || 0).toLocaleString()}
                        </p>
                        <p>Shares: {Number(record.shares || 0).toLocaleString()}</p>
                        <p>
                          Granted by: {record.grantedBy?.name || "Unknown user"}
                        </p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAssignment({
                              businessId: record.businessId?._id,
                              investedAmount: Number(record.investedAmount || 0),
                              shares: Number(record.shares || 0),
                              equityPercentage: Number(record.equityPercentage || 0),
                            })
                            setIsAssignEquityOpen(true)
                          }}
                        >
                          Edit Equity
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPendingRevoke({
                              businessId: record.businessId?._id,
                              businessName:
                                record.businessId?.name || "this business",
                            })
                          }}
                        >
                          Revoke Access
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
        <ConfirmationDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => {
            toggleUserStatusMutation.mutate()
            setIsConfirmOpen(false)
          }}
          title={investor?.isActive ? "Deactivate investor" : "Reactivate investor"}
          description={
            investor?.isActive
              ? "This disables future sign-ins for the investor and clears session continuity."
              : "This restores account access for the investor."
          }
          confirmLabel={investor?.isActive ? "Deactivate" : "Reactivate"}
          isPending={toggleUserStatusMutation.isPending}
        />
        <ConfirmationDialog
          isOpen={Boolean(pendingRevoke)}
          onClose={() => setPendingRevoke(null)}
          onConfirm={() => {
            if (!pendingRevoke) return
            revokeAccessMutation.mutate({ businessId: pendingRevoke.businessId })
            setPendingRevoke(null)
          }}
          title="Revoke investor access"
          description={
            pendingRevoke
              ? `This removes the investor's access and equity allocation from ${pendingRevoke.businessName}.`
              : ""
          }
          confirmLabel="Revoke Access"
          isPending={revokeAccessMutation.isPending}
        />
      </div>
    </DashboardLayout>
  )
}
