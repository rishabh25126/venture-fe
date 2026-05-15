"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ScreenLoader } from "@/components/app-loader"
import { Button } from "@/components/ui/button"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { NotFoundContent } from "@/components/not-found-content"
import { RequestConversionDialog } from "@/components/request-conversion-dialog"
import { cn } from "@/lib/utils"
import { useAppSelector } from "@/lib/store/hooks"
import { fetchAdminRequests, RequestStatus } from "@/lib/management-data"
import api from "@/lib/api"

const REQUEST_STATUSES = [
  "PENDING",
  "REVIEWING",
  "REJECTED",
  "ACCEPTED",
] as const

const DEFAULT_REQUEST_STATUSES: RequestStatus[] = ["PENDING", "REVIEWING"]

const STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: "Pending",
  REVIEWING: "Reviewing",
  REJECTED: "Rejected",
  ACCEPTED: "Accepted",
}

const STATUS_BADGES: Record<RequestStatus, string> = {
  PENDING: "bg-[#3B2A00] text-[#FCD34D]",
  REVIEWING: "bg-[#1E3A5F] text-[#93C5FD]",
  REJECTED: "bg-[#3B1A1A] text-[#FCA5A5]",
  ACCEPTED: "bg-[#14432A] text-[#6EE7B7]",
}

const TYPE_LABELS: Record<string, string> = {
  NEW_INVESTMENT: "New Investment",
  REVISION: "Equity Revision",
  PUBLIC_INTEREST: "Public Interest",
}

type RequestListItem = {
  id: string
  type: "NEW_INVESTMENT" | "REVISION" | "PUBLIC_INTEREST"
  typeLabel: string
  status: RequestStatus
  businessId: string
  businessName: string
  businessSlug: string
  investorId?: string
  requestedBy: string
  requestedByEmail: string
  requestedAmount?: number
  requestedShares?: number
  requestedEquityPercentage?: number
  message: string
  dateLabel: string
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

function toRequestStatus(status: string): RequestStatus {
  return status === "APPROVED" ? "ACCEPTED" : (status as RequestStatus)
}

export default function AdminRequestsPage() {
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth)
  const queryClient = useQueryClient()
  const isAdmin = user?.baseRole === "admin" || user?.baseRole === "super_admin"
  const isOwner = user?.baseRole === "owner"
  const isManager = isAdmin || isOwner
  const canConvertRequests = Boolean(
    user?.permissions?.includes("request.convert_to_investor")
  )
  const canReviewRequests = Boolean(user?.permissions?.includes("request.review"))
  const [requestStatuses, setRequestStatuses] =
    useState<RequestStatus[]>(DEFAULT_REQUEST_STATUSES)
  const [requestSort, setRequestSort] = useState<"oldest" | "newest">("oldest")
  const [requestGroupMode, setRequestGroupMode] = useState<"flat" | "business">(
    "flat"
  )
  const [requestPage, setRequestPage] = useState(1)
  const [requestPageSize, setRequestPageSize] = useState(10)
  const [selectedRequest, setSelectedRequest] = useState<RequestListItem | null>(
    null
  )
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    request: RequestListItem
    nextStatus: RequestStatus
  } | null>(null)

  const { data: requestsData, isLoading } = useQuery({
    queryKey: [
      "admin-requests",
      requestStatuses,
      requestSort,
      requestPage,
      requestPageSize,
    ],
    queryFn: () =>
      fetchAdminRequests({
        statuses: requestStatuses.join(","),
        sort: requestSort,
        page: requestPage,
        pageSize: requestPageSize,
      }),
    enabled: !authLoading && isManager,
  })

  const handleRequestMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: RequestStatus
    }) => {
      await api.patch(`/requests/admin/${id}`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] })
    },
  })

  const requests: RequestListItem[] = (requestsData?.requests || []).map(
    (request: any) => ({
      id: request._id,
      type: request.type,
      typeLabel: TYPE_LABELS[request.type] || request.type,
      status: toRequestStatus(request.status),
      businessId: request.businessId?._id || "",
      businessName: request.businessId?.name || "Unknown Business",
      businessSlug: request.businessId?.slug || "",
      investorId: request.investorId?._id,
      requestedBy: request.contactName || request.investorId?.name || "Unknown",
      requestedByEmail: request.contactEmail || request.investorId?.email || "",
      requestedAmount: request.requestedAmount,
      requestedShares: request.requestedShares,
      requestedEquityPercentage: request.requestedEquityPercentage,
      message: request.message || "",
      dateLabel: formatRequestDate(request.createdAt),
    })
  )

  const groupedRequests = useMemo(() => {
    if (requestGroupMode !== "business") return []

    const groups = new Map<string, RequestListItem[]>()
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
      title="Requests"
      subtitle="Review pending allocations, revisions, and public interest submissions."
      breadcrumbItems={[
        { label: "Admin", href: "/admin" },
        { label: "Requests" },
      ]}
    >
      <div className="space-y-6 p-6 lg:p-8">
        {isLoading ? (
          <ScreenLoader
            title="Loading requests"
            description="Preparing the request review queue."
            compact
            className="bg-transparent"
          />
        ) : (
          <>
            <div className="gradient-card rounded-xl border border-border p-5">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Request Review Queue
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Default view shows pending and reviewing requests, sorted
                      from earliest to oldest.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant={requestGroupMode === "flat" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRequestGroupMode("flat")}
                    >
                      Flat List
                    </Button>
                    <Button
                      variant={
                        requestGroupMode === "business" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setRequestGroupMode("business")}
                    >
                      Group by Business
                    </Button>
                    <select
                      value={requestSort}
                      onChange={(e) => {
                        setRequestPage(1)
                        setRequestSort(e.target.value as "oldest" | "newest")
                      }}
                      className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
                    >
                      <option value="oldest">Earliest to Oldest</option>
                      <option value="newest">Newest First</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {REQUEST_STATUSES.map((status) => {
                    const selected = requestStatuses.includes(status)
                    const count = requestSummary[status] || 0

                    return (
                      <Button
                        key={status}
                        variant={selected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleRequestStatus(status)}
                      >
                        {STATUS_LABELS[status]}
                        <span className="ml-2 rounded-full bg-background/20 px-1.5 py-0.5 text-[10px]">
                          {count}
                        </span>
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>

            {requests.length === 0 ? (
              <div className="gradient-card rounded-xl border border-border p-12 text-center">
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  No requests match this view
                </h3>
                <p className="text-muted-foreground">
                  Adjust the status filters or sort to inspect a different part
                  of the queue.
                </p>
              </div>
            ) : requestGroupMode === "business" ? (
              <div className="space-y-4">
                {groupedRequests.map((group) => (
                  <div
                    key={group.businessName}
                    className="gradient-card overflow-hidden rounded-xl border border-border"
                  >
                    <div className="border-b border-border px-5 py-4">
                      <h3 className="font-semibold text-foreground">
                        {group.businessName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {group.items.length} request
                        {group.items.length === 1 ? "" : "s"} on this page
                      </p>
                    </div>
                    <div className="divide-y divide-border">
                      {group.items.map((approval) => (
                        <div
                          key={approval.id}
                          className="flex flex-col gap-4 p-5 xl:flex-row xl:items-center xl:justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                {approval.typeLabel}
                              </span>
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-xs",
                                  STATUS_BADGES[approval.status]
                                )}
                              >
                                {STATUS_LABELS[approval.status]}
                              </span>
                            </div>
                            <p className="text-sm text-foreground">
                              Requested by {approval.requestedBy}
                              {approval.requestedByEmail
                                ? ` (${approval.requestedByEmail})`
                                : ""}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {approval.dateLabel}
                            </p>
                            {approval.message ? (
                              <p className="max-w-3xl text-sm text-muted-foreground">
                                {approval.message}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={!canConvertRequests}
                              onClick={() => setSelectedRequest(approval)}
                            >
                              {approval.type === "PUBLIC_INTEREST"
                                ? "Create Investor & Assign Equity"
                                : approval.type === "REVISION"
                                  ? "Edit Equity"
                                  : "Assign Equity"}
                            </Button>
                            <select
                              value={approval.status}
                              onChange={(e) =>
                                setPendingStatusUpdate({
                                  request: approval,
                                  nextStatus: e.target.value as RequestStatus,
                                })
                              }
                              disabled={
                                !canReviewRequests || handleRequestMutation.isPending
                              }
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
              <div className="gradient-card overflow-hidden rounded-xl border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50">
                        <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Business
                        </th>
                        <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Type
                        </th>
                        <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Requested By
                        </th>
                        <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Status
                        </th>
                        <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Created
                        </th>
                        <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Message
                        </th>
                        <th className="p-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Update
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((approval) => (
                        <tr
                          key={approval.id}
                          className="align-top border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                        >
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-foreground">
                                {approval.businessName}
                              </p>
                              {approval.businessSlug ? (
                                <p className="text-xs text-muted-foreground">
                                  /{approval.businessSlug}
                                </p>
                              ) : null}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                              {approval.typeLabel}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            <p>{approval.requestedBy}</p>
                            {approval.requestedByEmail ? (
                              <p>{approval.requestedByEmail}</p>
                            ) : null}
                          </td>
                          <td className="p-4">
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-xs",
                                STATUS_BADGES[approval.status]
                              )}
                            >
                              {STATUS_LABELS[approval.status]}
                            </span>
                          </td>
                          <td className="whitespace-nowrap p-4 text-sm text-muted-foreground">
                            {approval.dateLabel}
                          </td>
                          <td className="max-w-sm p-4 text-sm text-muted-foreground">
                            <p className="line-clamp-3">
                              {approval.message || "No message"}
                            </p>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col items-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={!canConvertRequests}
                                onClick={() => setSelectedRequest(approval)}
                              >
                                {approval.type === "PUBLIC_INTEREST"
                                  ? "Create Investor & Assign Equity"
                                  : approval.type === "REVISION"
                                    ? "Edit Equity"
                                    : "Assign Equity"}
                              </Button>
                              <select
                                value={approval.status}
                                onChange={(e) =>
                                  setPendingStatusUpdate({
                                    request: approval,
                                    nextStatus: e.target.value as RequestStatus,
                                  })
                                }
                                disabled={
                                  !canReviewRequests || handleRequestMutation.isPending
                                }
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing page{" "}
                <span className="font-medium text-foreground">
                  {requestPagination.page}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {requestPagination.totalPages}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={requestPageSize}
                  onChange={(e) => {
                    setRequestPageSize(Number(e.target.value))
                    setRequestPage(1)
                  }}
                  className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={!requestPagination.hasPreviousPage}
                  onClick={() => setRequestPage((page) => Math.max(1, page - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={!requestPagination.hasNextPage}
                  onClick={() => setRequestPage((page) => page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
        <RequestConversionDialog
          isOpen={Boolean(selectedRequest)}
          onClose={() => setSelectedRequest(null)}
          request={selectedRequest}
        />
        <ConfirmationDialog
          isOpen={Boolean(pendingStatusUpdate)}
          onClose={() => setPendingStatusUpdate(null)}
          onConfirm={() => {
            if (!pendingStatusUpdate) return

            handleRequestMutation.mutate({
              id: pendingStatusUpdate.request.id,
              status: pendingStatusUpdate.nextStatus,
            })
            setPendingStatusUpdate(null)
          }}
          title="Update request status"
          description={
            pendingStatusUpdate
              ? `This will mark the request from ${pendingStatusUpdate.request.requestedBy} as ${STATUS_LABELS[pendingStatusUpdate.nextStatus].toLowerCase()}.`
              : ""
          }
          confirmLabel="Update Status"
          isPending={handleRequestMutation.isPending}
        />
      </div>
    </DashboardLayout>
  )
}
