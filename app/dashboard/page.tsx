"use client"

import Link from "next/link"
import { Calendar, FileText, Bell, TrendingUp, Briefcase, PercentIcon, Building2, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { useAppSelector } from "@/lib/store/hooks"
import { useState } from "react"
import { RequestEquityDialog } from "@/components/request-equity-dialog"

// Mock investor portfolio data
const portfolioData = {
  totalInvested: "₹8.5Cr",
  portfolioValue: "₹14.2Cr",
  irr: 42,
  activeCompanies: 6,
}

// Portfolio companies fetched from API

const portfolioHistory = [
  { month: "Jan", value: 8.5 },
  { month: "Feb", value: 9.2 },
  { month: "Mar", value: 10.1 },
  { month: "Apr", value: 9.8 },
  { month: "May", value: 11.5 },
  { month: "Jun", value: 12.3 },
  { month: "Jul", value: 13.1 },
  { month: "Aug", value: 14.2 },
]

const recentUpdates = [
  {
    company: "PayStack AI",
    type: "Investor Update",
    title: "Q2 2024 Results: 142% YoY Growth",
    date: "2 days ago",
    logo: "💳"
  },
  {
    company: "MediSync",
    type: "Board Minutes",
    title: "Strategic Planning Session - July 2024",
    date: "5 days ago",
    logo: "🏥"
  },
  {
    company: "CloudScale",
    type: "New Document",
    title: "Updated Cap Table",
    date: "1 week ago",
    logo: "☁️"
  },
]

const upcomingEvents = [
  { title: "PayStack AI Board Meeting", date: "Aug 15, 2024", time: "10:00 AM" },
  { title: "MediSync AGM", date: "Aug 22, 2024", time: "2:00 PM" },
  { title: "Portfolio Review Call", date: "Aug 30, 2024", time: "11:00 AM" },
]

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)

  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening"

  const { data: portfolioCompanies = [], isLoading } = useQuery({
    queryKey: ['my-businesses'],
    queryFn: async () => {
      // Admin users don't have investor access records, so this returns empty unless we handle it
      const res = await api.get('/access/my-businesses');
      return res.data.data.businesses.map((s: any) => ({
        id: s.business.slug,
        name: s.business.name,
        sector: s.business.sector,
        invested: `₹${(s.investedAmount / 100000).toFixed(2)}L`,
        shares: s.shares,
        equity: `${s.equityPercentage}%`,
        currentValue: "TBD", // To be implemented dynamically later
        change: 0,
        logo: s.business.logo || '🏢'
      }));
    },
    // Only fetch if logged in
    enabled: !authLoading && user?.role === 'investor'
  });

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 text-muted-foreground">Loading investor session...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout type="investor" userName={user?.name || "Investor"} userRole="Investor">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{greeting}, {user?.name || 'Investor'}</h1>
            <p className="text-muted-foreground">Here&apos;s your portfolio overview</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="hidden sm:flex">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
            </Button>
            <Button onClick={() => setIsRequestModalOpen(true)}>
              Request Allocation
            </Button>
          </div>
        </div>

        <RequestEquityDialog isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />

        {/* Metric Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Invested", value: portfolioData.totalInvested, icon: TrendingUp, color: "text-primary" },
            { label: "Portfolio Value", value: portfolioData.portfolioValue, icon: Briefcase, color: "text-[#10B981]" },
            { label: "IRR", value: `${portfolioData.irr}%`, icon: PercentIcon, color: "text-[#F59E0B]" },
            { label: "Active Companies", value: portfolioData.activeCompanies.toString(), icon: Building2, color: "text-[#A78BFA]" },
          ].map((metric) => (
            <div key={metric.label} className="gradient-card rounded-xl border border-border p-5">
              <metric.icon className={cn("w-5 h-5 mb-3", metric.color)} />
              <p className="text-2xl font-bold text-foreground tabular-nums">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Portfolio Value Chart */}
            <div className="gradient-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Portfolio Value</h2>
                  <p className="text-sm text-muted-foreground">Performance over time</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">YTD</span>
                  <span className="text-[#10B981] font-semibold flex items-center gap-0.5">
                    +67%
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={portfolioHistory}>
                    <defs>
                      <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      stroke="#475569" 
                      tick={{ fill: '#94A3B8', fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: '#1E2D45' }}
                    />
                    <YAxis 
                      stroke="#475569"
                      tick={{ fill: '#94A3B8', fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${value}Cr`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1A2235',
                        border: '1px solid #1E2D45',
                        borderRadius: '10px',
                        color: '#F1F5F9',
                      }}
                      formatter={(value: number) => [`₹${value}Cr`, 'Portfolio Value']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#10B981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#portfolioGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Portfolio Companies */}
            <div className="gradient-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">My Portfolio</h2>
                <Link href="/dashboard/portfolio" className="text-sm text-primary hover:text-primary/80">
                  View all
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">Company</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">Sector</th>
                      <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">Invested</th>
                      <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">Equity</th>
                      <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3">Change</th>
                      <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioCompanies.length === 0 && !isLoading && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No investments found. Request access to businesses to see them here.
                        </td>
                      </tr>
                    )}
                    {isLoading && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-primary animate-pulse">
                          Loading portfolio...
                        </td>
                      </tr>
                    )}
                    {portfolioCompanies.map((company: any) => (
                      <tr key={company.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm">
                              {company.logo}
                            </div>
                            <span className="font-medium text-foreground">{company.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">{company.sector}</td>
                        <td className="py-4 text-right text-sm tabular-nums text-foreground">{company.invested}</td>
                        <td className="py-4 text-right text-sm tabular-nums text-foreground">{company.equity}</td>
                        <td className="py-4 text-right">
                          <span className={cn(
                            "text-sm font-medium tabular-nums flex items-center justify-end gap-0.5",
                            company.change >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
                          )}>
                            {company.change >= 0 ? "+" : ""}{company.change}%
                            {company.change >= 0 ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            )}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <Link 
                            href={`/dashboard/businesses/${company.id}`}
                            className="text-sm text-primary hover:text-primary/80"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Updates */}
            <div className="gradient-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-4">Recent Updates</h3>
              <div className="space-y-4">
                {recentUpdates.map((update, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm shrink-0">
                      {update.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-primary">{update.type}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">{update.title}</p>
                      <p className="text-xs text-muted-foreground">{update.company} • {update.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-4 text-primary">
                <FileText className="w-4 h-4 mr-2" />
                View All Updates
              </Button>
            </div>

            {/* Upcoming Events */}
            <div className="gradient-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-sm font-medium text-foreground mb-1">{event.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{event.date}</span>
                      <span>•</span>
                      <span>{event.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-4 text-primary">
                <Calendar className="w-4 h-4 mr-2" />
                View Calendar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
