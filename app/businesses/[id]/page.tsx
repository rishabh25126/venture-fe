"use client"

import { useState, use } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  ArrowUpRight, 
  Building2, 
  Calendar, 
  MapPin, 
  Users, 
  Linkedin,
  FileText,
  TrendingUp,
  Lock,
  X,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { useMutation } from "@tanstack/react-query"

const tabs = ["Overview", "Team", "Metrics", "Pitch Deck"]

const sectorColors: Record<string, { bg: string; text: string }> = {
  "Food & Beverages": { bg: "bg-[#3B2A00]", text: "text-[#FCD34D]" },
  "Fashion & Retail": { bg: "bg-[#3D1F5C]", text: "text-[#C4B5FD]" },
  Laundromats: { bg: "bg-[#1E3A5F]", text: "text-[#93C5FD]" },
  "Pet Industry": { bg: "bg-[#14432A]", text: "text-[#6EE7B7]" },
}

const stageColors: Record<string, { bg: string; text: string }> = {
  "Pre-seed": { bg: "bg-secondary", text: "text-muted-foreground" },
  Seed: { bg: "bg-[#1E3A5F]", text: "text-[#60A5FA]" },
  "Series A": { bg: "bg-[#3D1F5C]", text: "text-[#A78BFA]" },
  "Series B": { bg: "bg-[#14432A]", text: "text-[#34D399]" },
}

function formatFundingAsk(amount?: number) {
  if (!amount) return "TBD"
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 1)}Cr`
  return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)}L`
}

function normalizeBusiness(business: any) {
  const growth = business.metrics?.growthPercent || 0

  return {
    _id: business._id,
    id: business.slug,
    name: business.name,
    tagline: business.tagline,
    logo: business.logo || "🏢",
    sector: business.sector,
    stage: business.stage,
    fundingAsk: formatFundingAsk(business.fundingAsk),
    fundingProgress: 0,
    founded: business.createdAt ? new Date(business.createdAt).getFullYear().toString() : "TBD",
    hq: "India",
    teamSize: business.team?.length || 0,
    description: business.description || "Company profile details will be updated soon.",
    problem: business.problem || "Problem statement will be updated soon.",
    solution: business.solution || "Solution details will be updated soon.",
    team: business.team || [],
    growth,
    metrics: {
      revenue: business.metrics?.revenueRange || "TBD",
      users: business.metrics?.userBase || "TBD",
      runway: business.metrics?.runway || "TBD",
      mrr: "TBD",
    },
    valuationHistory: [
      { date: "Seed", value: Math.max(1, Math.round((business.fundingAsk || 10000000) / 10000000)) },
      { date: "Current", value: Math.max(2, Math.round(((business.fundingAsk || 10000000) / 10000000) * (1 + growth / 100))) },
    ],
  }
}

export default function BusinessProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [activeTab, setActiveTab] = useState("Overview")
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false)
  const [interestForm, setInterestForm] = useState({ name: "", email: "", message: "" })

  const { data: business, isLoading, error } = useQuery({
    queryKey: ["business", resolvedParams.id],
    queryFn: async () => {
      const res = await api.get(`/businesses/${resolvedParams.id}`)
      return normalizeBusiness(res.data.data.business)
    },
  })

  const submitInterest = useMutation({
    mutationFn: async (payload: { name: string; email: string; message: string }) => {
      if (!business?._id) {
        throw new Error("Business is not ready yet.")
      }

      const res = await api.post("/requests/interest", {
        businessId: business._id,
        name: payload.name,
        email: payload.email,
        message: payload.message,
      })
      return res.data
    },
    onSuccess: () => {
      setInterestForm({ name: "", email: "", message: "" })
    },
  })

  const handleInterestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitInterest.mutate(interestForm)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="max-w-[960px] mx-auto px-4 md:px-6 text-center py-20">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-muted-foreground animate-pulse" />
            </div>
            <h1 className="text-xl font-semibold text-foreground mb-2">Loading business</h1>
            <p className="text-muted-foreground">Fetching the latest venture profile...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !business) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="max-w-[960px] mx-auto px-4 md:px-6 text-center py-20">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground mb-2">Business not found</h1>
            <p className="text-muted-foreground mb-6">This business profile is unavailable or has been unpublished.</p>
            <Link href="/businesses">
              <Button variant="outline">Back to businesses</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const sectorStyle = sectorColors[business.sector] || { bg: "bg-secondary", text: "text-muted-foreground" }
  const stageStyle = stageColors[business.stage] || { bg: "bg-secondary", text: "text-muted-foreground" }

  return (
    <main className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6">
          {/* Back link */}
          <Link 
            href="/businesses" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Businesses
          </Link>

          <div className="grid lg:grid-cols-[1fr,320px] gap-8">
            {/* Main Content */}
            <div>
              {/* Hero */}
              <div className="gradient-card rounded-xl border border-border p-6 md:p-8 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center text-4xl shrink-0">
                    {business.logo}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide", sectorStyle.bg, sectorStyle.text)}>
                        {business.sector}
                      </span>
                      <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide", stageStyle.bg, stageStyle.text)}>
                        {business.stage}
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{business.name}</h1>
                    <p className="text-muted-foreground">{business.tagline}</p>
                  </div>
                </div>

                {/* Funding Banner */}
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Capital Ask</p>
                    <p className="text-2xl font-bold text-primary tabular-nums">{business.fundingAsk}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-muted-foreground mb-1">Progress</p>
                      <p className="text-lg font-semibold text-foreground tabular-nums">{business.fundingProgress}%</p>
                    </div>
                    <Button className="sm:w-auto w-full" onClick={() => setIsInterestModalOpen(true)}>
                      Express Interest
                    </Button>
                  </div>
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
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">Business Summary</h2>
                    <p className="text-muted-foreground leading-relaxed">{business.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="gradient-card rounded-xl border border-border p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-3">The Problem</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{business.problem}</p>
                    </div>
                    <div className="gradient-card rounded-xl border border-border p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-3">Our Solution</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{business.solution}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Team" && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-6">Leadership Team</h2>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {business.team.map((member) => (
                      <div key={member.name} className="gradient-card rounded-xl border border-border p-5 text-center">
                        <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-foreground">
                          {member.name.charAt(0)}
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{member.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{member.role}</p>
                        {member.linkedin && (
                          <a 
                            href={member.linkedin}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={`${member.name} LinkedIn`}
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "Metrics" && (
                <div className="space-y-8">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "ARR", value: business.metrics.revenue, icon: TrendingUp },
                      { label: "Customers", value: business.metrics.users, icon: Users },
                      { label: "Runway", value: business.metrics.runway, icon: Calendar },
                      { label: "MRR", value: business.metrics.mrr, icon: Building2 },
                    ].map((metric) => (
                      <div key={metric.label} className="gradient-card rounded-xl border border-border p-4">
                        <metric.icon className="w-5 h-5 text-primary mb-2" />
                        <p className="text-lg font-bold text-foreground tabular-nums">{metric.value}</p>
                        <p className="text-xs text-muted-foreground">{metric.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Valuation Chart */}
                  <div className="gradient-card rounded-xl border border-border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-foreground">Valuation Trend</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Growth</span>
                        <span className="text-[#10B981] font-semibold flex items-center gap-0.5">
                          +{business.growth}%
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={business.valuationHistory}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" vertical={false} />
                          <XAxis 
                            dataKey="date" 
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
                            formatter={(value: number) => [`₹${value}Cr`, 'Valuation']}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Pitch Deck" && (
                <div>
                  <div className="gradient-card rounded-xl border border-border p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Deal Materials Require Access</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Express your interest to request access to the full investment deck and detailed financials.
                    </p>
                    <Button onClick={() => setIsInterestModalOpen(true)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Request Access
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Facts */}
              <div className="gradient-card rounded-xl border border-border p-5 sticky top-24">
                <h3 className="font-semibold text-foreground mb-4">Quick Facts</h3>
                <div className="space-y-4">
                  {[
                    { icon: Calendar, label: "Founded", value: business.founded },
                    { icon: MapPin, label: "Headquarters", value: business.hq },
                    { icon: Building2, label: "Stage", value: business.stage },
                    { icon: FileText, label: "Business Group", value: business.sector },
                    { icon: Users, label: "Team Size", value: `${business.teamSize} people` },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-medium text-foreground">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isInterestModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm p-4">
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-lg gradient-card rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border p-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Express Interest</h2>
                  <p className="text-sm text-muted-foreground mt-1">Send your interest directly to the admin review queue</p>
                </div>
                <button
                  onClick={() => {
                    setIsInterestModalOpen(false)
                    if (!submitInterest.isSuccess) {
                      setInterestForm({ name: "", email: "", message: "" })
                    }
                    submitInterest.reset()
                  }}
                  className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  aria-label="Close express interest modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submitInterest.isSuccess ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Interest Submitted</h3>
                  <p className="text-muted-foreground mb-6">The admin team can now review your message from the request page.</p>
                  <Button
                    onClick={() => {
                      setIsInterestModalOpen(false)
                      submitInterest.reset()
                    }}
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleInterestSubmit} className="p-6 space-y-4">
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={interestForm.name}
                    onChange={(e) => setInterestForm({ ...interestForm, name: e.target.value })}
                    required
                    className="h-11 bg-secondary/50 border-border"
                  />
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={interestForm.email}
                    onChange={(e) => setInterestForm({ ...interestForm, email: e.target.value })}
                    required
                    className="h-11 bg-secondary/50 border-border"
                  />
                  <textarea
                    placeholder="Message (optional)"
                    value={interestForm.message}
                    onChange={(e) => setInterestForm({ ...interestForm, message: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                  />

                  {submitInterest.isError && (
                    <div className="flex items-center gap-2 text-sm text-[#EF4444] bg-[#EF4444]/10 p-3 rounded-lg border border-[#EF4444]/20">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p>{(submitInterest.error as any)?.response?.data?.error || "Failed to submit interest"}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsInterestModalOpen(false)
                        setInterestForm({ name: "", email: "", message: "" })
                        submitInterest.reset()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="w-full" disabled={submitInterest.isPending}>
                      {submitInterest.isPending ? "Submitting..." : "Submit Interest"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
