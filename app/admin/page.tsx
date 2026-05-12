"use client"

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
import { startups as dummyStartups } from "@/lib/data"
import { cn } from "@/lib/utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import { useAppSelector } from "@/lib/store/hooks"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { CreateUserDialog } from "@/components/create-user-dialog"
import { AssignEquityDialog } from "@/components/assign-equity-dialog"

const tabs = ["Startups", "Investors", "Pending Approvals"]

export default function AdminPage() {
  const { user } = useAppSelector((state) => state.auth)
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (user?.role === 'investor') {
      router.push('/dashboard')
    }
  }, [user, router])

  const [activeTab, setActiveTab] = useState("Startups")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [isAssignEquityOpen, setIsAssignEquityOpen] = useState(false)
  const [selectedInvestorId, setSelectedInvestorId] = useState<string | undefined>(undefined)

  // Fetch Startups
  const { data: startups = [] } = useQuery({
    queryKey: ['admin-startups'],
    queryFn: async () => {
      const res = await api.get('/startups?limit=100')
      return res.data.data.startups
    }
  })

  // Fetch Investors
  const { data: investors = [] } = useQuery({
    queryKey: ['admin-investors'],
    queryFn: async () => {
      const res = await api.get('/admin/users')
      // Only show investors, format them for UI
      return res.data.data.investors.map((u: any) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        companies: 0, // Placeholder
        lastLogin: new Date(u.createdAt).toLocaleDateString(),
        status: u.isActive ? 'active' : 'inactive'
      }))
    }
  })

  // Fetch Pending Approvals
  const { data: pendingApprovals = [] } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: async () => {
      const res = await api.get('/requests/admin/pending')
      return res.data.data.requests.map((r: any) => ({
        id: r._id,
        type: r.type === 'NEW_INVESTMENT' ? 'New Investment' : 'Equity Revision',
        name: r.startupId.name,
        requestedBy: r.investorId.name,
        date: new Date(r.createdAt).toLocaleDateString()
      }))
    }
  })

  const handleRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'APPROVED' | 'REJECTED' }) => {
      await api.patch(`/requests/admin/${id}`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] })
    }
  })

  const [startupVisibility, setStartupVisibility] = useState<Record<string, boolean>>({})

  const filteredStartups = startups.filter(
    (s: any) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sector.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredInvestors = investors.filter(
    (i: any) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleVisibility = (id: string) => {
    setStartupVisibility((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <DashboardLayout type="admin" userName={user?.name || "Admin"} userRole="Administrator">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground">Manage startups, investors, and platform settings</p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === "Investors" && (
              <Button variant="outline" onClick={() => setIsCreateUserOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Investor
              </Button>
            )}
            <Button onClick={() => setIsAssignEquityOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Assign Equity
            </Button>
          </div>
        </div>

        <CreateUserDialog isOpen={isCreateUserOpen} onClose={() => setIsCreateUserOpen(false)} />
        <AssignEquityDialog isOpen={isAssignEquityOpen} onClose={() => setIsAssignEquityOpen(false)} preselectedInvestorId={selectedInvestorId} />

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
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {stat.label.includes("Investors") && investors.length === 0 ? "..." : stat.value}
              </p>
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
                  {filteredStartups.map((startup: any) => {
                    const sectorStyle = { bg: "bg-[#1E3A5F]", text: "text-[#60A5FA]" } // Fallback style
                    const isVisible = true // Backend doesn't support hide/show toggle yet
                    return (
                      <tr key={startup.slug || startup._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
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
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                              title="Visibility toggle (coming soon)"
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
                  {filteredInvestors.map((investor: any) => (
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
                          <button 
                            onClick={() => {
                              setSelectedInvestorId(investor.id)
                              setIsAssignEquityOpen(true)
                            }}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
                          >
                            Assign Equity
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
              pendingApprovals.map((approval: any) => (
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRequestMutation.mutate({ id: approval.id, status: 'REJECTED' })}
                      disabled={handleRequestMutation.isPending}
                    >
                      Reject
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleRequestMutation.mutate({ id: approval.id, status: 'APPROVED' })}
                      disabled={handleRequestMutation.isPending}
                    >
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
