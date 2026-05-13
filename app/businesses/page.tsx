"use client"

import { useState, useMemo } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BusinessCard } from "@/components/business-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ErrorState } from "@/components/ui/error-state"
import { sectors, stages } from "@/lib/data"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"

export default function BusinessesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSectors, setSelectedSectors] = useState<string[]>([])
  const [selectedStages, setSelectedStages] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>("recent")
  const [showFilters, setShowFilters] = useState(false)

  const { data: fetchedBusinesses = [], isLoading, error } = useQuery({
    queryKey: ['businesses'],
    queryFn: async () => {
      const res = await api.get('/businesses?limit=50');
      // Map backend schema to frontend Business interface
      return res.data.data.businesses.map((s: any) => ({
        id: s.slug,
        name: s.name,
        tagline: s.tagline,
        logo: s.logo || '🏢',
        sector: s.sector,
        stage: s.stage,
        fundingAsk: `₹${(s.fundingAsk / 10000000).toFixed(0)}Cr`,
        fundingAskNum: s.fundingAsk,
        revenueRange: s.metrics?.revenueRange || 'TBD',
        growth: s.metrics?.growthPercent || 0,
        fundingProgress: 0,
      }));
    }
  });


  const filteredBusinesses = useMemo(() => {
    let result = [...fetchedBusinesses]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.tagline.toLowerCase().includes(query) ||
          s.sector.toLowerCase().includes(query)
      )
    }

    // Business group filter
    if (selectedSectors.length > 0) {
      result = result.filter((s) => selectedSectors.includes(s.sector))
    }

    // Stage filter
    if (selectedStages.length > 0) {
      result = result.filter((s) => selectedStages.includes(s.stage))
    }

    // Sorting
    switch (sortBy) {
      case "funding-high":
        result.sort((a, b) => b.fundingAskNum - a.fundingAskNum)
        break
      case "funding-low":
        result.sort((a, b) => a.fundingAskNum - b.fundingAskNum)
        break
      case "growth-high":
        result.sort((a, b) => b.growth - a.growth)
        break
      case "growth-low":
        result.sort((a, b) => a.growth - b.growth)
        break
      default:
        // Most recent - keep original order
        break
    }

    return result
  }, [fetchedBusinesses, searchQuery, selectedSectors, selectedStages, sortBy])

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    )
  }

  const toggleStage = (stage: string) => {
    setSelectedStages((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    )
  }

  const clearFilters = () => {
    setSelectedSectors([])
    setSelectedStages([])
    setSearchQuery("")
    setSortBy("recent")
  }

  const hasActiveFilters = selectedSectors.length > 0 || selectedStages.length > 0 || searchQuery

  return (
    <main className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Business Listings</h1>
            <p className="text-muted-foreground">Discover high-conviction ventures across featured business groups and beyond</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-[260px] shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="gradient-card rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Filters</h3>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-primary hover:text-primary/80"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Business Groups */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Business Group</h4>
                    <div className="space-y-2">
                      {sectors.map((sector) => (
                        <label
                          key={sector}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded border transition-colors flex items-center justify-center",
                              selectedSectors.includes(sector)
                                ? "bg-primary border-primary"
                                : "border-border group-hover:border-primary/50"
                            )}
                          >
                            {selectedSectors.includes(sector) && (
                              <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            {sector}
                          </span>
                          <input
                            type="checkbox"
                            checked={selectedSectors.includes(sector)}
                            onChange={() => toggleSector(sector)}
                            className="sr-only"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Stages */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">Stage</h4>
                    <div className="space-y-2">
                      {stages.map((stage) => (
                        <label
                          key={stage}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded border transition-colors flex items-center justify-center",
                              selectedStages.includes(stage)
                                ? "bg-primary border-primary"
                                : "border-border group-hover:border-primary/50"
                            )}
                          >
                            {selectedStages.includes(stage) && (
                              <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            {stage}
                          </span>
                          <input
                            type="checkbox"
                            checked={selectedStages.includes(stage)}
                            onChange={() => toggleStage(stage)}
                            className="sr-only"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Search and Sort Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search businesses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 bg-card border-border"
                  />
                </div>
                <div className="flex gap-3">
                  {/* Mobile filter toggle */}
                  <Button
                    variant="outline"
                    className="lg:hidden"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                      <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {selectedSectors.length + selectedStages.length}
                      </span>
                    )}
                  </Button>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-11 px-4 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="funding-high">Funding: High to Low</option>
                    <option value="funding-low">Funding: Low to High</option>
                    <option value="growth-high">Growth: High to Low</option>
                    <option value="growth-low">Growth: Low to High</option>
                  </select>
                </div>
              </div>

              {/* Mobile Filters */}
              {showFilters && (
                <div className="lg:hidden mb-6 gradient-card rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Filters</h3>
                    <button onClick={() => setShowFilters(false)}>
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3">Business Group</h4>
                      <div className="flex flex-wrap gap-2">
                        {sectors.map((sector) => (
                          <button
                            key={sector}
                            onClick={() => toggleSector(sector)}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                              selectedSectors.includes(sector)
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {sector}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3">Stage</h4>
                      <div className="flex flex-wrap gap-2">
                        {stages.map((stage) => (
                          <button
                            key={stage}
                            onClick={() => toggleStage(stage)}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                              selectedStages.includes(stage)
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {stage}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="mt-4 text-primary"
                    >
                      Clear all filters
                    </Button>
                  )}
                </div>
              )}

              {/* Results count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredBusinesses.length} {filteredBusinesses.length === 1 ? "business" : "businesses"}
                </p>
              </div>

              {/* Business Grid */}
              {isLoading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="gradient-card rounded-xl border border-border p-5"
                    >
                      <div className="mb-4 flex gap-2">
                        <div className="h-6 w-28 animate-pulse rounded-full bg-secondary" />
                        <div className="h-6 w-20 animate-pulse rounded-full bg-secondary" />
                      </div>
                      <div className="mb-4 flex items-start gap-3">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-secondary" />
                        <div className="flex-1 space-y-2">
                          <div className="h-5 w-2/3 animate-pulse rounded bg-secondary" />
                          <div className="h-4 w-full animate-pulse rounded bg-secondary" />
                        </div>
                      </div>
                      <div className="my-4 h-px bg-border" />
                      <div className="mb-4 grid grid-cols-3 gap-3">
                        {Array.from({ length: 3 }).map((__, metricIndex) => (
                          <div key={metricIndex} className="space-y-2">
                            <div className="h-3 w-16 animate-pulse rounded bg-secondary" />
                            <div className="h-4 w-14 animate-pulse rounded bg-secondary" />
                          </div>
                        ))}
                      </div>
                      <div className="mb-4 space-y-2">
                        <div className="h-3 w-24 animate-pulse rounded bg-secondary" />
                        <div className="h-2 animate-pulse rounded-full bg-secondary" />
                      </div>
                      <div className="h-10 animate-pulse rounded-lg bg-secondary" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <ErrorState
                  title="Unable to load businesses"
                  message="We couldn't load this data right now."
                  actionLabel="Try again"
                  onAction={() => window.location.reload()}
                />
              ) : filteredBusinesses.length > 0 ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredBusinesses.map((business) => (
                    <BusinessCard key={business.id} {...business} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No businesses found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
