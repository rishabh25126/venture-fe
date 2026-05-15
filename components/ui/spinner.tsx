"use client"

import { Bouncy } from "ldrs/react"
import "ldrs/react/Bouncy.css"
import { cn } from "@/lib/utils"

type SpinnerProps = {
  className?: string
  size?: number
  color?: string
  speed?: number
  "aria-label"?: string
}

const DEFAULT_SPINNER_COLOR = "hsl(var(--primary))"

function Spinner({
  className,
  size = 18,
  color = DEFAULT_SPINNER_COLOR,
  speed = 1.3,
  "aria-label": ariaLabel = "Loading",
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <Bouncy size={size} color={color} speed={speed} />
    </span>
  )
}

export { Spinner, DEFAULT_SPINNER_COLOR }
