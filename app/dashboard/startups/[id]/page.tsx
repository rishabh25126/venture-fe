"use client"

import { useState, use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { 
  ArrowLeft, 
  ArrowUpRight, 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  Building2,
  AlertCircle,
  FileText,
  Lock
} from "lucide-react"
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  Cell, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend
} from "recharts"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { startups } from "@/lib/data"
import { cn } from "@/lib/utils"

const tabs = ["Overview", "Financials", "Documents", "Updates", "Cap Table"]

// Mock financial data
const financialData = {
  plData: [
    { month: "Jan", revenue: 45, expenses: 38 },
    { month: "Feb", revenue: 52, expenses: 40 },
    { month: "Mar", revenue: 61, expenses: 42 },
    { month: "Apr", revenue: 58, expenses: 45 },
    { month: "May", revenue: 72, expenses: 48 },
    { month: "Jun", revenue: 85, expenses: 52 },
  ],
  cashFlowData: [
    { month: "Jan", inflow: 48, outflow: 42 },
    { month: "Feb", inflow: 55, outflow: 45 },
    { month: "Mar", inflow: 65, outflow: 48 },
    { month: "Apr", inflow: 62, outflow: 50 },
    { month: "May", inflow: 78, outflow: 55 },
    { month: "Jun", inflow: 92, outflow: 60 },
  ],
  ratios: {
    burnRate: "₹45L/month",
    runway: "18 months",
    grossMargin: "72%",
    ebitda: "₹1.2Cr",
  },
}

const documents = [
  { category: "Legal", name: "Shareholders Agreement", date: "Jul 15, 2024", size: "2.4 MB" },
  { category: "Legal", name: "Articles of Association", date: "Jan 10, 2024", size: "1.8 MB" },
  { category: "Financial", name: "Q2 2024 Financial Statements", date: "Jul 20, 2024", size: "3.2 MB" },
  { category: "Financial", name: "Annual Report 2023", date: "Mar 15, 2024", size: "5.1 MB" },
  { category: "Due Diligence", name: "Technical Due Diligence Report", date: "Jun 01, 2024", size: "4.5 MB" },
  { category: "Compliance", name: "GST Registration Certificate", date: "Apr 01, 2024", size: "0.5 MB" },
]

const updates = [
  {
    date: "Aug 1, 2024",
    title: "Q2 2024 Investor Update",
    content: "We achieved 142% YoY growth this quarter, crossing ₹8Cr ARR. Key highlights include launching 3 new enterprise features and expanding to 50 new customers.",
    attachments: ["Q2_Presentation.pdf", "Financial_Summary.xlsx"],
  },
  {
    date: "Jul 15, 2024",
    title: "Board Meeting Minutes - July 2024",
    content: "Discussed Series A fundraise strategy, product roadmap for H2, and key hires. Approved budget increase for marketing.",
    attachments: ["Board_Minutes_Jul2024.pdf"],
  },
  {
    date: "May 1, 2024",
    title: "Q1 2024 Investor Update",
    content: "Strong quarter with 35% QoQ growth. Successfully closed 20 new enterprise deals and reduced churn to below 2%.",
    attachments: ["Q1_Presentation.pdf"],
  },
]

const capTableData = [
  { name: "Founders", value: 55, color: "#3B82F6" },
  { name: "Investors", value: 30, color: "#10B981" },
  { name: "ESOP Pool", value: 15, color: "#F59E0B" },
]

const shareholderTable = [
  { name: "Arjun Mehta", type: "Founder", shares: "5,500,000", percentage: "27.5%" },
  { name: "Priya Sharma", type: "Founder", shares: "5,500,000", percentage: "27.5%" },
  { name: "Aditya Sharma", type: "Investor", shares: "2,000,000", percentage: "10%", highlight: true },
  { name: "ABC Ventures", type: "Investor", shares: "2,500,000", percentage: "12.5%" },
  { name: "XYZ Fund", type: "Investor", shares: "1,500,000", percentage: "7.5%" },
  { name: "ESOP Pool", type: "Reserved", shares: "3,000,000", percentage: "15%" },
]

export default function InvestorStartupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [activeTab, setActiveTab] = useState("Overview")

  const startup = startups.find((s) => s.id === resolvedParams.id)

  if (!startup) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Back link */}
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-3xl">
            {startup.logo}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{startup.name}</h1>
            <p className="text-muted-foreground">{startup.tagline}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Tabs */}
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

        {/* Tab Content */}
        {activeTab === "Overview" && (
          <div className="space-y-8">
            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "ARR", value: startup.metrics.revenue, icon: TrendingUp },
                { label: "Customers", value: startup.metrics.users, icon: Users },
                { label: "Runway", value: startup.metrics.runway, icon: Calendar },
                { label: "MRR", value: startup.metrics.mrr, icon: Building2 },
              ].map((metric) => (
                <div key={metric.label} className="gradient-card rounded-xl border border-border p-4">
                  <metric.icon className="w-5 h-5 text-primary mb-2" />
                  <p className="text-lg font-bold text-foreground tabular-nums">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="gradient-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">About {startup.name}</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">{startup.description}</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-foreground mb-2">The Problem</h3>
                  <p className="text-sm text-muted-foreground">{startup.problem}</p>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2">Our Solution</h3>
                  <p className="text-sm text-muted-foreground">{startup.solution}</p>
                </div>
              </div>
            </div>

            {/* Valuation Chart */}
            <div className="gradient-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Valuation Trend</h3>
                <span className="text-[#10B981] font-semibold flex items-center gap-0.5">
                  +{startup.growth}%
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={startup.valuationHistory}>
                    <defs>
                      <linearGradient id="valGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" vertical={false} />
                    <XAxis dataKey="date" stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E2D45' }} />
                    <YAxis stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}Cr`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A2235', border: '1px solid #1E2D45', borderRadius: '10px', color: '#F1F5F9' }} formatter={(v: number) => [`₹${v}Cr`, 'Valuation']} />
                    <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#valGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Financials" && (
          <div className="space-y-8">
            {/* P&L Chart */}
            <div className="gradient-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Revenue vs Expenses</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={financialData.plData}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" vertical={false} />
                    <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E2D45' }} />
                    <YAxis stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}L`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A2235', border: '1px solid #1E2D45', borderRadius: '10px', color: '#F1F5F9' }} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#expenseGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cash Flow Chart */}
            <div className="gradient-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Monthly Cash Flow</h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialData.cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" vertical={false} />
                    <XAxis dataKey="month" stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#1E2D45' }} />
                    <YAxis stroke="#475569" tick={{ fill: '#94A3B8', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}L`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A2235', border: '1px solid #1E2D45', borderRadius: '10px', color: '#F1F5F9' }} />
                    <Legend />
                    <Bar dataKey="inflow" name="Inflow" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="outflow" name="Outflow" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Key Ratios */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Burn Rate", value: financialData.ratios.burnRate },
                { label: "Runway", value: financialData.ratios.runway },
                { label: "Gross Margin", value: financialData.ratios.grossMargin },
                { label: "EBITDA", value: financialData.ratios.ebitda },
              ].map((ratio) => (
                <div key={ratio.label} className="gradient-card rounded-xl border border-border p-4">
                  <p className="text-lg font-bold text-foreground tabular-nums">{ratio.value}</p>
                  <p className="text-xs text-muted-foreground">{ratio.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Documents" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20">
              <AlertCircle className="w-5 h-5 text-[#F59E0B]" />
              <p className="text-sm text-[#F59E0B]">Document access is logged. Downloaded files are watermarked.</p>
            </div>

            <div className="gradient-card rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/50 border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Document</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Category</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Date</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Size</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, index) => (
                    <tr key={index} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{doc.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{doc.category}</td>
                      <td className="p-4 text-sm text-muted-foreground">{doc.date}</td>
                      <td className="p-4 text-sm text-muted-foreground tabular-nums">{doc.size}</td>
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
              <div key={index} className="gradient-card rounded-xl border border-border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">{update.date}</span>
                    <h3 className="text-lg font-semibold text-foreground mt-2">{update.title}</h3>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">{update.content}</p>
                {update.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {update.attachments.map((attachment, i) => (
                      <button key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm text-foreground hover:bg-secondary/80 transition-colors">
                        <FileText className="w-4 h-4" />
                        {attachment}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "Cap Table" && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Donut Chart */}
            <div className="gradient-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Ownership Distribution</h3>
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
                      {capTableData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1A2235', border: '1px solid #1E2D45', borderRadius: '10px', color: '#F1F5F9' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">10%</p>
                    <p className="text-xs text-muted-foreground">Your Stake</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shareholder Table */}
            <div className="gradient-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Shareholders</h3>
              <div className="space-y-3">
                {shareholderTable.map((holder, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg",
                      holder.highlight ? "bg-primary/10 border border-primary/20" : "bg-secondary/50"
                    )}
                  >
                    <div>
                      <p className={cn("text-sm font-medium", holder.highlight ? "text-primary" : "text-foreground")}>
                        {holder.name}
                        {holder.highlight && <span className="ml-2 text-xs">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{holder.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground tabular-nums">{holder.percentage}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">{holder.shares} shares</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
