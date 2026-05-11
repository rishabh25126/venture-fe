"use client"

import { useState } from "react"
import { 
  Building2, 
  Users, 
  FileText, 
  Clock,
  TrendingUp,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  EyeOff,
  Trash2
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { startups } from "@/lib/data"
import { cn } from "@/lib/utils"

const tabs = ["Startups", "Investors", "Pending Approvals"]

// Mock investors data
const investors = [
  { id: "1", name: "Aditya Sharma", email: "aditya@example.com", companies: 4, lastLogin: "2 hours ago", status: "active" },
  { id: "2", name: "Meera Kapoor", email: "meera@example.com", companies: 6, lastLogin: "1 day ago", status: "active" },
  { id: "3", name: "Raj Krishnamurthy", email: "raj@example.com", companies: 3, lastLogin: "3 days ago", status: "active" },
  { id: "4", name: "Sunita Reddy", email: "sunita@example.com", companies: 5, lastLogin: "1 week ago", status: "inactive" },
  { id: "5", name: "Vikram Malhotra", email: "vikram@example.com", companies: 2, lastLogin: "5 hours ago", status: "active" },
]

const pendingApprovals = [
  { id: "1", type: "New Startup", name: "TechFlow AI", requestedBy: "Admin", date: "Aug 5, 2024" },
  { id: "2", type: "Document Upload", name: "Q3 Financials - PayStack AI", requestedBy: "PayStack AI", date: "Aug 4, 2024" },
  { id: "3", type: "Investor Access", name: "Vikram Malhotra → MediSync", requestedBy: "Vikram Malhotra", date: "Aug 3, 2024" },
]

const sectorColors: Record<string, { bg: string; text: string }> = {
  Fintech: { bg: "bg-[#1E3A5F]", text: "text-[#60A5FA]" },
  HealthTech: { bg: "bg-[#14432A]", text: "text-[#34D399]" },
  EdTech: { bg: "bg-[#3D1F5C]", text: "text-[#A78BFA]" },
  SaaS: { bg: "bg-[#3B2A00]", text: "text-[#FCD34D]" },
  "E-commerce": { bg: "bg-[#3B0A0A]", text: "text-[#FCA5A5]" },
  AI: { bg: "bg-[#1E3A5F]", text: "text-[#60A5FA]" },
  CleanTech: { bg: "bg-[#14432A]", text: "text-[#34D399]" },
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("Startups")
  const [searchQuery, setSearchQuery] = useState("")
  const [startupVisibility, setStartupVisibility] = useState<Record<string, boolean>>(
    Object.fromEntries(startups.map((s) => [s.id, true]))
  )

  const filteredStartups = startups.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sector.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredInvestors = investors.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleVisibility = (id: string) => {
    setStartupVisibility((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <DashboardLayout type="admin" userName="Admin User" userRole="Administrator">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground">Manage startups, investors, and platform settings</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New Startup
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Startups", value: startups.length.toString(), icon: Building2, color: "text-primary" },
            { label: "Total Investors", value: investors.length.toString(), icon: Users, color: "text-[#10B981]" },
            { label: "Documents", value: "234", icon: FileText, color: "text-[#F59E0B]" },
            { label: "Pending Approvals", value: pendingApprovals.length.toString(), icon: Clock, color: "text-[#EF4444]" },
          ].map((stat) => (
            <div key={stat.label} className="gradient-card rounded-xl border border-border p-5">
              <stat.icon className={cn("w-5 h-5 mb-3", stat.color)} />
              <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-1 overflow-x-auto pb-px">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  setSearchQuery("")
                }}
                className={cn(
                  "px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
                  activeTab === tab
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                )}
              >
                {tab}
                {tab === "Pending Approvals" && pendingApprovals.length > 0 && (
                  <span className="ml-2 w-5 h-5 inline-flex items-center justify-center rounded-full bg-[#EF4444] text-white text-xs">
                    {pendingApprovals.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        {activeTab !== "Pending Approvals" && (
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={activeTab === "Startups" ? "Search startups..." : "Search investors..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-card border-border"
            />
          </div>
        )}

        {/* Startups Tab */}
        {activeTab === "Startups" && (
          <div className="gradient-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/50 border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Company</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Sector</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Stage</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStartups.map((startup) => {
                    const sectorStyle = sectorColors[startup.sector] || { bg: "bg-secondary", text: "text-muted-foreground" }
                    const isVisible = startupVisibility[startup.id]
                    return (
                      <tr key={startup.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                              {startup.logo}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{startup.name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{startup.tagline}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase", sectorStyle.bg, sectorStyle.text)}>
                            {startup.sector}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{startup.stage}</td>
                        <td className="p-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase",
                            isVisible 
                              ? "bg-[#14432A] text-[#34D399]" 
                              : "bg-secondary text-muted-foreground"
                          )}>
                            {isVisible ? "Active" : "Hidden"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toggleVisibility(startup.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                              title={isVisible ? "Hide startup" : "Show startup"}
                            >
                              {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-[#EF4444] hover:bg-secondary transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Investors Tab */}
        {activeTab === "Investors" && (
          <div className="gradient-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/50 border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Investor</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Email</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Companies</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Last Login</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvestors.map((investor) => (
                    <tr key={investor.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-foreground">
                            {investor.name.charAt(0)}
                          </div>
                          <span className="font-medium text-foreground">{investor.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{investor.email}</td>
                      <td className="p-4 text-sm text-foreground tabular-nums">{investor.companies}</td>
                      <td className="p-4 text-sm text-muted-foreground">{investor.lastLogin}</td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase",
                          investor.status === "active" 
                            ? "bg-[#14432A] text-[#34D399]" 
                            : "bg-secondary text-muted-foreground"
                        )}>
                          {investor.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
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

        {/* Pending Approvals Tab */}
        {activeTab === "Pending Approvals" && (
          <div className="space-y-4">
            {pendingApprovals.length === 0 ? (
              <div className="gradient-card rounded-xl border border-border p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No pending approvals</h3>
                <p className="text-muted-foreground">All caught up! New requests will appear here.</p>
              </div>
            ) : (
              pendingApprovals.map((approval) => (
                <div key={approval.id} className="gradient-card rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#F59E0B]/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#F59E0B]" />
                    </div>
                    <div>
                      <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">{approval.type}</span>
                      <h3 className="font-medium text-foreground mt-1">{approval.name}</h3>
                      <p className="text-sm text-muted-foreground">Requested by {approval.requestedBy} • {approval.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-14 sm:ml-0">
                    <Button variant="outline" size="sm">
                      Reject
                    </Button>
                    <Button size="sm">
                      Approve
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
