"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BusinessCardProps {
  id: string
  name: string
  tagline: string
  logo: string
  sector: string
  stage: string
  fundingAsk: string
  revenueRange: string
  growth: number
  fundingProgress: number
}

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

export function BusinessCard({
  id,
  name,
  tagline,
  logo,
  sector,
  stage,
  fundingAsk,
  revenueRange,
  growth,
  fundingProgress,
}: BusinessCardProps) {
  const sectorStyle = sectorColors[sector] || { bg: "bg-secondary", text: "text-muted-foreground" }
  const stageStyle = stageColors[stage] || { bg: "bg-secondary", text: "text-muted-foreground" }

  return (
    <div className="group relative gradient-card rounded-xl border border-border p-5 transition-all duration-200 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
      {/* Top badges */}
      <div className="flex items-center gap-2 mb-4">
        <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide", sectorStyle.bg, sectorStyle.text)}>
          {sector}
        </span>
        <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide", stageStyle.bg, stageStyle.text)}>
          {stage}
        </span>
      </div>

      {/* Company info */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-foreground overflow-hidden shrink-0">
          {logo ? (
            <span>{logo}</span>
          ) : (
            name.charAt(0)
          )}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-foreground truncate">{name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{tagline}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border my-4" />

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Capital Ask</p>
          <p className="text-sm font-semibold tabular-nums text-foreground">{fundingAsk}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Revenue</p>
          <p className="text-sm font-semibold tabular-nums text-foreground">{revenueRange}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Growth</p>
          <p className={cn("text-sm font-semibold tabular-nums flex items-center gap-0.5", growth >= 0 ? "text-[#10B981]" : "text-[#EF4444]")}>
            {growth >= 0 ? "+" : ""}{growth}%
            <ArrowUpRight className={cn("w-3.5 h-3.5", growth < 0 && "rotate-90")} />
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>Funding Progress</span>
          <span>{fundingProgress}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${fundingProgress}%` }}
          />
        </div>
      </div>

      {/* CTA */}
      <Button className="w-full" asChild>
        <Link href={`/businesses/${id}`}>
          Express Interest
        </Link>
      </Button>
    </div>
  )
}
