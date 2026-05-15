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
import { AssignEquityDialog } from "@/components/assign-equity-dialog"
import { fetchAdminUsers } from "@/lib/management-data"
import { useAppSelector } from "@/lib/store/hooks"
import { cn } from "@/lib/utils"

const ROLE_BADGES: Record<string, string> = {
  owner: "bg-[#1E3A5F] text-[#93C5FD]",
  investor: "bg-[#14432A] text-[#6EE7B7]",
}

export default function AdminInvestorsPage() {
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth)
  const isAdmin = user?.baseRole === "admin" || user?.baseRole === "super_admin"
  const isOwner = user?.baseRole === "owner"
  const isManager = isAdmin || isOwner
  const canCreateInvestor = Boolean(user?.permissions?.includes("investor.create"))
  const canAssignEquity = Boolean(user?.permissions?.includes("investor.assign_equity"))
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateInvestorOpen, setIsCreateInvestorOpen] = useState(false)
  const [isAssignEquityOpen, setIsAssignEquityOpen] = useState(false)
  const [selectedInvestorId, setSelectedInvestorId] = useState<string>()

  const { data: userData } = useQuery({
    queryKey: ["admin-users", "investor"],
    queryFn: () => fetchAdminUsers("investor"),
    enabled: !authLoading && isManager,
  })

  const filteredInvestors = useMemo(() => {
    const investors = userData?.investors || []
    const query = searchQuery.toLowerCase()

    return investors.filter((account: any) => {
      if (!query) return true

      return (
        account.name.toLowerCase().includes(query) ||
        account.email.toLowerCase().includes(query)
      )
    })
  }, [searchQuery, userData?.investors])

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
      title="Investors"
      subtitle="View investor records, assignments, and equity activity."
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Investors" },
      ]}
      actions={
        <>
          <Button
            variant="outline"
            disabled={!canCreateInvestor}
            onClick={() => {
              setSelectedInvestorId(undefined)
              setIsCreateInvestorOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Investor
          </Button>
          <Button
            onClick={() => setIsAssignEquityOpen(true)}
            disabled={!canAssignEquity}
          >
            <Plus className="mr-2 h-4 w-4" />
            Assign Equity
          </Button>
        </>
      }
    >
      <div className="space-y-6 p-6 lg:p-8">
        <CreateUserDialog
          isOpen={isCreateInvestorOpen}
          onClose={() => setIsCreateInvestorOpen(false)}
          currentUserRole={isAdmin ? "admin" : "owner"}
          forcedRole="investor"
          allowOwnerCreation={false}
        />
        <AssignEquityDialog
          isOpen={isAssignEquityOpen}
          onClose={() => setIsAssignEquityOpen(false)}
          preselectedInvestorId={selectedInvestorId}
        />

        <div className="max-w-md">
          <Input
            type="text"
            placeholder="Search investors..."
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
                    Investor
                  </th>
                  <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Email
                  </th>
                  <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Role
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
                {filteredInvestors.map((account: any) => (
                  <tr
                    key={account.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-4">
                      <Link
                        href={`/admin/investors/${account.id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-foreground">
                          {account.name.charAt(0)}
                        </div>
                        <span className="font-medium text-foreground">
                          {account.name}
                        </span>
                      </Link>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {account.email}
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase",
                          ROLE_BADGES[account.role] ||
                            "bg-secondary text-muted-foreground"
                        )}
                      >
                        {account.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase",
                          account.isActive !== false
                            ? "bg-[#14432A] text-[#34D399]"
                            : "bg-secondary text-muted-foreground"
                        )}
                      >
                        {account.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          disabled={!canAssignEquity}
                          onClick={() => {
                            setSelectedInvestorId(account.id)
                            setIsAssignEquityOpen(true)
                          }}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                        >
                          Assign Equity
                        </button>
                      </div>
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
