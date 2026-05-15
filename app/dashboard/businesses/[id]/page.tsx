"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  Download,
  Calendar,
  TrendingUp,
  Users,
  AlertCircle,
  FileText,
} from "lucide-react"
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import { useQuery } from "@tanstack/react-query"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ScreenLoader } from "@/components/app-loader"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import api from "@/lib/api"

const tabs = ["Overview", "Financials", "Documents", "Updates", "Cap Table"]
type CapTableSlice = {
  name: string
  value: number
  color: string
}

const documents = [
  {
    category: "Legal",
    name: "Shareholders Agreement",
    date: "Jul 15, 2024",
    size: "2.4 MB",
  },
  {
    category: "Financial",
    name: "Q2 2024 Financial Statements",
    date: "Jul 20, 2024",
    size: "3.2 MB",
  },
  {
    category: "Compliance",
    name: "GST Registration Certificate",
    date: "Apr 01, 2024",
    size: "0.5 MB",
  },
]

const updates = [
  {
    date: "Aug 1, 2024",
    title: "Quarterly Business Update",
    content:
      "This section remains a placeholder until structured update feeds are backed by the API.",
  },
]

function formatCurrency(amount?: number) {
  if (!amount) return "₹0"
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  return `₹${amount.toLocaleString()}`
}

export default function InvestorBusinessDetailPage({
}: {
  params: { id: string }
}) {
  const params = useParams<{ id: string }>()
  const businessSlug = params.id
  const [activeTab, setActiveTab] = useState("Overview")

  const { data: portfolioData, isLoading } = useQuery({
    queryKey: ["my-businesses"],
    queryFn: async () => {
      const res = await api.get("/access/my-businesses")
      return res.data.data.businesses
    },
  })

  const portfolioEntry = useMemo(
    () =>
      portfolioData?.find(
        (entry: any) => entry.business?.slug === businessSlug
      ),
    [businessSlug, portfolioData]
  )

  const business = portfolioEntry?.business

  const { data: investorsData } = useQuery({
    queryKey: ["business-investors", business?._id],
    queryFn: async () => {
      const res = await api.get(`/access/business/${business._id}`)
      return res.data.data.investors
    },
    enabled: !!business?._id,
  })

  const { data: ownersData } = useQuery({
    queryKey: ["business-owners", business?._id],
    queryFn: async () => {
      const res = await api.get(`/owners/business/${business._id}`)
      return res.data.data.owners
    },
    enabled: !!business?._id,
  })

  if (!isLoading && !portfolioEntry) {
    notFound()
  }

  const investors = investorsData || []
  const owners = ownersData || []

  const capTableData: CapTableSlice[] = investors
    .filter((record: any) => Number(record.equityPercentage) > 0)
    .map((record: any, index: number) => ({
      name: record.investorId?.name || `Investor ${index + 1}`,
      value: Number(record.equityPercentage),
      color: ["#3B82F6", "#10B981", "#F59E0B", "#A78BFA", "#EF4444"][index % 5],
    }))

  const investorRows = investors.map((record: any) => ({
    name: record.investorId?.name || "Unknown Investor",
    email: record.investorId?.email || "",
    type: "Investor",
    investedAmount: formatCurrency(record.investedAmount),
    shares: record.shares?.toLocaleString?.() || "0",
    percentage: `${record.equityPercentage || 0}%`,
    highlight: record.investorId?._id === portfolioEntry?.investorId,
  }))

  const ownerRows = owners.map((record: any) => ({
    name: record.ownerId?.name || "Unknown Owner",
    email: record.ownerId?.email || "",
    type: "Owner",
    investedAmount: "—",
    shares: "—",
    percentage: "—",
    highlight: false,
  }))

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {isLoading || !business ? (
          <ScreenLoader
            title="Loading business details"
            description="Preparing your investor access view."
            className="min-h-[60vh] bg-transparent"
          />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-3xl">
                {business.logo || "🏢"}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {business.name}
                </h1>
                <p className="text-muted-foreground">{business.tagline}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            <div className="border-b border-border mb-8">
              <div className="flex gap-1 overflow-x-auto pb-px">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
                      activeTab === tab
                        ? "text-primary border-primary"
                        : "text-muted-foreground border-transparent hover:text-foreground"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "Overview" && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: "ARR",
                      value: business.metrics?.revenueRange || "TBD",
                      icon: TrendingUp,
                    },
                    {
                      label: "Customers",
                      value: business.metrics?.userBase || "TBD",
                      icon: Users,
                    },
                    {
                      label: "Runway",
                      value: business.metrics?.runway || "TBD",
                      icon: Calendar,
                    },
                    {
                      label: "Your Investment",
                      value: formatCurrency(portfolioEntry.investedAmount),
                      icon: Building2,
                    },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="gradient-card rounded-xl border border-border p-4"
                    >
                      <metric.icon className="w-5 h-5 text-primary mb-2" />
                      <p className="text-lg font-bold text-foreground tabular-nums">
                        {metric.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="gradient-card rounded-xl border border-border p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    About {business.name}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {business.description ||
                      "Business profile details will be updated soon."}
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-foreground mb-2">
                        The Problem
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {business.problem || "Problem statement pending."}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-2">
                        Our Solution
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {business.solution || "Solution details pending."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Financials" && (
              <div className="gradient-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Financial Access
                </h3>
                <p className="text-muted-foreground">
                  Structured financial dashboards are still being wired. Current
                  business metrics and invested amount are available in Overview
                  and Cap Table.
                </p>
              </div>
            )}

            {activeTab === "Documents" && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20">
                  <AlertCircle className="w-5 h-5 text-[#F59E0B]" />
                  <p className="text-sm text-[#F59E0B]">
                    Document access is logged. Downloaded files are watermarked.
                  </p>
                </div>

                <div className="gradient-card rounded-xl border border-border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary/50 border-b border-border">
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                          Document
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                          Category
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                          Date
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">
                          Size
                        </th>
                        <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider p-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc, index) => (
                        <tr
                          key={index}
                          className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-muted-foreground" />
                              <span className="text-sm font-medium text-foreground">
                                {doc.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {doc.category}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {doc.date}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground tabular-nums">
                            {doc.size}
                          </td>
                          <td className="p-4 text-right">
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "Updates" && (
              <div className="space-y-6">
                {updates.map((update, index) => (
                  <div
                    key={index}
                    className="gradient-card rounded-xl border border-border p-6"
                  >
                    <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {update.date}
                    </span>
                    <h3 className="text-lg font-semibold text-foreground mt-3 mb-3">
                      {update.title}
                    </h3>
                    <p className="text-muted-foreground">{update.content}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Cap Table" && (
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="gradient-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-6">
                    Investor Equity Distribution
                  </h3>
                  <div className="h-[280px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={capTableData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {capTableData.map(
                            (entry: CapTableSlice, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            )
                          )}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1A2235",
                            border: "1px solid #1E2D45",
                            borderRadius: "10px",
                            color: "#F1F5F9",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-foreground">
                          {portfolioEntry.equityPercentage || 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Your Stake
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="gradient-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-6">
                    Participants
                  </h3>
                  <div className="space-y-3">
                    {[...ownerRows, ...investorRows].map((holder, index) => (
                      <div
                        key={`${holder.name}-${index}`}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg",
                          holder.highlight
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-secondary/50"
                        )}
                      >
                        <div>
                          <p
                            className={cn(
                              "text-sm font-medium",
                              holder.highlight
                                ? "text-primary"
                                : "text-foreground"
                            )}
                          >
                            {holder.name}
                            {holder.highlight && (
                              <span className="ml-2 text-xs">(You)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {holder.type}
                            {holder.email ? ` • ${holder.email}` : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground tabular-nums">
                            {holder.percentage}
                          </p>
                          <p className="text-xs text-muted-foreground tabular-nums">
                            {holder.type === "Investor"
                              ? `${holder.shares} shares • ${holder.investedAmount}`
                              : holder.investedAmount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
