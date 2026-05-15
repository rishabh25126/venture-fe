"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ScreenLoader } from "@/components/app-loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NotFoundContent } from "@/components/not-found-content"
import { CreateUserDialog } from "@/components/create-user-dialog"
import { fetchAdminUsers } from "@/lib/management-data"
import { useAppSelector } from "@/lib/store/hooks"

export default function AdminOwnersPage() {
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateOwnerOpen, setIsCreateOwnerOpen] = useState(false)

  const isAdmin = user?.baseRole === "admin" || user?.baseRole === "super_admin"
  const canCreateOwner = Boolean(user?.permissions?.includes("owner.create"))

  const { data: ownerData } = useQuery({
    queryKey: ["admin-users", "owner"],
    queryFn: () => fetchAdminUsers("owner"),
    enabled: !authLoading && isAdmin,
  })

  const filteredOwners = useMemo(() => {
    const owners = ownerData?.owners || []
    const query = searchQuery.toLowerCase()

    return owners.filter((owner: any) => {
      if (!query) return true

      return (
        owner.name.toLowerCase().includes(query) ||
        owner.email.toLowerCase().includes(query)
      )
    })
  }, [ownerData?.owners, searchQuery])

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

  return (
    <DashboardLayout
      type="admin"
      title="Owners"
      subtitle="Manage business owners and their assigned businesses."
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Owners" },
      ]}
      actions={
        <Button
          onClick={() => setIsCreateOwnerOpen(true)}
          disabled={!canCreateOwner}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Owner
        </Button>
      }
    >
      <div className="space-y-6 p-6 lg:p-8">
        <CreateUserDialog
          isOpen={isCreateOwnerOpen}
          onClose={() => setIsCreateOwnerOpen(false)}
          currentUserRole="admin"
          forcedRole="owner"
          allowOwnerCreation={canCreateOwner}
        />

        <div className="max-w-md">
          <Input
            type="text"
            placeholder="Search owners..."
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
                    Owner
                  </th>
                  <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Email
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
                {filteredOwners.map((owner: any) => (
                  <tr
                    key={owner.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-4">
                      <Link
                        href={`/admin/owners/${owner.id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground">
                          {owner.name.charAt(0)}
                        </div>
                        <span className="font-medium text-foreground">
                          {owner.name}
                        </span>
                      </Link>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {owner.email}
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-[#1E3A5F] px-2.5 py-1 text-[11px] font-semibold uppercase text-[#93C5FD]">
                        Owner
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
