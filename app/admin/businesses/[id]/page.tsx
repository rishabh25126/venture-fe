"use client"

import Link from "next/link"
import { useState } from "react"
import { notFound, useParams } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Edit, Eye, EyeOff, Plus, Trash2 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ScreenLoader } from "@/components/app-loader"
import { Button } from "@/components/ui/button"
import { NotFoundContent } from "@/components/not-found-content"
import { CreateEditBusinessDialog } from "@/components/create-edit-business-dialog"
import { CreateUserDialog } from "@/components/create-user-dialog"
import { AssignEquityDialog } from "@/components/assign-equity-dialog"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { useAppSelector } from "@/lib/store/hooks"
import {
  fetchAdminUsers,
  fetchBusinessInvestors,
  fetchBusinessOwners,
  fetchManageableBusiness,
} from "@/lib/management-data"
import api from "@/lib/api"

export default function AdminBusinessDetailPage() {
  const params = useParams<{ id: string }>()
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth)
  const queryClient = useQueryClient()
  const [isEditBusinessOpen, setIsEditBusinessOpen] = useState(false)
  const [isCreateInvestorOpen, setIsCreateInvestorOpen] = useState(false)
  const [isAssignEquityOpen, setIsAssignEquityOpen] = useState(false)
  const [selectedOwnerId, setSelectedOwnerId] = useState("")
  const [selectedAssignment, setSelectedAssignment] = useState<{
    investorId?: string
    investedAmount?: number
    shares?: number
    equityPercentage?: number
  } | null>(null)
  const [pendingAction, setPendingAction] = useState<{
    title: string
    description: string
    confirmLabel: string
    confirmVariant?: "default" | "destructive" | "outline"
    action: () => void
  } | null>(null)

  const isAdmin = user?.baseRole === "admin" || user?.baseRole === "super_admin"
  const isOwner = user?.baseRole === "owner"
  const isManager = isAdmin || isOwner
  const canAssignEquity = Boolean(user?.permissions?.includes("investor.assign_equity"))
  const canRevokeEquity = Boolean(user?.permissions?.includes("investor.revoke_equity"))
  const canCreateInvestor = Boolean(user?.permissions?.includes("investor.create"))
  const canUpdateBusiness = Boolean(user?.permissions?.includes("business.update"))
  const canPublishBusiness = Boolean(user?.permissions?.includes("business.publish"))
  const canDeleteBusiness = Boolean(user?.permissions?.includes("business.delete"))
  const canAssignOwner = Boolean(user?.permissions?.includes("owner.assign_business"))
  const canRevokeOwner = Boolean(user?.permissions?.includes("owner.revoke_business"))
  const businessId = params.id

  const { data: businessData, isLoading } = useQuery({
    queryKey: ["manageable-business", businessId],
    queryFn: () => fetchManageableBusiness(businessId),
    enabled: !authLoading && isManager,
  })

  const { data: investors = [] } = useQuery({
    queryKey: ["business-investors", businessId],
    queryFn: () => fetchBusinessInvestors(businessId),
    enabled: !authLoading && isManager,
  })

  const { data: owners = [] } = useQuery({
    queryKey: ["business-owners", businessId],
    queryFn: () => fetchBusinessOwners(businessId),
    enabled: !authLoading && isManager,
  })

  const { data: ownersData } = useQuery({
    queryKey: ["admin-owners"],
    queryFn: () => fetchAdminUsers("owner"),
    enabled: !authLoading && isAdmin,
  })

  const ownerOptions = ownersData?.owners || []
  const business = businessData?.business

  const assignOwnerMutation = useMutation({
    mutationFn: async (ownerId: string) => {
      await api.post("/owners/assign", { ownerId, businessId })
    },
    onSuccess: () => {
      setSelectedOwnerId("")
      queryClient.invalidateQueries({ queryKey: ["business-owners", businessId] })
      queryClient.invalidateQueries({
        queryKey: ["manageable-business", businessId],
      })
    },
  })

  const revokeOwnerMutation = useMutation({
    mutationFn: async (ownerId: string) => {
      await api.delete("/owners/revoke", { data: { ownerId, businessId } })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-owners", businessId] })
      queryClient.invalidateQueries({
        queryKey: ["manageable-business", businessId],
      })
    },
  })

  const togglePublishMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/businesses/${businessId}/publish`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["manageable-business", businessId],
      })
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] })
    },
  })

  const deleteBusinessMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/businesses/${businessId}`)
    },
    onSuccess: () => {
      window.location.href = "/admin/businesses"
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

  if (!isLoading && !business) {
    notFound()
  }

  return (
    <DashboardLayout
      type="admin"
      title={business?.name || "Business"}
      subtitle={business?.tagline || "Business profile"}
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Businesses", href: "/admin/businesses" },
        { label: business?.name || "Business" },
      ]}
      actions={
        <>
          <Button
            variant="outline"
            onClick={() => setIsAssignEquityOpen(true)}
            disabled={!business || !canAssignEquity}
          >
            <Plus className="mr-2 h-4 w-4" />
            Assign Equity
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsCreateInvestorOpen(true)}
            disabled={!canCreateInvestor}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Investor
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditBusinessOpen(true)}
            disabled={!canUpdateBusiness}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Business
          </Button>
        </>
      }
    >
      <div className="space-y-6 p-6 lg:p-8">
        <CreateEditBusinessDialog
          isOpen={isEditBusinessOpen}
          onClose={() => setIsEditBusinessOpen(false)}
          businessId={businessId}
          currentUserRole={isAdmin ? "admin" : "owner"}
          canManageOwners={isAdmin}
        />
        <CreateUserDialog
          isOpen={isCreateInvestorOpen}
          onClose={() => setIsCreateInvestorOpen(false)}
          currentUserRole={isAdmin ? "admin" : "owner"}
          forcedRole="investor"
          allowOwnerCreation={false}
        />
        <AssignEquityDialog
          isOpen={isAssignEquityOpen}
          onClose={() => {
            setIsAssignEquityOpen(false)
            setSelectedAssignment(null)
          }}
          preselectedBusinessId={businessId}
          preselectedInvestorId={selectedAssignment?.investorId}
          initialValues={selectedAssignment || undefined}
          lockBusiness
          lockInvestor={Boolean(selectedAssignment?.investorId)}
          title={selectedAssignment ? "Edit Equity" : "Assign Equity"}
          description={
            selectedAssignment
              ? "Update the investor allocation for this business."
              : "Grant an investor access and equity in this business."
          }
          submitLabel={selectedAssignment ? "Save Equity" : "Assign Equity"}
        />

        {isLoading || !business ? (
          <ScreenLoader
            title="Loading business details"
            description="Preparing the management view."
            compact
            className="bg-transparent"
          />
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="gradient-card rounded-xl border border-border p-6 lg:col-span-2">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Business Overview
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Business Group
                    </p>
                    <p className="mt-1 font-medium text-foreground">
                      {business.sector}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stage</p>
                    <p className="mt-1 font-medium text-foreground">
                      {business.stage}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Capital Ask</p>
                    <p className="mt-1 font-medium text-foreground">
                      ₹{Number(business.fundingAsk || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="mt-1 font-medium text-foreground">
                      {business.isPublished ? "Published" : "Draft"}
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="mt-1 text-sm text-foreground">
                      {business.description || "No description available."}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Use of Funds
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {business.useOfFunds || "No funding allocation notes yet."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="gradient-card rounded-xl border border-border p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Actions
                </h2>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={!canPublishBusiness}
                    onClick={() =>
                      setPendingAction({
                        title: business.isPublished
                          ? "Unpublish business"
                          : "Publish business",
                        description: business.isPublished
                          ? "This will hide the business from public listings and move it back to draft."
                          : "This will make the business visible in public listings.",
                        confirmLabel: business.isPublished ? "Unpublish" : "Publish",
                        action: () => togglePublishMutation.mutate(),
                      })
                    }
                  >
                    {business.isPublished ? (
                      <Eye className="mr-2 h-4 w-4" />
                    ) : (
                      <EyeOff className="mr-2 h-4 w-4" />
                    )}
                    {business.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  {isAdmin && canDeleteBusiness ? (
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={() =>
                        setPendingAction({
                          title: "Delete business",
                          description:
                            "This will permanently remove the business and its owner assignments.",
                          confirmLabel: "Delete Business",
                          confirmVariant: "destructive",
                          action: () => deleteBusinessMutation.mutate(),
                        })
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Business
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="gradient-card rounded-xl border border-border p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Owners</h2>
                </div>
                {isAdmin && canAssignOwner ? (
                  <div className="mb-4 flex gap-3">
                    <select
                      value={selectedOwnerId}
                      onChange={(e) => setSelectedOwnerId(e.target.value)}
                      className="h-10 flex-1 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
                    >
                      <option value="">Assign owner...</option>
                      {ownerOptions.map((owner: any) => (
                        <option key={owner._id} value={owner._id}>
                          {owner.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={() =>
                        setPendingAction({
                          title: "Assign owner",
                          description:
                            "This will grant the selected owner management access to this business.",
                          confirmLabel: "Assign Owner",
                          action: () => assignOwnerMutation.mutate(selectedOwnerId),
                        })
                      }
                      disabled={!selectedOwnerId || !canAssignOwner}
                    >
                      Assign
                    </Button>
                  </div>
                ) : null}
                <div className="space-y-3">
                  {owners.map((record: any) => (
                    <div
                      key={record._id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div>
                        {isAdmin ? (
                          <Link
                            href={`/admin/owners/${record.ownerId?._id}`}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {record.ownerId?.name || "Unknown Owner"}
                          </Link>
                        ) : (
                          <p className="font-medium text-foreground">
                            {record.ownerId?.name || "Unknown Owner"}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {record.ownerId?.email || ""}
                        </p>
                      </div>
                      {isAdmin && canRevokeOwner ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPendingAction({
                              title: "Revoke owner access",
                              description:
                                "This will remove the owner from this business. At least one owner must remain.",
                              confirmLabel: "Revoke Owner",
                              action: () =>
                                revokeOwnerMutation.mutate(record.ownerId?._id),
                            })
                          }
                        >
                          Revoke
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="gradient-card rounded-xl border border-border p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Investors
                </h2>
                <div className="space-y-3">
                  {investors.map((record: any) => (
                    <div
                      key={record._id}
                      className="rounded-lg border border-border p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link
                            href={`/admin/investors/${record.investorId?._id}`}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {record.investorId?.name || "Unknown Investor"}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {record.investorId?.email || ""}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {record.equityPercentage || 0}%
                        </p>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                        <p>
                          Invested: ₹
                          {Number(record.investedAmount || 0).toLocaleString()}
                        </p>
                        <p>Shares: {Number(record.shares || 0).toLocaleString()}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!canAssignEquity}
                          onClick={() => {
                            setSelectedAssignment({
                              investorId: record.investorId?._id,
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
                          disabled={!canRevokeEquity}
                          onClick={() =>
                            setPendingAction({
                              title: "Revoke investor access",
                              description:
                                "This will remove the investor's access and equity allocation from this business.",
                              confirmLabel: "Revoke Access",
                              action: () =>
                                api.delete("/access/revoke", {
                                  data: {
                                    investorId: record.investorId?._id,
                                    businessId,
                                  },
                                }).then(() => {
                                  queryClient.invalidateQueries({
                                    queryKey: ["business-investors", businessId],
                                  })
                                  queryClient.invalidateQueries({
                                    queryKey: ["admin-user", record.investorId?._id],
                                  })
                                }),
                            })
                          }
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
          isOpen={Boolean(pendingAction)}
          onClose={() => setPendingAction(null)}
          onConfirm={() => {
            pendingAction?.action()
            setPendingAction(null)
          }}
          title={pendingAction?.title || "Confirm action"}
          description={pendingAction?.description || ""}
          confirmLabel={pendingAction?.confirmLabel || "Confirm"}
          confirmVariant={pendingAction?.confirmVariant}
          isPending={
            assignOwnerMutation.isPending ||
            revokeOwnerMutation.isPending ||
            togglePublishMutation.isPending ||
            deleteBusinessMutation.isPending
          }
        />
      </div>
    </DashboardLayout>
  )
}
