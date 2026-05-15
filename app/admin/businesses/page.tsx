"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Edit, Eye, EyeOff, Plus, Trash2 } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ScreenLoader } from "@/components/app-loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NotFoundContent } from "@/components/not-found-content"
import { CreateEditBusinessDialog } from "@/components/create-edit-business-dialog"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { fetchManageableBusinesses } from "@/lib/management-data"
import { useAppSelector } from "@/lib/store/hooks"
import api from "@/lib/api"
import { cn } from "@/lib/utils"

export default function AdminBusinessesPage() {
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth)
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [isBusinessDialogOpen, setIsBusinessDialogOpen] = useState(false)
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    null
  )
  const [pendingAction, setPendingAction] = useState<{
    title: string
    description: string
    confirmLabel: string
    confirmVariant?: "default" | "destructive" | "outline"
    action: () => void
    loading: boolean
  } | null>(null)

  const isAdmin = user?.baseRole === "admin" || user?.baseRole === "super_admin"
  const isOwner = user?.baseRole === "owner"
  const isManager = isAdmin || isOwner
  const canCreateBusiness = Boolean(user?.permissions?.includes("business.create"))
  const canUpdateBusiness = Boolean(user?.permissions?.includes("business.update"))
  const canPublishBusiness = Boolean(user?.permissions?.includes("business.publish"))
  const canDeleteBusiness = Boolean(user?.permissions?.includes("business.delete"))

  const { data: businesses = [] } = useQuery({
    queryKey: ["admin-businesses"],
    queryFn: fetchManageableBusinesses,
    enabled: !authLoading && isManager,
  })

  const togglePublishMutation = useMutation({
    mutationFn: async (businessId: string) => {
      await api.patch(`/businesses/${businessId}/publish`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] })
    },
  })

  const deleteBusinessMutation = useMutation({
    mutationFn: async (businessId: string) => {
      await api.delete(`/businesses/${businessId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] })
    },
  })

  const filteredBusinesses = useMemo(() => {
    const query = searchQuery.toLowerCase()

    return businesses.filter((business: any) => {
      if (!query) return true

      return (
        business.name.toLowerCase().includes(query) ||
        business.sector.toLowerCase().includes(query) ||
        (business.tagline || "").toLowerCase().includes(query)
      )
    })
  }, [businesses, searchQuery])

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
      title="Businesses"
      subtitle="Browse, publish, edit, and review the businesses you can manage."
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Businesses" },
      ]}
      actions={
        isAdmin && canCreateBusiness ? (
          <Button
            onClick={() => {
              setSelectedBusinessId(null)
              setIsBusinessDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Business
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-6 p-6 lg:p-8">
        <CreateEditBusinessDialog
          isOpen={isBusinessDialogOpen}
          onClose={() => {
            setIsBusinessDialogOpen(false)
            setSelectedBusinessId(null)
          }}
          businessId={selectedBusinessId}
          currentUserRole={isAdmin ? "admin" : "owner"}
          canManageOwners={isAdmin}
        />

        <div className="max-w-md">
          <Input
            type="text"
            placeholder="Search businesses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 bg-card border-border"
          />
        </div>

        <div className="gradient-card overflow-hidden rounded-xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Business
                  </th>
                  <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Group
                  </th>
                  <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Stage
                  </th>
                  <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="p-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBusinesses.map((business: any) => (
                  <tr
                    key={business._id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-4">
                      <Link
                        href={`/admin/businesses/${business._id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-lg">
                          {business.logo || "🏢"}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {business.name}
                          </p>
                          <p className="max-w-[200px] truncate text-xs text-muted-foreground">
                            {business.tagline}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-[#1E3A5F] px-2.5 py-1 text-[11px] font-semibold uppercase text-[#60A5FA]">
                        {business.sector}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {business.stage}
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase",
                          business.isPublished
                            ? "bg-[#14432A] text-[#34D399]"
                            : "bg-secondary text-muted-foreground"
                        )}
                      >
                        {business.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={!canPublishBusiness}
                          onClick={() =>
                            setPendingAction({
                              title: business.isPublished
                                ? "Unpublish business"
                                : "Publish business",
                              description: business.isPublished
                                ? "This will move the business back to draft and hide it from public listings."
                                : "This will make the business visible in public listings.",
                              confirmLabel: business.isPublished
                                ? "Unpublish"
                                : "Publish",
                              action: () => togglePublishMutation.mutate(business._id),
                              loading: togglePublishMutation.isPending,
                            })
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          title={business.isPublished ? "Published" : "Draft"}
                        >
                          {business.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          disabled={!canUpdateBusiness}
                          onClick={() => {
                            setSelectedBusinessId(business._id)
                            setIsBusinessDialogOpen(true)
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          title="Edit business"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {isAdmin && canDeleteBusiness ? (
                          <button
                            onClick={() =>
                              setPendingAction({
                                title: "Delete business",
                                description:
                                  "This will permanently remove the business and its owner assignments.",
                                confirmLabel: "Delete Business",
                                confirmVariant: "destructive",
                                action: () =>
                                  deleteBusinessMutation.mutate(business._id),
                                loading: deleteBusinessMutation.isPending,
                              })
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-[#EF4444]"
                            title="Delete business"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <ConfirmationDialog
          isOpen={Boolean(pendingAction)}
          onClose={() => setPendingAction(null)}
          onConfirm={() => pendingAction?.action()}
          title={pendingAction?.title || "Confirm action"}
          description={pendingAction?.description || ""}
          confirmLabel={pendingAction?.confirmLabel || "Confirm"}
          confirmVariant={pendingAction?.confirmVariant}
          isPending={pendingAction?.loading}
        />
      </div>
    </DashboardLayout>
  )
}
