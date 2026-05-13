"use client"

import {
  Building2,
  Users,
  FileText,
  Clock,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  EyeOff,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { useAppSelector } from "@/lib/store/hooks"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { CreateUserDialog } from "@/components/create-user-dialog"
import { AssignEquityDialog } from "@/components/assign-equity-dialog"
import { CreateEditBusinessDialog } from "@/components/create-edit-business-dialog"

const tabs = ["Overview", "Businesses", "Investors", "Requests", "Analytics", "Settings"]
const ADMIN_TAB_MAP: Record<string, string> = {
  overview: "Overview",
  businesses: "Businesses",
  investors: "Investors",
  requests: "Requests",
  analytics: "Analytics",
  settings: "Settings",
}

const REQUEST_STATUSES = ["PENDING", "REVIEWING", "REJECTED", "ACCEPTED"] as const
const DEFAULT_REQUEST_STATUSES = ["PENDING", "REVIEWING"] as const

const STATUS_LABELS: Record<(typeof REQUEST_STATUSES)[number], string> = {
  PENDING: "Pending",
  REVIEWING: "Reviewing",
  REJECTED: "Rejected",
  ACCEPTED: "Accepted",
}

const STATUS_BADGES: Record<(typeof REQUEST_STATUSES)[number], string> = {
  PENDING: "bg-[#3B2A00] text-[#FCD34D]",
  REVIEWING: "bg-[#1E3A5F] text-[#93C5FD]",
  REJECTED: "bg-[#3B1A1A] text-[#FCA5A5]",
  ACCEPTED: "bg-[#14432A] text-[#6EE7B7]",
}

const ROLE_BADGES: Record<string, string> = {
  owner: "bg-[#1E3A5F] text-[#93C5FD]",
  investor: "bg-[#14432A] text-[#6EE7B7]",
}

const TYPE_LABELS: Record<string, string> = {
  NEW_INVESTMENT: "New Investment",
  REVISION: "Equity Revision",
  PUBLIC_INTEREST: "Public Interest",
}

type RequestStatus = (typeof REQUEST_STATUSES)[number]

function toRequestStatus(status: string): RequestStatus {
  return status === "APPROVED" ? "ACCEPTED" : (status as RequestStatus)
}

function getRequestTypeLabel(type: string) {
  return TYPE_LABELS[type] || type.replace(/_/g, " ").toLowerCase()
}

function formatRequestDate(date: string) {
  return new Date(date).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth)
  const router = useRouter()
  const queryClient = useQueryClient()

  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("Overview")
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [isAssignEquityOpen, setIsAssignEquityOpen] = useState(false)
  const [isBusinessDialogOpen, setIsBusinessDialogOpen] = useState(false)
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null)
  const [selectedInvestorId, setSelectedInvestorId] = useState<string | undefined>(undefined)
  const [requestStatuses, setRequestStatuses] = useState<RequestStatus[]>([...DEFAULT_REQUEST_STATUSES])
  const [requestSort, setRequestSort] = useState<"oldest" | "newest">("oldest")
  const [requestGroupMode, setRequestGroupMode] = useState<"flat" | "business">("flat")
  const [requestPage, setRequestPage] = useState(1)
  const [requestPageSize, setRequestPageSize] = useState(10)

  const isAdmin = user?.role === "admin"
  const isOwner = user?.role === "owner"
  const isManager = isAdmin || isOwner

  useEffect(() => {
    if (typeof window === "undefined") return
    const requestedTab = new URLSearchParams(window.location.search).get("tab") || "overview"
    setActiveTab(ADMIN_TAB_MAP[requestedTab] || "Overview")
  }, [])

  const setAdminTab = (tab: string) => {
    setActiveTab(tab)
    setSearchQuery("")
    router.replace(`/admin?tab=${tab.toLowerCase().replace(/\s+/g, "-")}`)
  }

  const toggleRequestStatus = (status: RequestStatus) => {
    setRequestPage(1)
    setRequestStatuses((current) => {
      if (current.includes(status)) {
        if (current.length === 1) return current
        return current.filter((value) => value !== status)
      }
      return [...current, status]
    })
  }

  const { data: businesses = [] } = useQuery({
    queryKey: ["admin-businesses"],
    queryFn: async () => {
      const res = await api.get("/businesses/manage/list?limit=100")
      return res.data.data.businesses
    },
    enabled: !authLoading && isManager,
  })

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users", user?.role],
    queryFn: async () => {
      const roleQuery = isAdmin ? "all" : "investor"
      const res = await api.get(`/admin/users?role=${roleQuery}`)
      return res.data.data.users.map((u: any) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        companies: 0,
        lastLogin: new Date(u.createdAt).toLocaleDateString(),
        status: u.isActive ? "active" : "inactive",
      }))
    },
    enabled: !authLoading && isManager,
  })

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ["admin-requests", requestStatuses, requestSort, requestPage, requestPageSize],
    queryFn: async () => {
      const res = await api.get("/requests/admin", {
        params: {
          statuses: requestStatuses.join(","),
          sort: requestSort,
          page: requestPage,
          pageSize: requestPageSize,
        },
      })
      return res.data.data
    },
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

  const handleRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RequestStatus }) => {
      await api.patch(`/requests/admin/${id}`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] })
    },
  })

  const requestSummary = requestsData?.summary || {
    PENDING: 0,
    REVIEWING: 0,
    REJECTED: 0,
    ACCEPTED: 0,
  }

  const requestPagination = requestsData?.pagination || {
    page: 1,
    pageSize: requestPageSize,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  }

  const requests = (requestsData?.requests || []).map((request: any) => ({
    id: request._id,
    type: request.type,
    typeLabel: getRequestTypeLabel(request.type),
    status: toRequestStatus(request.status),
    businessName: request.businessId?.name || "Unknown Business",
    businessSlug: request.businessId?.slug || "",
    requestedBy: request.contactName || request.investorId?.name || "Unknown",
    requestedByEmail: request.contactEmail || request.investorId?.email || "",
    message: request.message || "",
    createdAt: request.createdAt,
    dateLabel: formatRequestDate(request.createdAt),
  }))

  const groupedRequests = useMemo(() => {
    if (requestGroupMode !== "business") return []

    const groups = new Map<string, typeof requests>()
    for (const request of requests) {
      const key = request.businessName
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(request)
    }

    return Array.from(groups.entries()).map(([businessName, items]) => ({
      businessName,
      items,
    }))
  }, [requestGroupMode, requests])

  const filteredBusinesses = businesses.filter(
    (business: any) =>
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.sector.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredUsers = users.filter(
    (account: any) =>
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (authLoading) {
    return (
      <DashboardLayout type="admin" userName="Admin" userRole="Administrator">
        <div className="p-6 lg:p-8 text-muted-foreground">Loading management session...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      type="admin"
      userName={user?.name || "Admin"}
      userRole={isAdmin ? "Administrator" : "Owner"}
    >
      <div className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{isAdmin ? "Admin Panel" : "Owner Panel"}</h1>
            <p className="text-muted-foreground">
              {isAdmin
                ? "Manage businesses, owners, investors, and request reviews"
                : "Manage your assigned businesses, investors, and request reviews"}
            </p>
          </div>
        </div>

        <CreateUserDialog
          isOpen={isCreateUserOpen}
          onClose={() => setIsCreateUserOpen(false)}
          currentUserRole={isAdmin ? "admin" : "owner"}
        />
        <AssignEquityDialog
          isOpen={isAssignEquityOpen}
          onClose={() => setIsAssignEquityOpen(false)}
          preselectedInvestorId={selectedInvestorId}
        />
        <CreateEditBusinessDialog
          isOpen={isBusinessDialogOpen}
          onClose={() => {
            setIsBusinessDialogOpen(false)
            setSelectedBusinessId(null)
          }}
          businessId={selectedBusinessId}
          currentUserRole={isAdmin ? "admin" : "owner"}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Managed Businesses", value: businesses.length.toString(), icon: Building2, color: "text-primary" },
            { label: "Visible Users", value: users.length.toString(), icon: Users, color: "text-[#10B981]" },
            { label: "Documents", value: "234", icon: FileText, color: "text-[#F59E0B]" },
            {
              label: "Open Requests",
              value: (requestSummary.PENDING + requestSummary.REVIEWING).toString(),
              icon: Clock,
              color: "text-[#EF4444]",
            },
          ].map((stat) => (
            <div key={stat.label} className="gradient-card rounded-xl border border-border p-5">
              <stat.icon className={cn("w-5 h-5 mb-3", stat.color)} />
              <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="border-b border-border mb-6">
          <div className="flex gap-1 overflow-x-auto pb-px">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setAdminTab(tab)}
                className={cn(
                  "px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
                  activeTab === tab
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                )}
              >
                {tab}
                {tab === "Requests" && requestSummary.PENDING + requestSummary.REVIEWING > 0 && (
                  <span className="ml-2 w-5 h-5 inline-flex items-center justify-center rounded-full bg-[#EF4444] text-white text-xs">
                    {requestSummary.PENDING + requestSummary.REVIEWING}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {activeTab !== "Requests" && (
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={activeTab === "Businesses" ? "Search businesses..." : "Search users..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-card border-border"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {activeTab === "Businesses" && isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedBusinessId(null)
                    setIsBusinessDialogOpen(true)
                  }}
                  className="w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Business
                </Button>
              )}

              {activeTab === "Investors" && (
                <Button
                  variant="outline"
                  onClick={() => setIsCreateUserOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isAdmin ? "Create User" : "Create Investor"}
                </Button>
              )}

              {activeTab === "Investors" && (
                <Button onClick={() => setIsAssignEquityOpen(true)} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Equity
                </Button>
              )}
            </div>
          </div>
        )}

        {activeTab === "Overview" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="gradient-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Platform Summary</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Managed businesses: <span className="text-foreground font-medium">{businesses.length}</span></p>
                <p>Visible users: <span className="text-foreground font-medium">{users.length}</span></p>
                <p>Open request reviews: <span className="text-foreground font-medium">{requestSummary.PENDING + requestSummary.REVIEWING}</span></p>
              </div>
            </div>
            <div className="gradient-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Current Access Model</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>{isAdmin ? "Admins can create owners, investors, and businesses." : "Owners can manage only assigned businesses."}</p>
                <p>Businesses must have at least one owner at creation.</p>
                <p>Investor assignment requires a positive invested amount.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Businesses" && (
          <div className="gradient-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/50 border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Business</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Group</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Stage</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBusinesses.map((business: any) => (
                    <tr key={business.slug || business._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                            {business.logo || "🏢"}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{business.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{business.tagline}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase bg-[#1E3A5F] text-[#60A5FA]">
                          {business.sector}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{business.stage}</td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase",
                            business.isPublished ? "bg-[#14432A] text-[#34D399]" : "bg-secondary text-muted-foreground"
                          )}
                        >
                          {business.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => togglePublishMutation.mutate(business._id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            title="Toggle publish"
                          >
                            {business.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBusinessId(business._id)
                              setIsBusinessDialogOpen(true)
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => deleteBusinessMutation.mutate(business._id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-[#EF4444] hover:bg-secondary transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Investors" && (
          <div className="gradient-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/50 border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">User</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Email</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Role</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((account: any) => (
                    <tr key={account.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-foreground">
                            {account.name.charAt(0)}
                          </div>
                          <span className="font-medium text-foreground">{account.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{account.email}</td>
                      <td className="p-4">
                        <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase", ROLE_BADGES[account.role] || "bg-secondary text-muted-foreground")}>
                          {account.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase",
                            account.status === "active" ? "bg-[#14432A] text-[#34D399]" : "bg-secondary text-muted-foreground"
                          )}
                        >
                          {account.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {account.role === "investor" && (
                            <button
                              onClick={() => {
                                setSelectedInvestorId(account.id)
                                setIsAssignEquityOpen(true)
                              }}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
                            >
                              Assign Equity
                            </button>
                          )}
                          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "Requests" && (
          <div className="space-y-6">
            <div className="gradient-card rounded-xl border border-border p-5">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Request Review Queue</h2>
                    <p className="text-sm text-muted-foreground">
                      Default view shows pending and reviewing requests, sorted from earliest to oldest.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant={requestGroupMode === "flat" ? "default" : "outline"} size="sm" onClick={() => setRequestGroupMode("flat")}>
                      Flat List
                    </Button>
                    <Button variant={requestGroupMode === "business" ? "default" : "outline"} size="sm" onClick={() => setRequestGroupMode("business")}>
                      Group by Business
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr,220px,180px]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Status Filter</p>
                    <div className="flex flex-wrap gap-2">
                      {REQUEST_STATUSES.map((status) => {
                        const isActive = requestStatuses.includes(status)
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => toggleRequestStatus(status)}
                            className={cn(
                              "px-3 py-2 rounded-lg border text-sm transition-colors",
                              isActive
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                            )}
                          >
                            {STATUS_LABELS[status]}
                            <span className="ml-2 tabular-nums text-xs">{requestSummary[status]}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <label className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <span className="text-xs font-semibold uppercase tracking-wide">Sort</span>
                    <select
                      value={requestSort}
                      onChange={(e) => {
                        setRequestSort(e.target.value as "oldest" | "newest")
                        setRequestPage(1)
                      }}
                      className="h-11 rounded-lg border border-border bg-card px-3 text-foreground"
                    >
                      <option value="oldest">Earliest to Oldest</option>
                      <option value="newest">Newest First</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <span className="text-xs font-semibold uppercase tracking-wide">Rows per page</span>
                    <select
                      value={requestPageSize}
                      onChange={(e) => {
                        setRequestPageSize(Number(e.target.value))
                        setRequestPage(1)
                      }}
                      className="h-11 rounded-lg border border-border bg-card px-3 text-foreground"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            {requestsLoading ? (
              <div className="gradient-card rounded-xl border border-border p-12 text-center text-muted-foreground">Loading request queue...</div>
            ) : requests.length === 0 ? (
              <div className="gradient-card rounded-xl border border-border p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No requests match this view</h3>
                <p className="text-muted-foreground">Adjust the status filters or sort to inspect a different part of the queue.</p>
              </div>
            ) : requestGroupMode === "business" ? (
              <div className="space-y-4">
                {groupedRequests.map((group) => (
                  <div key={group.businessName} className="gradient-card rounded-xl border border-border overflow-hidden">
                    <div className="border-b border-border px-5 py-4">
                      <h3 className="font-semibold text-foreground">{group.businessName}</h3>
                      <p className="text-sm text-muted-foreground">{group.items.length} request{group.items.length === 1 ? "" : "s"} on this page</p>
                    </div>
                    <div className="divide-y divide-border">
                      {group.items.map((approval) => (
                        <div key={approval.id} className="p-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">{approval.typeLabel}</span>
                              <span className={cn("text-xs px-2 py-0.5 rounded-full", STATUS_BADGES[approval.status])}>{STATUS_LABELS[approval.status]}</span>
                            </div>
                            <p className="text-sm text-foreground">
                              Requested by {approval.requestedBy}
                              {approval.requestedByEmail ? ` (${approval.requestedByEmail})` : ""}
                            </p>
                            <p className="text-sm text-muted-foreground">{approval.dateLabel}</p>
                            {approval.message && <p className="text-sm text-muted-foreground max-w-3xl">{approval.message}</p>}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={approval.status}
                              onChange={(e) =>
                                handleRequestMutation.mutate({
                                  id: approval.id,
                                  status: e.target.value as RequestStatus,
                                })
                              }
                              disabled={handleRequestMutation.isPending}
                              className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
                            >
                              {REQUEST_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {STATUS_LABELS[status]}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="gradient-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary/50 border-b border-border">
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Business</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Type</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Requested By</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Status</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Created</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Message</th>
                        <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((approval) => (
                        <tr key={approval.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors align-top">
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-foreground">{approval.businessName}</p>
                              {approval.businessSlug && <p className="text-xs text-muted-foreground">/{approval.businessSlug}</p>}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">{approval.typeLabel}</span>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            <p>{approval.requestedBy}</p>
                            {approval.requestedByEmail && <p>{approval.requestedByEmail}</p>}
                          </td>
                          <td className="p-4">
                            <span className={cn("text-xs px-2 py-0.5 rounded-full", STATUS_BADGES[approval.status])}>{STATUS_LABELS[approval.status]}</span>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">{approval.dateLabel}</td>
                          <td className="p-4 text-sm text-muted-foreground max-w-sm">
                            <p className="line-clamp-3">{approval.message || "No message"}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end">
                              <select
                                value={approval.status}
                                onChange={(e) =>
                                  handleRequestMutation.mutate({
                                    id: approval.id,
                                    status: e.target.value as RequestStatus,
                                  })
                                }
                                disabled={handleRequestMutation.isPending}
                                className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
                              >
                                {REQUEST_STATUSES.map((status) => (
                                  <option key={status} value={status}>
                                    {STATUS_LABELS[status]}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Showing page <span className="text-foreground font-medium">{requestPagination.page}</span> of{" "}
                <span className="text-foreground font-medium">{requestPagination.totalPages}</span>
                {" • "}
                <span className="text-foreground font-medium">{requestPagination.total}</span> total requests
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRequestPage((page) => Math.max(page - 1, 1))}
                  disabled={!requestPagination.hasPreviousPage}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRequestPage((page) => page + 1)}
                  disabled={!requestPagination.hasNextPage}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Analytics" && (
          <div className="gradient-card rounded-xl border border-border p-8">
            <h2 className="text-lg font-semibold text-foreground mb-2">Analytics</h2>
            <p className="text-muted-foreground mb-6">Current live totals derived from loaded management data.</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">Managed Businesses</p>
                <p className="text-2xl font-bold text-foreground">{businesses.length}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">Visible Users</p>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">Open Requests</p>
                <p className="text-2xl font-bold text-foreground">{requestSummary.PENDING + requestSummary.REVIEWING}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="text-2xl font-bold text-foreground">234</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Settings" && (
          <div className="gradient-card rounded-xl border border-border p-8">
            <h2 className="text-lg font-semibold text-foreground mb-2">Settings</h2>
            <p className="text-muted-foreground mb-6">Administrative controls already available in this build.</p>
            <div className="space-y-4">
              <div className="rounded-xl border border-border p-4">
                <p className="font-medium text-foreground">User Creation</p>
                <p className="text-sm text-muted-foreground">Admins can create owners and investors. Owners can create investors only.</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="font-medium text-foreground">Business Ownership</p>
                <p className="text-sm text-muted-foreground">Businesses require at least one owner, and owners may only manage assigned businesses.</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="font-medium text-foreground">Equity Assignment</p>
                <p className="text-sm text-muted-foreground">Investor assignment requires a positive invested amount.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
