"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useIsFetching, useIsMutating } from "@tanstack/react-query"
import { TrendingUp } from "lucide-react"
import { DEFAULT_SPINNER_COLOR, Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { useRequestFeedback } from "@/lib/ui/request-feedback-store"

export function ScreenLoader({
  title = "Loading",
  description,
  className,
  compact = false,
}: {
  title?: string
  description?: string
  className?: string
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        compact ? "min-h-[320px] bg-background" : "min-h-screen bg-background",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center px-4",
          compact ? "min-h-[320px]" : "min-h-screen"
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm rounded-2xl border border-border bg-card/90 p-8 text-center shadow-xl backdrop-blur"
        >
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[0_0_32px_rgba(37,99,235,0.18)]">
            <TrendingUp className="h-7 w-7" />
          </div>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/5">
            <Spinner size={26} />
          </div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {description ? (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </motion.div>
      </div>
    </div>
  )
}

export function GlobalLoader() {
  const { activeRequestCount, blockingCount } = useRequestFeedback()
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  const [isVisible, setIsVisible] = useState(false)
  const shownAtRef = useRef<number | null>(null)

  const hasReactQueryFallbackActivity =
    activeRequestCount === 0 && isFetching + isMutating > 0
  const hasActivity = activeRequestCount > 0 || hasReactQueryFallbackActivity

  const statusLabel = useMemo(() => {
    if (activeRequestCount > 1 || isFetching + isMutating > 1) {
      return "Syncing data"
    }
    return "Loading"
  }, [activeRequestCount, isFetching, isMutating])

  useEffect(() => {
    if (blockingCount > 0) {
      setIsVisible(false)
      shownAtRef.current = null
      return
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null

    if (hasActivity) {
      timeoutId = setTimeout(() => {
        shownAtRef.current = Date.now()
        setIsVisible(true)
      }, 120)
    } else if (shownAtRef.current) {
      const elapsed = Date.now() - shownAtRef.current
      const remaining = Math.max(0, 240 - elapsed)
      timeoutId = setTimeout(() => {
        shownAtRef.current = null
        setIsVisible(false)
      }, remaining)
    } else {
      setIsVisible(false)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [blockingCount, hasActivity])

  if (!isVisible || blockingCount > 0) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        key="global-loader"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pointer-events-none fixed inset-x-0 top-0 z-[70]"
      >
        <div className="relative h-1.5 w-full overflow-hidden bg-primary/10">
          <motion.div
            className="h-full w-1/3 rounded-full bg-primary shadow-[0_0_20px_rgba(37,99,235,0.5)]"
            animate={{ x: ["-40%", "250%"] }}
            transition={{ duration: 1, ease: "easeInOut", repeat: Infinity }}
          />
          <div className="absolute right-4 top-2.5 md:right-6">
            <div className="rounded-full border border-border/70 bg-card/90 px-3 py-1.5 shadow-lg backdrop-blur">
              <Spinner
                size={18}
                speed={1.35}
                color={DEFAULT_SPINNER_COLOR}
                aria-label={statusLabel}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
