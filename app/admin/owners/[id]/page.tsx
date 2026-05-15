"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { notFound, useParams } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Ban, Plus } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ScreenLoader } from "@/components/app-loader"
import { Button } from "@/components/ui/button"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { NotFoundContent } from "@/components/not-found-content"
import { fetchAdminUserDetail, fetchManageableBusinesses } from "@/lib/management-data"
import { useAppSelector } from "@/lib/store/hooks"
import api from "@/lib/api"

export default function AdminOwnerDetailPage() {
  const params = useParams<{ id: string }>()
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth)
  const queryClient = useQueryClient()
  const [selectedBusinessId, setSelectedBusinessId] = useState("")
  const [pendingAction, setPendingAction] = useState<{
    title: string
    description: string
    confirmLabel: string
    action: () => void
  } | null>(null)
  const ownerId = params.id
  const isAdmin = user?.baseRole === "admin" || user?.baseRole === "super_admin"
  const canAssignOwner = Boolean(user?.permissions?.includes("owner.assign_business"))
  const canRevokeOwner = Boolean(user?.permissions?.includes("owner.revoke_business"))
  const canUpdateOwner = Boolean(user?.permissions?.includes("owner.update"))

  const { data, isLoading } = useQuery({
    queryKey: ["admin-user", ownerId],
    queryFn: () => fetchAdminUserDetail(ownerId),
    enabled: !authLoading && isAdmin,
  })

  const { data: businesses = [] } = useQuery({
    queryKey: ["admin-businesses"],
    queryFn: fetchManageableBusinesses,
    enabled: !authLoading && isAdmin,
  })

  const assignOwnerMutation = useMutation({
    mutationFn: async (businessId: string) => {
      await api.post("/owners/assign", { ownerId, businessId })
    },
    onSuccess: () => {
      setSelectedBusinessId("")
      queryClient.invalidateQueries({ queryKey: ["admin-user", ownerId] })
    },
  })

  const revokeOwnerMutation = useMutation({
    mutationFn: async (businessId: string) => {
      await api.delete("/owners/revoke", { data: { ownerId, businessId } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", ownerId] })
    },
  })

  const toggleUserStatusMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/admin/users/${ownerId}/deactivate`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", ownerId] })
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })

  const assignedBusinessIds = useMemo(
    () =>
      new Set((data?.ownerships || []).map((record: any) => record.businessId?._id)),
    [data?.ownerships]
  )

  const availableBusinesses = businesses.filter(
    (business: any) => !assignedBusinessIds.has(business._id)
  )

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

  if (!isAdmin) {
    return <NotFoundContent />
  }

  if (!isLoading && (!data?.user || data.user.role !== "owner")) {
    notFound()
  }

  const owner = data?.user
  const ownerships = data?.ownerships || []

  return (
    <DashboardLayout
      type="admin"
      title={owner?.name || "Owner"}
      subtitle={owner?.email || "Owner profile"}
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Owners", href: "/admin/owners" },
        { label: owner?.name || "Owner" },
      ]}
      actions={
        <Button
          variant="outline"
          disabled={!canUpdateOwner}
          onClick={() =>
            setPendingAction({
              title: owner?.isActive ? "Deactivate owner" : "Reactivate owner",
              description: owner?.isActive
                ? "This disables future sign-ins for the owner and clears session continuity."
                : "This restores account access for the owner.",
              confirmLabel: owner?.isActive ? "Deactivate" : "Reactivate",
              action: () => toggleUserStatusMutation.mutate(),
            })
          }
        >
          <Ban className="mr-2 h-4 w-4" />
          {owner?.isActive ? "Deactivate" : "Reactivate"}
        </Button>
      }
    >
      <div className="space-y-6 p-6 lg:p-8">
        {isLoading || !owner ? (
          <ScreenLoader
            title="Loading owner details"
            description="Preparing the owner record."
            compact
            className="bg-transparent"
          />
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="gradient-card rounded-xl border border-border p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Profile
                </h2>
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    Name
                    <span className="mt-1 block font-medium text-foreground">
                      {owner.name}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    Email
                    <span className="mt-1 block font-medium text-foreground">
                      {owner.email}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    Status
                    <span className="mt-1 block font-medium text-foreground">
                      {owner.isActive ? "Active" : "Inactive"}
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
                      {ownerships.length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Role Summary
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground">
                      Owners can manage only businesses assigned to them and the investors inside those businesses.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Account Status
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground">
                      {owner.isActive
                        ? "Active and available to manage assigned businesses."
                        : "Inactive. Sign-in access is currently disabled."}
                    </p>
                  </div>
                </div>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                  <select
                    value={selectedBusinessId}
                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                    className="h-10 flex-1 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
                  >
                    <option value="">Assign business...</option>
                    {availableBusinesses.map((business: any) => (
                      <option key={business._id} value={business._id}>
                        {business.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={() =>
                      setPendingAction({
                        title: "Assign business",
                        description:
                          "This will grant the owner management access to the selected business.",
                        confirmLabel: "Assign Business",
                        action: () => assignOwnerMutation.mutate(selectedBusinessId),
                      })
                    }
                    disabled={!selectedBusinessId || !canAssignOwner}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Business
                  </Button>
                </div>

                <div className="space-y-3">
                  {ownerships.map((record: any) => (
                    <div
                      key={record._id}
                      className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
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
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!canRevokeOwner}
                        onClick={() =>
                          setPendingAction({
                            title: "Revoke business access",
                            description:
                              "This will remove the owner from the selected business. At least one owner must remain.",
                            confirmLabel: "Revoke Access",
                            action: () =>
                              revokeOwnerMutation.mutate(record.businessId?._id),
                          })
                        }
                      >
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
        <ConfirmationDialog
          isOpen={Boolean(pendingAction)}
          onClose={() => setPendingAction(null)}
          onConfirm={() => {
            pendingAction?.action()
            setPendingAction(null)
          }}
          title={pendingAction?.title || "Confirm action"}
          description={pendingAction?.description || ""}
          confirmLabel={pendingAction?.confirmLabel || "Confirm"}
          isPending={
            assignOwnerMutation.isPending ||
            revokeOwnerMutation.isPending ||
            toggleUserStatusMutation.isPending
          }
        />
      </div>
    </DashboardLayout>
  )
}
