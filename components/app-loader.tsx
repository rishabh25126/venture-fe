"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useRequestFeedback } from "@/lib/ui/request-feedback-store";

export function ScreenLoader({
  title = "Loading",
  description,
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <div className="flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm rounded-2xl border border-border bg-card/90 p-8 text-center shadow-xl backdrop-blur"
        >
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[0_0_32px_rgba(37,99,235,0.18)]">
            <TrendingUp className="h-7 w-7" />
          </div>
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/5">
            <Spinner className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {description ? (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}

export function GlobalLoader() {
  const { activeRequestCount, blockingCount } = useRequestFeedback();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const [isVisible, setIsVisible] = useState(false);
  const shownAtRef = useRef<number | null>(null);

  const hasReactQueryFallbackActivity =
    activeRequestCount === 0 && isFetching + isMutating > 0;
  const hasActivity = activeRequestCount > 0 || hasReactQueryFallbackActivity;

  const statusLabel = useMemo(() => {
    if (activeRequestCount > 1 || isFetching + isMutating > 1) {
      return "Syncing data";
    }
    return "Loading";
  }, [activeRequestCount, isFetching, isMutating]);

  useEffect(() => {
    if (blockingCount > 0) {
      setIsVisible(false);
      shownAtRef.current = null;
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    if (hasActivity) {
      timeoutId = setTimeout(() => {
        shownAtRef.current = Date.now();
        setIsVisible(true);
      }, 120);
    } else if (shownAtRef.current) {
      const elapsed = Date.now() - shownAtRef.current;
      const remaining = Math.max(0, 240 - elapsed);
      timeoutId = setTimeout(() => {
        shownAtRef.current = null;
        setIsVisible(false);
      }, remaining);
    } else {
      setIsVisible(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [blockingCount, hasActivity]);

  if (!isVisible || blockingCount > 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        key="global-loader"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="pointer-events-none fixed inset-x-0 top-0 z-[70]"
      >
        <div className="h-1 w-full overflow-hidden bg-primary/10">
          <motion.div
            className="h-full w-1/3 rounded-full bg-primary shadow-[0_0_24px_rgba(37,99,235,0.55)]"
            animate={{ x: ["-35%", "240%"] }}
            transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
          />
        </div>
        <div className="mx-auto mt-3 flex max-w-[1280px] justify-end px-4 md:px-6">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-2 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur">
            <Spinner className="h-3.5 w-3.5 text-primary" />
            <span>{statusLabel}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
